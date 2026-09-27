# services/scan_service.py

import os
import re
import uuid
import shutil
from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from models import (
    Inspection,
    InspectionImage,
    OCRDetection,
    RuleResult,
    RuleResultEvidence,
)


# ============================================================
# CONFIG
# ============================================================

UPLOAD_DIR = Path("uploads/inspections")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# INSPECTION CODE
# ============================================================

def generate_inspection_code():
    """
    Generate a unique inspection code.

    Example:
    ND-20260925-A1B2C3
    """

    date_part = datetime.now().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:6].upper()

    return f"ND-{date_part}-{random_part}"


# ============================================================
# FILENAME
# ============================================================

def sanitize_filename(filename: str) -> str:
    """
    Make uploaded filenames safe for storage.
    """

    if not filename:
        return "image"

    filename = os.path.basename(filename)

    filename = re.sub(
        r"[^a-zA-Z0-9._-]",
        "_",
        filename
    )

    return filename


# ============================================================
# STATUS NORMALIZATION
# ============================================================

def normalize_rule_status(status):
    """
    Convert rule-engine statuses into database statuses.

    Database statuses:
        PASS
        PARTIAL
        VIOLATION
    """

    if not status:
        return "PARTIAL"

    status = str(status).strip().upper()

    if status in {
        "PASS",
        "PASSED",
        "COMPLIANT",
        "OK"
    }:
        return "PASS"

    if status in {
        "PARTIAL",
        "UNCERTAIN",
        "REQUIRES_ADDITIONAL_IMAGE",
        "REVIEW"
    }:
        return "PARTIAL"

    if status in {
        "VIOLATION",
        "FAIL",
        "FAILED",
        "NON-COMPLIANT",
        "NON_COMPLIANT"
    }:
        return "VIOLATION"

    return "PARTIAL"


# ============================================================
# IMAGE STORAGE
# ============================================================

def save_inspection_image(
    inspection_id,
    uploaded_file,
    image_order=1
):
    """
    Save the uploaded image permanently.

    Returns:
        {
            "original_filename": ...,
            "stored_filename": ...,
            "file_path": ...,
            "mime_type": ...,
            "file_size": ...
        }
    """

    original_filename = sanitize_filename(
        getattr(uploaded_file, "filename", None)
    )

    extension = Path(original_filename).suffix.lower()

    if not extension:
        extension = ".jpg"

    stored_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    inspection_directory = (
        UPLOAD_DIR / str(inspection_id)
    )

    inspection_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    file_path = inspection_directory / stored_filename

    # Handle UploadFile-like objects
    if hasattr(uploaded_file, "file"):
        with open(file_path, "wb") as output:
            shutil.copyfileobj(
                uploaded_file.file,
                output
            )

    # Handle string/path input
    elif isinstance(uploaded_file, (str, Path)):
        shutil.copy2(
            uploaded_file,
            file_path
        )

    else:
        raise ValueError(
            "Unsupported uploaded file type"
        )

    file_size = file_path.stat().st_size

    return {
        "original_filename": original_filename,
        "stored_filename": stored_filename,
        "file_path": str(file_path),
        "mime_type": getattr(
            uploaded_file,
            "content_type",
            None
        ),
        "file_size": file_size,
        "image_order": image_order
    }


# ============================================================
# IOU
# ============================================================

