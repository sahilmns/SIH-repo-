from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ruleengine import (
    LegalMetrologyRuleEngine,
    LegalMetrologyOCREngine
)

from database import get_db

from models import (
    Inspection,
    InspectionImage,
    OCRDetection,
    RuleResult,
)

from services.scan_service import (
    save_scan_result
)

import tempfile
import os


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="NiyamDrishti API",
    description="Legal Metrology Label Compliance API",
    version="1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://niyamdrishti-4xt9.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# OCR ENGINE
# ============================================================

ocr_engine = LegalMetrologyOCREngine()


# ============================================================
# ALLOWED IMAGE TYPES
# ============================================================

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def home():
    return {
        "message": "NiyamDrishti API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "OK",
        "message": "NiyamDrishti API is healthy"
    }


# ============================================================
# TEMPORARY FILE HANDLING
# ============================================================

async def save_upload_to_temp(file: UploadFile):

    if not file.filename:
        raise ValueError("No file uploaded.")

    suffix = os.path.splitext(file.filename)[1].lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Unsupported image format. "
            "Allowed formats: JPG, JPEG, PNG, WEBP."
        )

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        temp_file.write(await file.read())

        return temp_file.name


# ============================================================
# SINGLE IMAGE ANALYSIS
# ============================================================

@app.post("/analyze-label")
async def analyze_label(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    image_path = None

    try:

        # ----------------------------------------------------
        # Save uploaded image temporarily
        # ----------------------------------------------------

        image_path = await save_upload_to_temp(file)


        # ----------------------------------------------------
        # OCR
        # ----------------------------------------------------

        ocr_result = ocr_engine.extract_to_json(
            image_path
        )

        ocr_result["image"] = file.filename


        # ----------------------------------------------------
        # Rule Engine
        # ----------------------------------------------------

        rule_engine = LegalMetrologyRuleEngine(
            ocr_result
        )

        final_report = (
            rule_engine.generate_final_report()
        )


        final_report[
            "compliance_report"
        ]["image"] = file.filename


        # ----------------------------------------------------
        # Save everything into PostgreSQL
        # ----------------------------------------------------

        inspection = save_scan_result(
            db=db,
            final_report=final_report,
            image_path=image_path,
            original_filename=file.filename,
            mime_type=file.content_type
        )

        # ----------------------------------------------------
        # Add database inspection information
        # ----------------------------------------------------

        final_report["inspection"] = {

            "id": inspection.id,

            "inspection_code":
                inspection.inspection_code,

            "status":
                inspection.status
        }


        return final_report


    except Exception as e:

        db.rollback()

        return {
            "status": "ERROR",
            "message": str(e)
        }


    finally:

        if (
            image_path
            and os.path.exists(image_path)
        ):
            os.remove(image_path)


# ============================================================
# MULTI IMAGE ANALYSIS
# ============================================================
# Kept for compatibility.
# Current frontend workflow uses SINGLE IMAGE only.
# ============================================================

@app.post("/analyze-label/multi")
async def analyze_multiple_labels(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):

    image_paths = []

    uploaded_files = []

    all_ocr_results = []


    try:

        if not files:

            return {
                "status": "ERROR",
                "message": "No images uploaded."
            }


        if len(files) > 6:

            return {
                "status": "ERROR",
                "message": "Maximum 6 images allowed."
            }


        all_detections = []

        image_names = []


        # ----------------------------------------------------
        # Process every image
        # ----------------------------------------------------

        for file in files:

            image_path = (
                await save_upload_to_temp(file)
            )

            image_paths.append(
                image_path
            )


            uploaded_files.append({

                "filename": file.filename,

                "file_path": image_path,

                "mime_type": file.content_type

            })


            image_names.append(
                file.filename
            )


            # OCR

            ocr_result = (
                ocr_engine.extract_to_json(
                    image_path
                )
            )


            all_ocr_results.append(
                ocr_result
            )


            # Combine detections

            for detection in (
                ocr_result.get(
                    "detections",
                    []
                )
            ):

                detection[
                    "source_image"
                ] = file.filename

                all_detections.append(
                    detection
                )


        # ----------------------------------------------------
        # Combined OCR
        # ----------------------------------------------------

        combined_ocr_result = {

            "image": image_names,

            "total_detections":
                len(all_detections),

            "detections":
                all_detections

        }


        # ----------------------------------------------------
        # Rule Engine
        # ----------------------------------------------------

        rule_engine = (
            LegalMetrologyRuleEngine(
                combined_ocr_result
            )
        )


        final_report = (
            rule_engine.generate_final_report()
        )


        final_report[
            "compliance_report"
        ]["images"] = image_names


        final_report[
            "compliance_report"
        ]["total_images"] = len(files)


        # ----------------------------------------------------
        # Save database data
        # ----------------------------------------------------

        inspection = save_scan_result(

            db=db,

            final_report=final_report,

            uploaded_files=
                uploaded_files,

            ocr_results=
                all_ocr_results,

            combined_ocr_result=
                combined_ocr_result

        )


        final_report["inspection"] = {

            "id": inspection.id,

            "inspection_code":
                inspection.inspection_code,

            "status":
                inspection.status

        }


        return final_report


    except Exception as e:

        db.rollback()

        return {

            "status": "ERROR",

            "message": str(e)

        }


    finally:

        for image_path in image_paths:

            if os.path.exists(
                image_path
            ):

                os.remove(
                    image_path
                )


# ============================================================
# GET ALL INSPECTIONS
# ============================================================
#
# Used by:
#
# Reports
# History
# Dashboard
#
# This is what makes every completed inspection appear
# in the frontend instead of using hardcoded/mock data.
# ============================================================

@app.get("/inspections")
def get_inspections(
    db: Session = Depends(get_db)
):

    inspections = (

        db.query(Inspection)

        .order_by(
            Inspection.created_at.desc()
        )

        .all()

    )


    results = []


    for inspection in inspections:

        results.append({

            "id":
                inspection.id,

            "inspection_code":
                inspection.inspection_code,

            "inspection_type":
                inspection.inspection_type,

            "status":
                inspection.status,

            "product_name":
                inspection.product_name,

            "brand_name":
                inspection.brand_name,

            "category":
                inspection.category,

            "mrp":
                inspection.mrp,

            "net_quantity":
                inspection.net_quantity,

            "overall_status":
                inspection.overall_status,

            "compliance_percentage":

                (
                    float(
                        inspection.compliance_percentage
                    )

                    if
                    inspection.compliance_percentage
                    is not None

                    else None
                ),

            "total_checks":
                inspection.total_checks or 0,

            "passed_checks":
                inspection.passed_checks or 0,

            "partial_checks":
                inspection.partial_checks or 0,

            "failed_checks":
                inspection.failed_checks or 0,

            "average_ocr_confidence":

                (
                    float(
                        inspection.average_ocr_confidence
                    )

                    if
                    inspection.average_ocr_confidence
                    is not None

                    else None
                ),

            "created_at":

                (
                    inspection.created_at.isoformat()

                    if inspection.created_at

                    else None
                ),

            "completed_at":

                (
                    inspection.completed_at.isoformat()

                    if inspection.completed_at

                    else None
                )

        })


    return {

        "total":
            len(results),

        "inspections":
            results

    }


# ============================================================
# GET SINGLE INSPECTION
# ============================================================
#
# Used when clicking the eye/view button.
#
# Example:
#
# GET /inspections/5
#
# Returns ONLY inspection 5.
# ============================================================

@app.get("/inspections/{inspection_id}")
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Find inspection
    # --------------------------------------------------------

    inspection = (

        db.query(Inspection)

        .filter(
            Inspection.id == inspection_id
        )

        .first()

    )


    if not inspection:

        return {

            "status": "ERROR",

            "message":
                "Inspection not found."

        }


    # --------------------------------------------------------
    # Get images
    # --------------------------------------------------------

    images = (

        db.query(InspectionImage)

        .filter(
            InspectionImage.inspection_id
            == inspection_id
        )

        .order_by(
            InspectionImage.image_order.asc()
        )

        .all()

    )


    # --------------------------------------------------------
    # Get OCR detections
    # --------------------------------------------------------

    ocr_detections = (

        db.query(OCRDetection)

        .filter(
            OCRDetection.inspection_id
            == inspection_id
        )

        .order_by(
            OCRDetection.detection_index.asc()
        )

        .all()

    )


    # --------------------------------------------------------
    # Get rule results
    # --------------------------------------------------------

    rule_results = (

        db.query(RuleResult)

        .filter(
            RuleResult.inspection_id
            == inspection_id
        )

        .order_by(
            RuleResult.id.asc()
        )

        .all()

    )


    # --------------------------------------------------------
    # Serialize images
    # --------------------------------------------------------

    image_data = []


    for image in images:

        image_data.append({

            "id":
                image.id,

            "original_filename":
                image.original_filename,

            "stored_filename":
                image.stored_filename,

            "mime_type":
                image.mime_type,

            "file_size":
                image.file_size,

            "image_order":
                image.image_order,

            "created_at":

                (
                    image.created_at.isoformat()

                    if image.created_at

                    else None
                )

        })


    # --------------------------------------------------------
    # Serialize OCR
    # --------------------------------------------------------

    ocr_data = []


    for detection in ocr_detections:

        ocr_data.append({

            "id":
                detection.id,

            "image_id":
                detection.image_id,

            "detection_index":
                detection.detection_index,

            "text":
                detection.text,

            "confidence":

                (
                    float(
                        detection.confidence
                    )

                    if detection.confidence
                    is not None

                    else None
                ),

            "bounding_box": {

                "x1":
                    detection.x1,

                "y1":
                    detection.y1,

                "x2":
                    detection.x2,

                "y2":
                    detection.y2

            },

            "width_pixels":
                detection.width_pixels,

            "height_pixels":
                detection.height_pixels

        })


    # --------------------------------------------------------
    # Serialize rule results
    # --------------------------------------------------------

    rule_data = []


    for rule in rule_results:

        rule_data.append({

            "id":
                rule.id,

            "rule_code":
                rule.rule_code,

            "rule_name":
                rule.rule_name,

            "status":
                rule.status,

            "found":
                rule.found,

            "value":
                rule.value,

            "confidence":

                (
                    float(
                        rule.confidence
                    )

                    if rule.confidence
                    is not None

                    else None
                ),

            "source_text":
                rule.source_text,

            "bounding_box":
                rule.bounding_box,

            "result_data":
                rule.result_data,

            "created_at":

                (
                    rule.created_at.isoformat()

                    if rule.created_at

                    else None
                )

        })


    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {

        "status": "OK",

        "inspection": {

            "id":
                inspection.id,

            "inspection_code":
                inspection.inspection_code,

            "inspection_type":
                inspection.inspection_type,

            "status":
                inspection.status,

            "product_name":
                inspection.product_name,

            "brand_name":
                inspection.brand_name,

            "category":
                inspection.category,

            "mrp":
                inspection.mrp,

            "net_quantity":
                inspection.net_quantity,

            "overall_status":
                inspection.overall_status,

            "compliance_percentage":

                (
                    float(
                        inspection.compliance_percentage
                    )

                    if
                    inspection.compliance_percentage
                    is not None

                    else None
                ),

            "total_checks":
                inspection.total_checks or 0,

            "passed_checks":
                inspection.passed_checks or 0,

            "partial_checks":
                inspection.partial_checks or 0,

            "failed_checks":
                inspection.failed_checks or 0,

            "average_ocr_confidence":

                (
                    float(
                        inspection.average_ocr_confidence
                    )

                    if
                    inspection.average_ocr_confidence
                    is not None

                    else None
                ),

            "created_at":

                (
                    inspection.created_at.isoformat()

                    if inspection.created_at

                    else None
                ),

            "completed_at":

                (
                    inspection.completed_at.isoformat()

                    if inspection.completed_at

                    else None
                )

        },

        "images":
            image_data,

        "ocr_detections":
            ocr_data,

        "rule_results":
            rule_data

    }


# ============================================================
# DASHBOARD STATISTICS
# ============================================================
#
# Used by Dashboard / Analytics / Reports summary cards.
# ============================================================

@app.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Total inspections
    # --------------------------------------------------------

    total = (

        db.query(
            func.count(Inspection.id)
        )

        .scalar()

        or 0

    )


    # --------------------------------------------------------
    # Compliant
    # --------------------------------------------------------

    compliant = (

        db.query(
            func.count(Inspection.id)
        )

        .filter(
            Inspection.overall_status
            == "COMPLIANT"
        )

        .scalar()

        or 0

    )


    # --------------------------------------------------------
    # Non-compliant / violations
    # --------------------------------------------------------

    non_compliant = (

        db.query(
            func.count(Inspection.id)
        )

        .filter(

            Inspection.overall_status.in_([

                "NON-COMPLIANT",

                "VIOLATION",

                "FAILED",

                "FAIL"

            ])

        )

        .scalar()

        or 0

    )


    # --------------------------------------------------------
    # Needs review
    # --------------------------------------------------------

    review = (

        db.query(
            func.count(Inspection.id)
        )

        .filter(

            Inspection.overall_status.in_([

                "PARTIAL",

                "UNCERTAIN",

                "REQUIRES_ADDITIONAL_IMAGE",

                "REVIEW",

                "NEEDS_REVIEW"

            ])

        )

        .scalar()

        or 0

    )


    return {

        "total_inspections":
            total,

        "compliant":
            compliant,

        "needs_review":
            review,

        "potential_violations":
            non_compliant

    }


# ============================================================
# SERVE INSPECTION IMAGE
# ============================================================
#
# Browser cannot directly open a Windows/Python file path.
# This endpoint allows React to display the actual image
# stored for a particular inspection.
#
# Example:
#
# GET /inspection-images/15
# ============================================================

@app.get("/inspection-images/{image_id}")
def get_inspection_image(
    image_id: int,
    db: Session = Depends(get_db)
):

    image = (

        db.query(InspectionImage)

        .filter(
            InspectionImage.id == image_id
        )

        .first()

    )


    if not image:

        return {

            "status": "ERROR",

            "message":
                "Inspection image not found."

        }


    if not image.file_path:

        return {

            "status": "ERROR",

            "message":
                "Image file path is missing."

        }


    if not os.path.exists(
        image.file_path
    ):

        return {

            "status": "ERROR",

            "message":
                "Image file does not exist."

        }


    return FileResponse(

        path=image.file_path,

        media_type=(
            image.mime_type
            or "image/jpeg"
        ),

        filename=(
            image.original_filename
            or image.stored_filename
            or "inspection-image"
        )

    )


# ============================================================
# CUSTOM OPENAPI
# ============================================================

def custom_openapi():

    if app.openapi_schema:

        return app.openapi_schema


    openapi_schema = get_openapi(

        title=app.title,

        version=app.version,

        description=app.description,

        routes=app.routes,

    )


    openapi_schema[
        "openapi"
    ] = "3.0.3"


    schemas = (

        openapi_schema

        .get(
            "components",
            {}
        )

        .get(
            "schemas",
            {}
        )

    )


    # --------------------------------------------------------
    # Single upload
    # --------------------------------------------------------

    single_schema_name = (
        "Body_analyze_label_analyze_label_post"
    )


    single_schema = schemas.get(
        single_schema_name
    )


    if single_schema:

        properties = (
            single_schema
            .get("properties", {})
        )


        file_schema = (
            properties.get("file")
        )


        if file_schema:

            file_schema[
                "type"
            ] = "string"


            file_schema[
                "format"
            ] = "binary"


            file_schema.pop(
                "contentMediaType",
                None
            )


    # --------------------------------------------------------
    # Multi upload
    # --------------------------------------------------------

    multi_schema_name = (
        "Body_analyze_multiple_labels_analyze_label_multi_post"
    )


    multi_schema = schemas.get(
        multi_schema_name
    )


    if multi_schema:

        properties = (
            multi_schema
            .get("properties", {})
        )


        files_schema = (
            properties.get("files")
        )


        if files_schema:

            files_schema[
                "items"
            ] = {

                "type": "string",

                "format": "binary"

            }


            files_schema.pop(
                "contentMediaType",
                None
            )


    app.openapi_schema = (
        openapi_schema
    )


    return openapi_schema


app.openapi = custom_openapi