def calculate_iou(box_a, box_b):
    """
    Calculate Intersection over Union between
    two bounding boxes.

    Box format:
        [x1, y1, x2, y2]
    """

    if not box_a or not box_b:
        return 0.0

    try:
        ax1, ay1, ax2, ay2 = map(
            float,
            box_a
        )

        bx1, by1, bx2, by2 = map(
            float,
            box_b
        )
    except Exception:
        return 0.0

    intersection_x1 = max(ax1, bx1)
    intersection_y1 = max(ay1, by1)

    intersection_x2 = min(ax2, bx2)
    intersection_y2 = min(ay2, by2)

    intersection_width = max(
        0,
        intersection_x2 - intersection_x1
    )

    intersection_height = max(
        0,
        intersection_y2 - intersection_y1
    )

    intersection_area = (
        intersection_width *
        intersection_height
    )

    if intersection_area <= 0:
        return 0.0

    area_a = max(
        0,
        ax2 - ax1
    ) * max(
        0,
        ay2 - ay1
    )

    area_b = max(
        0,
        bx2 - bx1
    ) * max(
        0,
        by2 - by1
    )

    union_area = (
        area_a +
        area_b -
        intersection_area
    )

    if union_area <= 0:
        return 0.0

    return intersection_area / union_area


# ============================================================
# EVIDENCE MATCHING
# ============================================================

def find_evidence_detections(
    check,
    db_detections
):
    """
    Find OCR detections associated with a rule result.

    Matching priority:
        1. source_text
        2. bounding-box IoU
    """

    evidence = []

    source_text = str(
        check.get("source_text") or ""
    ).strip().lower()

    check_box = check.get(
        "bounding_box"
    )

    for detection, db_detection in db_detections:

        detection_text = str(
            detection.get("text") or ""
        ).strip().lower()

        matched = False

        # ----------------------------------------------------
        # SOURCE TEXT MATCH
        # ----------------------------------------------------

        if source_text and detection_text:

            if (
                source_text in detection_text
                or detection_text in source_text
            ):
                matched = True

        # ----------------------------------------------------
        # BOUNDING BOX MATCH
        # ----------------------------------------------------

        if not matched and check_box:

            detection_box = detection.get(
                "bounding_box"
            )

            if detection_box:

                try:
                    detection_box_list = [
                        detection_box.get("x1"),
                        detection_box.get("y1"),
                        detection_box.get("x2"),
                        detection_box.get("y2")
                    ]

                    check_box_list = [
                        check_box.get("x1"),
                        check_box.get("y1"),
                        check_box.get("x2"),
                        check_box.get("y2")
                    ]

                    iou = calculate_iou(
                        detection_box_list,
                        check_box_list
                    )

                    if iou >= 0.10:
                        matched = True

                except Exception:
                    pass

        if matched:
            evidence.append(
                db_detection
            )

    return evidence


# ============================================================
# EXTRACT ALL CHECKS
# ============================================================

def extract_all_checks(final_report):
    """
    Combine normal compliance checks and additional rules.
    """

    compliance_report = (
        final_report.get(
            "compliance_report",
            {}
        )
        if isinstance(final_report, dict)
        else {}
    )

    checks = compliance_report.get(
        "checks",
        []
    )

    if not isinstance(checks, list):
        checks = []

    additional_rules = (
        compliance_report.get(
            "additional_rules",
            {}
        )
    )

    if not isinstance(additional_rules, dict):
        additional_rules = {}

    additional_checks = additional_rules.get(
        "checks",
        []
    )

    if not isinstance(additional_checks, list):
        additional_checks = []

    return checks + additional_checks


# ============================================================
# CREATE INSPECTION
# ============================================================

def create_inspection(
    db: Session,
    final_report
):
    """
    Create the main inspection database record.

    IMPORTANT:
    Product information may be stored inside individual
    rule-engine checks rather than directly inside
    compliance_report.

    Therefore this function extracts:
        Product Name
        Brand
        Category
        MRP
        Net Quantity

    from the checks as a fallback.
    """

    if not isinstance(final_report, dict):
        final_report = {}

    compliance_report = final_report.get(
        "compliance_report",
        {}
    )

    if not isinstance(compliance_report, dict):
        compliance_report = {}

    summary = compliance_report.get(
        "summary",
        {}
    )

    if not isinstance(summary, dict):
        summary = {}

    # --------------------------------------------------------
    # TOP LEVEL VALUES
    # --------------------------------------------------------

    product_name = compliance_report.get(
        "product_name"
    )

    brand_name = compliance_report.get(
        "brand_name"
    )

    category = compliance_report.get(
        "category"
    )

    mrp = compliance_report.get(
        "mrp"
    )

    net_quantity = compliance_report.get(
        "net_quantity"
    )

    # --------------------------------------------------------
    # SEARCH RULE CHECKS
    # --------------------------------------------------------

    checks = extract_all_checks(
        final_report
    )

    for check in checks:

        if not isinstance(check, dict):
            continue

        check_name = str(
            check.get("name")
            or check.get("rule_name")
            or check.get("rule")
            or ""
        ).strip().lower()

        value = check.get("value")

        # Some rule results may use source_text
        # when value is unavailable.
        if value is None:
            value = check.get(
                "source_text"
            )

        # ----------------------------------------------------
        # PRODUCT NAME
        # ----------------------------------------------------

        if product_name is None:

            if check_name in {
                "product name",
                "product_name",
                "name of product",
                "product"
            }:

                if value not in (
                    None,
                    "",
                    False
                ):
                    product_name = value

        # ----------------------------------------------------
        # BRAND
        # ----------------------------------------------------

        if brand_name is None:

            if check_name in {
                "brand",
                "brand name",
                "brand_name"
            }:

                if value not in (
                    None,
                    "",
                    False
                ):
                    brand_name = value

        # ----------------------------------------------------
        # CATEGORY
        # ----------------------------------------------------

        if category is None:

            if check_name in {
                "category",
                "product category",
                "product_category"
            }:

                if value not in (
                    None,
                    "",
                    False
                ):
                    category = value

        # ----------------------------------------------------
        # MRP
        # ----------------------------------------------------

        if mrp is None:

            if check_name in {
                "mrp",
                "maximum retail price",
                "maximum retail price (mrp)",
                "maximum_retail_price"
            }:

                if value not in (
                    None,
                    "",
                    False
                ):
                    mrp = value

        # ----------------------------------------------------
        # NET QUANTITY
        # ----------------------------------------------------

        if net_quantity is None:

            if check_name in {
                "net quantity",
                "net_quantity",
                "net weight",
                "net content",
                "quantity"
            }:

                if value not in (
                    None,
                    "",
                    False
                ):
                    net_quantity = value

    # --------------------------------------------------------
    # CREATE DATABASE OBJECT
    # --------------------------------------------------------

    inspection = Inspection(
        inspection_code=generate_inspection_code(),

        inspection_type="physical",

        status="COMPLETED",

        product_name=product_name,
        brand_name=brand_name,
        category=category,
        mrp=mrp,
        net_quantity=net_quantity,

        overall_status=compliance_report.get(
            "status"
        ),

        compliance_percentage=compliance_report.get(
            "compliance_percentage"
        ),

        total_checks=summary.get(
            "total_checks",
            0
        ),

        passed_checks=summary.get(
            "passed",
            0
        ),

        partial_checks=summary.get(
            "partial",
            0
        ),

        failed_checks=summary.get(
            "failed",
            0
        ),

        average_ocr_confidence=None,

        completed_at=datetime.now()
    )

    db.add(inspection)

    db.flush()

    return inspection


# ============================================================
# SAVE OCR DETECTIONS
# ============================================================

def save_ocr_detections(
    db: Session,
    inspection_id,
    image_id,
    ocr_result
):
    """
    Save OCR detections into the database.

    Returns:
        List of tuples:

        [
            (raw_detection, db_detection),
            ...
        ]
    """

    detections = []

    if not isinstance(
        ocr_result,
        dict
    ):
        return detections

    raw_detections = ocr_result.get(
        "detections",
        []
    )

    if not isinstance(
        raw_detections,
        list
    ):
        return detections

    for index, detection in enumerate(
        raw_detections
    ):

        if not isinstance(
            detection,
            dict
        ):
            continue

        text = detection.get(
            "text"
        )

        confidence = detection.get(
            "confidence"
        )

        bounding_box = detection.get(
            "bounding_box",
            {}
        )

        if not isinstance(
            bounding_box,
            dict
        ):
            bounding_box = {}

        x1 = bounding_box.get(
            "x1"
        )

        y1 = bounding_box.get(
            "y1"
        )

        x2 = bounding_box.get(
            "x2"
        )

        y2 = bounding_box.get(
            "y2"
        )

        width_pixels = detection.get(
            "width_pixels"
        )

        height_pixels = detection.get(
            "height_pixels"
        )

        db_detection = OCRDetection(
            inspection_id=inspection_id,
            image_id=image_id,

            detection_index=index,

            text=text,

            confidence=confidence,

            x1=x1,
            y1=y1,
            x2=x2,
            y2=y2,

            width_pixels=width_pixels,
            height_pixels=height_pixels,

            created_at=datetime.now()
        )

        db.add(
            db_detection
        )

        db.flush()

        detections.append(
            (
                detection,
                db_detection
            )
        )

    return detections


# ============================================================
# SAVE RULE RESULTS
# ============================================================

def save_rule_results(
    db: Session,
    inspection_id,
    checks,
    db_detections
):
    """
    Save compliance-rule results and their OCR evidence.
    """

    saved_results = []

    if not isinstance(
        checks,
        list
    ):
        return saved_results

    for check in checks:

        if not isinstance(
            check,
            dict
        ):
            continue

        rule_name = (
            check.get("name")
            or check.get("rule_name")
            or check.get("rule")
            or "Unknown Rule"
        )

        rule_code = (
            check.get("rule_code")
            or check.get("code")
            or re.sub(
                r"[^a-z0-9]+",
                "_",
                str(rule_name).lower()
            ).strip("_")
        )

        status = normalize_rule_status(
            check.get("status")
        )

        found = check.get(
            "found"
        )

        value = check.get(
            "value"
        )

        confidence = check.get(
            "confidence"
        )

        source_text = check.get(
            "source_text"
        )

        bounding_box = check.get(
            "bounding_box"
        )

        result_data = check.copy()

        db_rule_result = RuleResult(
            inspection_id=inspection_id,

            rule_code=rule_code,

            rule_name=str(
                rule_name
            ),

            status=status,

            found=found,

            value=(
                str(value)
                if value is not None
                else None
            ),

            confidence=confidence,

            source_text=source_text,

            bounding_box=bounding_box,

            result_data=result_data,

            created_at=datetime.now()
        )

        db.add(
            db_rule_result
        )

        db.flush()

        # ----------------------------------------------------
        # EVIDENCE
        # ----------------------------------------------------

        evidence_detections = (
            find_evidence_detections(
                check,
                db_detections
            )
        )

        for db_detection in evidence_detections:

            evidence = RuleResultEvidence(
                rule_result_id=db_rule_result.id,
                ocr_detection_id=db_detection.id,
                created_at=datetime.now()
            )

            db.add(
                evidence
            )

        saved_results.append(
            db_rule_result
        )

    return saved_results


# ============================================================
# UPDATE INSPECTION SUMMARY
# ============================================================

def update_inspection_summary(
    db: Session,
    inspection
):
    """
    Recalculate inspection summary from saved rule results.
    """

    rule_results = (
        db.query(RuleResult)
        .filter(
            RuleResult.inspection_id
            == inspection.id
        )
        .all()
    )

    total = len(
        rule_results
    )

    passed = sum(
        1
        for result in rule_results
        if result.status == "PASS"
    )

    partial = sum(
        1
        for result in rule_results
        if result.status == "PARTIAL"
    )

    failed = sum(
        1
        for result in rule_results
        if result.status == "VIOLATION"
    )

    inspection.total_checks = total
    inspection.passed_checks = passed
    inspection.partial_checks = partial
    inspection.failed_checks = failed

    if total > 0:

        inspection.compliance_percentage = round(
            (
                passed / total
            ) * 100,
            2
        )

    else:

        inspection.compliance_percentage = 0

    # --------------------------------------------------------
    # OVERALL STATUS
    # --------------------------------------------------------

    if failed > 0:

        inspection.overall_status = (
            "VIOLATION"
        )

    elif partial > 0:

        inspection.overall_status = (
            "PARTIAL"
        )

    elif passed == total and total > 0:

        inspection.overall_status = (
            "PASS"
        )

    else:

        inspection.overall_status = (
            "PARTIAL"
        )

    inspection.updated_at = datetime.now()


# ============================================================
# SAVE COMPLETE SCAN RESULT
# ============================================================

def save_scan_result(
    db: Session,
    final_report,
    image_path,
    original_filename=None,
    mime_type=None
):
    """
    Complete persistence pipeline.

    Flow:

        Rule Engine
             ↓
        Create Inspection
             ↓
        Save Image
             ↓
        Save OCR
             ↓
        Save Rule Results
             ↓
        Save Evidence
             ↓
        Update Summary
             ↓
        Commit
    """

    # --------------------------------------------------------
    # CREATE INSPECTION
    # --------------------------------------------------------

    inspection = create_inspection(
        db,
        final_report
    )

    try:

        # ----------------------------------------------------
        # SAVE IMAGE
        # ----------------------------------------------------

        source_file = Path(
            image_path
        )

        if not source_file.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        extension = (
            source_file.suffix.lower()
            or ".jpg"
        )

        stored_filename = (
            f"{uuid.uuid4().hex}{extension}"
        )

        inspection_directory = (
            UPLOAD_DIR /
            str(inspection.id)
        )

        inspection_directory.mkdir(
            parents=True,
            exist_ok=True
        )

        destination = (
            inspection_directory /
            stored_filename
        )

        shutil.copy2(
            source_file,
            destination
        )

        file_size = destination.stat().st_size

        image_record = InspectionImage(
            inspection_id=inspection.id,

            original_filename=(
                original_filename
                or source_file.name
            ),

            stored_filename=stored_filename,

            file_path=str(
                destination
            ),

            mime_type=mime_type,

            file_size=file_size,

            image_order=1,

            created_at=datetime.now()
        )

        db.add(
            image_record
        )

        db.flush()

        # ----------------------------------------------------
        # OCR
        # ----------------------------------------------------

        ocr_result = final_report.get(
            "ocr",
            {}
        )

        # Some versions of the backend may put OCR
        # detections at the root.
        if not ocr_result:

            if "detections" in final_report:

                ocr_result = {
                    "detections":
                    final_report.get(
                        "detections",
                        []
                    )
                }

        db_detections = (
            save_ocr_detections(
                db=db,
                inspection_id=inspection.id,
                image_id=image_record.id,
                ocr_result=ocr_result
            )
        )

        # ----------------------------------------------------
        # RULE CHECKS
        # ----------------------------------------------------

        checks = extract_all_checks(
            final_report
        )

        save_rule_results(
            db=db,
            inspection_id=inspection.id,
            checks=checks,
            db_detections=db_detections
        )

        # ----------------------------------------------------
        # UPDATE SUMMARY
        # ----------------------------------------------------

        update_inspection_summary(
            db,
            inspection
        )

        # ----------------------------------------------------
        # COMPLETION
        # ----------------------------------------------------

        inspection.status = "COMPLETED"

        inspection.completed_at = (
            datetime.now()
        )

        inspection.updated_at = (
            datetime.now()
        )

        # ----------------------------------------------------
        # COMMIT EVERYTHING
        # ----------------------------------------------------

        db.commit()

        db.refresh(
            inspection
        )

        return inspection

    except Exception:

        db.rollback()

        raise