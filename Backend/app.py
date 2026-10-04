# ============================================================
# NIYAMDRISHTI - FASTAPI BACKEND
# Legal Metrology Label Compliance System
# ============================================================

import os
import tempfile
import html
from io import BytesIO
from pathlib import Path
from typing import List

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    HTTPException,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.openapi.utils import get_openapi

from sqlalchemy.orm import Session
from sqlalchemy import func

# ------------------------------------------------------------
# NiyamDrishti internal modules
# ------------------------------------------------------------
from ocr import LegalMetrologyOCREngine
from ruleengine import LegalMetrologyRuleEngine

from database import get_db
from models import (
    Inspection,
    InspectionImage,
    OCRDetection,
    RuleResult,
)

from services.scan_service import save_scan_result


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="NiyamDrishti API",
    description="Legal Metrology Label Compliance API",
    version="1.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Production frontend
        "https://niyamdrishti-4xt9.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


# ============================================================
# GLOBAL OCR ENGINE
# ============================================================

ocr_engine = LegalMetrologyOCREngine()


# ============================================================
# STATUS NORMALIZATION
# ============================================================

def normalize_status(status):
    """
    Convert all possible backend status values into the
    three canonical NiyamDrishti statuses:

        COMPLIANT
        VIOLATION
        REVIEW
    """

    value = str(status or "").strip().upper()

    # Compliant
    if value in {
        "PASS",
        "PASSED",
        "COMPLIANT",
        "VERIFIED_COMPLIANT",
        "COMPLIANT_WITH_ALL_CHECKS",
    }:
        return "COMPLIANT"

    # Violation
    if value in {
        "VIOLATION",
        "VIOLATIONS",
        "FAILED",
        "FAIL",
        "NON_COMPLIANT",
        "NON-COMPLIANT",
    }:
        return "VIOLATION"

    # Everything else is review
    return "REVIEW"


# ============================================================
# SAFE TEXT HELPERS
# ============================================================

def safe_string(value, default="Not recorded"):
    """
    Safely convert database values to strings.
    """
    if value is None:
        return default

    value = str(value).strip()

    if not value:
        return default

    return value


def pdf_text(value, default="Not recorded"):
    """
    Escape text before inserting it into a ReportLab Paragraph.
    """

    value = safe_string(value, default)

    return html.escape(value)


# ============================================================
# HEALTH / ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "status": "OK",
        "message": "NiyamDrishti API is running",
        "version": "1.0",
    }


@app.get("/health")
def health():
    return {
        "status": "OK",
        "message": "NiyamDrishti API is healthy",
    }


# ============================================================
# SINGLE IMAGE ANALYSIS
# ============================================================

@app.post("/analyze-label")
async def analyze_label(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Analyze one product-label image.

    Flow:

        Image
          ↓
        PaddleOCR
          ↓
        Rule Engine
          ↓
        Compliance Report
          ↓
        PostgreSQL / Neon
    """

    temp_path = None

    try:
        # ----------------------------------------------------
        # Validate uploaded file
        # ----------------------------------------------------

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file was provided.",
            )

        # ----------------------------------------------------
        # Save upload temporarily
        # ----------------------------------------------------

        suffix = Path(file.filename).suffix or ".jpg"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:

            temp_path = temp_file.name

            contents = await file.read()

            if not contents:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded file is empty.",
                )

            temp_file.write(contents)

        # ----------------------------------------------------
        # OCR
        # ----------------------------------------------------

        ocr_result = ocr_engine.extract_to_json(
            temp_path
        )

        # ----------------------------------------------------
        # Rule Engine
        # ----------------------------------------------------

        rule_engine = LegalMetrologyRuleEngine(
            ocr_result
        )

        final_report = (
            rule_engine.generate_final_report()
        )

        # ----------------------------------------------------
        # Add original filename
        # ----------------------------------------------------

        if isinstance(final_report, dict):

            final_report["filename"] = file.filename

        # ----------------------------------------------------
        # Save complete inspection to PostgreSQL
        # ----------------------------------------------------

        inspection = save_scan_result(
            db=db,
            final_report=final_report,
            image_path=temp_path,
            original_filename=file.filename,
            mime_type=file.content_type,
        )

        # ----------------------------------------------------
        # Return response
        # ----------------------------------------------------

        response = final_report

        if isinstance(response, dict):

            response["inspection"] = {
                "id": inspection.id,
                "inspection_code": inspection.inspection_code,
                "status": inspection.status,
                "overall_status": inspection.overall_status,
                "compliance_percentage": (
                    inspection.compliance_percentage
                ),
            }

        return response

    except HTTPException:
        raise

    except Exception as e:

        print(
            "ERROR in /analyze-label:",
            repr(e),
        )

        raise HTTPException(
            status_code=500,
            detail=f"Label analysis failed: {str(e)}",
        )

    finally:

        # ----------------------------------------------------
        # Delete temporary uploaded file
        # ----------------------------------------------------

        if temp_path:

            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

            except Exception:
                pass


# ============================================================
# MULTI IMAGE ENDPOINT
# ============================================================
#
# Current NiyamDrishti frontend is using SINGLE IMAGE.
#
# This endpoint is retained for compatibility with older
# frontend code, but the current implementation should use
# /analyze-label.
# ============================================================

@app.post("/analyze-label/multi")
async def analyze_multiple_labels(
    files: List[UploadFile] = File(...),
):
    """
    Compatibility endpoint for multi-image analysis.

    Current NiyamDrishti workflow uses single-image analysis.
    """

    if not files:
        raise HTTPException(
            status_code=400,
            detail="No files were provided.",
        )

    temporary_files = []

    try:

        # ----------------------------------------------------
        # OCR each image
        # ----------------------------------------------------

        ocr_results = []

        for file in files:

            if not file.filename:
                continue

            suffix = (
                Path(file.filename).suffix
                or ".jpg"
            )

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=suffix,
            ) as temp_file:

                temp_path = temp_file.name

                contents = await file.read()

                if not contents:
                    continue

                temp_file.write(contents)

            temporary_files.append(temp_path)

            result = ocr_engine.extract_to_json(
                temp_path
            )

            ocr_results.append(result)

        if not ocr_results:
            raise HTTPException(
                status_code=400,
                detail="No valid images were provided.",
            )

        # ----------------------------------------------------
        # Combine OCR detections
        # ----------------------------------------------------

        combined_detections = []

        for result in ocr_results:

            if not isinstance(result, dict):
                continue

            detections = result.get(
                "detections",
                []
            )

            if isinstance(detections, list):
                combined_detections.extend(
                    detections
                )

        combined_ocr_result = {
            "image": "multiple",
            "total_detections": len(
                combined_detections
            ),
            "detections": combined_detections,
        }

        # ----------------------------------------------------
        # Rule Engine
        # ----------------------------------------------------

        rule_engine = LegalMetrologyRuleEngine(
            combined_ocr_result
        )

        final_report = (
            rule_engine.generate_final_report()
        )

        if isinstance(final_report, dict):

            final_report["files"] = [
                file.filename
                for file in files
                if file.filename
            ]

        return final_report

    except HTTPException:
        raise

    except Exception as e:

        print(
            "ERROR in /analyze-label/multi:",
            repr(e),
        )

        raise HTTPException(
            status_code=500,
            detail=f"Multi-image analysis failed: {str(e)}",
        )

    finally:

        for path in temporary_files:

            try:
                if os.path.exists(path):
                    os.remove(path)

            except Exception:
                pass


# ============================================================
# GET ALL INSPECTIONS
# ============================================================

@app.get("/inspections")
def get_inspections(
    db: Session = Depends(get_db),
):
    """
    Return all inspections from PostgreSQL.

    This is the source of truth for:
        Dashboard
        Analytics
        Reports
        History
    """

    inspections = (
        db.query(Inspection)
        .order_by(
            Inspection.created_at.desc()
        )
        .all()
    )

    result = []

    for inspection in inspections:

        result.append({
            "id": inspection.id,

            "inspection_code": (
                inspection.inspection_code
            ),

            "inspection_type": (
                inspection.inspection_type
            ),

            "status": inspection.status,

            "overall_status": (
                inspection.overall_status
            ),

            "product_name": (
                inspection.product_name
            ),

            "brand_name": (
                inspection.brand_name
            ),

            "category": (
                inspection.category
            ),

            "mrp": inspection.mrp,

            "net_quantity": (
                inspection.net_quantity
            ),

            "product_url": (
                inspection.product_url
            ),

            "compliance_percentage": (
                inspection.compliance_percentage
            ),

            "total_checks": (
                inspection.total_checks or 0
            ),

            "passed_checks": (
                inspection.passed_checks or 0
            ),

            "partial_checks": (
                inspection.partial_checks or 0
            ),

            "failed_checks": (
                inspection.failed_checks or 0
            ),

            "average_ocr_confidence": (
                inspection.average_ocr_confidence
            ),

            "created_at": (
                inspection.created_at
            ),

            "completed_at": (
                inspection.completed_at
            ),

            "updated_at": (
                inspection.updated_at
            ),
        })

    return {
        "total": len(result),
        "inspections": result,
    }


# ============================================================
# GET SINGLE INSPECTION
# ============================================================

@app.get("/inspections/{inspection_id}")
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
):
    """
    Return complete inspection information including:

        inspection
        images
        OCR detections
        rule results
    """

    inspection = (
        db.query(Inspection)
        .filter(
            Inspection.id == inspection_id
        )
        .first()
    )

    if not inspection:

        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    # --------------------------------------------------------
    # Images
    # --------------------------------------------------------

    images = (
        db.query(InspectionImage)
        .filter(
            InspectionImage.inspection_id
            == inspection.id
        )
        .order_by(
            InspectionImage.image_order.asc()
        )
        .all()
    )

    image_data = []

    for image in images:

        image_data.append({
            "id": image.id,
            "inspection_id": image.inspection_id,
            "original_filename": getattr(
                image,
                "original_filename",
                None,
            ),
            "stored_filename": getattr(
                image,
                "stored_filename",
                None,
            ),
            "mime_type": getattr(
                image,
                "mime_type",
                None,
            ),
            "file_size": getattr(
                image,
                "file_size",
                None,
            ),
            "image_order": getattr(
                image,
                "image_order",
                None,
            ),
            "created_at": getattr(
                image,
                "created_at",
                None,
            ),
        })

    # --------------------------------------------------------
    # OCR detections
    # --------------------------------------------------------

    ocr_detections = (
        db.query(OCRDetection)
        .filter(
            OCRDetection.inspection_id
            == inspection.id
        )
        .order_by(
            OCRDetection.id.asc()
        )
        .all()
    )

    ocr_data = []

    for detection in ocr_detections:

        ocr_data.append({
            "id": detection.id,
            "text": getattr(
                detection,
                "text",
                None,
            ),
            "confidence": getattr(
                detection,
                "confidence",
                None,
            ),
            "bounding_box": getattr(
                detection,
                "bounding_box",
                None,
            ),
            "created_at": getattr(
                detection,
                "created_at",
                None,
            ),
        })

    # --------------------------------------------------------
    # Rule results
    # --------------------------------------------------------

    rule_results = (
        db.query(RuleResult)
        .filter(
            RuleResult.inspection_id
            == inspection.id
        )
        .order_by(
            RuleResult.id.asc()
        )
        .all()
    )

    rule_data = []

    for rule in rule_results:

        rule_data.append({
            "id": rule.id,

            "inspection_id": (
                rule.inspection_id
            ),

            "rule_code": (
                rule.rule_code
            ),

            "rule_name": (
                rule.rule_name
            ),

            "status": (
                rule.status
            ),

            "found": (
                rule.found
            ),

            "value": (
                rule.value
            ),

            "confidence": (
                rule.confidence
            ),

            "source_text": (
                rule.source_text
            ),

            "bounding_box": (
                rule.bounding_box
            ),

            "result_data": (
                rule.result_data
            ),

            "created_at": (
                rule.created_at
            ),
        })

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {
        "inspection": {
            "id": inspection.id,

            "inspection_code": (
                inspection.inspection_code
            ),

            "inspection_type": (
                inspection.inspection_type
            ),

            "status": inspection.status,

            "overall_status": (
                inspection.overall_status
            ),

            "product_name": (
                inspection.product_name
            ),

            "brand_name": (
                inspection.brand_name
            ),

            "category": (
                inspection.category
            ),

            "mrp": inspection.mrp,

            "net_quantity": (
                inspection.net_quantity
            ),

            "product_url": (
                inspection.product_url
            ),

            "compliance_percentage": (
                inspection.compliance_percentage
            ),

            "total_checks": (
                inspection.total_checks or 0
            ),

            "passed_checks": (
                inspection.passed_checks or 0
            ),

            "partial_checks": (
                inspection.partial_checks or 0
            ),

            "failed_checks": (
                inspection.failed_checks or 0
            ),

            "average_ocr_confidence": (
                inspection.average_ocr_confidence
            ),

            "created_at": (
                inspection.created_at
            ),

            "completed_at": (
                inspection.completed_at
            ),

            "updated_at": (
                inspection.updated_at
            ),
        },

        "images": image_data,

        "ocr_detections": ocr_data,

        "rule_results": rule_data,
    }


# ============================================================
# DASHBOARD STATS
# ============================================================

@app.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
):
    """
    Dashboard statistics calculated directly from PostgreSQL.

    These values are intentionally based on the same database
    records used by Analytics and Reports.
    """

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
    # Count statuses
    # --------------------------------------------------------

    status_expression = func.upper(
        func.coalesce(
            Inspection.overall_status,
            "",
        )
    )

    compliant = (
        db.query(
            func.count(Inspection.id)
        )
        .filter(
            status_expression.in_([
                "COMPLIANT",
                "PASS",
                "PASSED",
                "VERIFIED_COMPLIANT",
                "COMPLIANT_WITH_ALL_CHECKS",
            ])
        )
        .scalar()
        or 0
    )

    potential_violations = (
        db.query(
            func.count(Inspection.id)
        )
        .filter(
            status_expression.in_([
                "VIOLATION",
                "VIOLATIONS",
                "FAILED",
                "FAIL",
                "NON_COMPLIANT",
                "NON-COMPLIANT",
            ])
        )
        .scalar()
        or 0
    )

    needs_review = (
        db.query(
            func.count(Inspection.id)
        )
        .filter(
            ~status_expression.in_([
                "COMPLIANT",
                "PASS",
                "PASSED",
                "VERIFIED_COMPLIANT",
                "COMPLIANT_WITH_ALL_CHECKS",

                "VIOLATION",
                "VIOLATIONS",
                "FAILED",
                "FAIL",
                "NON_COMPLIANT",
                "NON-COMPLIANT",
            ])
        )
        .scalar()
        or 0
    )

    # --------------------------------------------------------
    # Compliance rate
    # --------------------------------------------------------
    #
    # IMPORTANT:
    # Analytics uses the average stored compliance_percentage.
    # Dashboard therefore uses the SAME calculation.
    # --------------------------------------------------------

    average_compliance = (
        db.query(
            func.avg(
                Inspection.compliance_percentage
            )
        )
        .filter(
            Inspection.compliance_percentage.isnot(
                None
            )
        )
        .scalar()
    )

    compliance_rate = round(
        float(
            average_compliance or 0
        ),
        1,
    )

    # --------------------------------------------------------
    # Last database update
    # --------------------------------------------------------

    last_updated = (
        db.query(
            func.max(
                Inspection.created_at
            )
        )
        .scalar()
    )

    return {
        "total_inspections": int(total),

        "compliant": int(compliant),

        "needs_review": int(
            needs_review
        ),

        "potential_violations": int(
            potential_violations
        ),

        "compliance_rate": (
            compliance_rate
        ),

        "last_updated": (
            last_updated.isoformat()
            if last_updated
            else None
        ),
    }


# ============================================================
# SERVE STORED INSPECTION IMAGE
# ============================================================

@app.get("/inspection-images/{image_id}")
def get_inspection_image(
    image_id: int,
    db: Session = Depends(get_db),
):
    """
    Return an uploaded inspection image.
    """

    image = (
        db.query(InspectionImage)
        .filter(
            InspectionImage.id == image_id
        )
        .first()
    )

    if not image:

        raise HTTPException(
            status_code=404,
            detail="Inspection image not found.",
        )

    file_path = getattr(
        image,
        "file_path",
        None,
    )

    if not file_path:

        raise HTTPException(
            status_code=404,
            detail="Image file path is not available.",
        )

    if not os.path.exists(file_path):

        raise HTTPException(
            status_code=404,
            detail="Image file is no longer available.",
        )

    return FileResponse(
        path=file_path,

        media_type=(
            getattr(
                image,
                "mime_type",
                None,
            )
            or "image/jpeg"
        ),

        filename=(
            getattr(
                image,
                "original_filename",
                None,
            )
            or getattr(
                image,
                "stored_filename",
                None,
            )
            or "inspection-image"
        ),
    )


# ============================================================
# PDF REPORT GENERATION
# ============================================================

@app.get("/inspections/{inspection_id}/pdf")
def download_inspection_pdf(
    inspection_id: int,
    db: Session = Depends(get_db),
):
    """
    Generate a real printable PDF report directly from
    PostgreSQL inspection data.
    """

    # --------------------------------------------------------
    # Fetch inspection
    # --------------------------------------------------------

    inspection = (
        db.query(Inspection)
        .filter(
            Inspection.id == inspection_id
        )
        .first()
    )

    if not inspection:

        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    # --------------------------------------------------------
    # Fetch rule results
    # --------------------------------------------------------

    rule_results = (
        db.query(RuleResult)
        .filter(
            RuleResult.inspection_id
            == inspection.id
        )
        .order_by(
            RuleResult.id.asc()
        )
        .all()
    )

    # ========================================================
    # ReportLab imports
    # ========================================================

    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import (
        getSampleStyleSheet,
        ParagraphStyle,
    )
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
        KeepTogether,
    )

    # ========================================================
    # Optional Unicode font
    # ========================================================
    #
    # DejaVu Sans is used when available. This gives much
    # better support for real product names and OCR text.
    #
    # If unavailable, ReportLab Helvetica is used.
    # ========================================================

    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    font_name = "Helvetica"
    bold_font_name = "Helvetica-Bold"

    possible_regular_fonts = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        "/usr/local/share/fonts/DejaVuSans.ttf",
    ]

    possible_bold_fonts = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
        "/usr/local/share/fonts/DejaVuSans-Bold.ttf",
    ]

    regular_font_path = next(
        (
            path
            for path in possible_regular_fonts
            if os.path.exists(path)
        ),
        None,
    )

    bold_font_path = next(
        (
            path
            for path in possible_bold_fonts
            if os.path.exists(path)
        ),
        None,
    )

    try:

        if regular_font_path:

            if "NiyamDejaVu" not in pdfmetrics.getRegisteredFontNames():

                pdfmetrics.registerFont(
                    TTFont(
                        "NiyamDejaVu",
                        regular_font_path,
                    )
                )

            font_name = "NiyamDejaVu"

        if bold_font_path:

            if "NiyamDejaVuBold" not in pdfmetrics.getRegisteredFontNames():

                pdfmetrics.registerFont(
                    TTFont(
                        "NiyamDejaVuBold",
                        bold_font_path,
                    )
                )

            bold_font_name = "NiyamDejaVuBold"

        elif font_name != "Helvetica":

            bold_font_name = font_name

    except Exception as font_error:

        print(
            "PDF font registration warning:",
            repr(font_error),
        )

        font_name = "Helvetica"
        bold_font_name = "Helvetica-Bold"

    # ========================================================
    # PDF document
    # ========================================================

    buffer = BytesIO()

    inspection_code = (
        safe_string(
            inspection.inspection_code,
            f"ND-{inspection.id}",
        )
    )

    filename = (
        f"{inspection_code}-Report.pdf"
    )

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,

        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,

        title=(
            f"NiyamDrishti Report - "
            f"{inspection_code}"
        ),

        author="NiyamDrishti",
    )

    # ========================================================
    # Styles
    # ========================================================

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "NiyamTitle",

        parent=styles["Title"],

        fontName=bold_font_name,

        fontSize=20,
        leading=24,

        alignment=TA_CENTER,

        textColor=colors.HexColor(
            "#081D41"
        ),

        spaceAfter=2 * mm,
    )

    subtitle_style = ParagraphStyle(
        "NiyamSubtitle",

        parent=styles["Normal"],

        fontName=font_name,

        fontSize=9,
        leading=12,

        alignment=TA_CENTER,

        textColor=colors.HexColor(
            "#475569"
        ),

        spaceAfter=8 * mm,
    )

    heading_style = ParagraphStyle(
        "NiyamHeading",

        parent=styles["Heading2"],

        fontName=bold_font_name,

        fontSize=12,
        leading=15,

        textColor=colors.HexColor(
            "#081D41"
        ),

        spaceBefore=5 * mm,
        spaceAfter=3 * mm,
    )

    normal_style = ParagraphStyle(
        "NiyamNormal",

        parent=styles["Normal"],

        fontName=font_name,

        fontSize=9,
        leading=12,
    )

    small_style = ParagraphStyle(
        "NiyamSmall",

        parent=styles["Normal"],

        fontName=font_name,

        fontSize=7.5,
        leading=10,
    )

    small_bold_style = ParagraphStyle(
        "NiyamSmallBold",

        parent=styles["Normal"],

        fontName=bold_font_name,

        fontSize=7.5,
        leading=10,
    )

    # ========================================================
    # Story
    # ========================================================

    story = []

    # ========================================================
    # Header
    # ========================================================

    story.append(
        Paragraph(
            "NIYAMDRISHTI",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Legal Metrology Label Compliance Report",
            subtitle_style,
        )
    )

    # ========================================================
    # Inspection details
    # ========================================================

    story.append(
        Paragraph(
            "Inspection Details",
            heading_style,
        )
    )

    created_at = (
        inspection.created_at.strftime(
            "%d %b %Y, %I:%M %p"
        )
        if inspection.created_at
        else "Not recorded"
    )

    inspection_data = [
        [
            "Inspection ID",
            pdf_text(inspection_code),
        ],

        [
            "Inspection Type",
            pdf_text(
                inspection.inspection_type,
                "Physical Inspection",
            ),
        ],

        [
            "Inspection Date",
            pdf_text(created_at),
        ],

        [
            "Product Name",
            pdf_text(
                inspection.product_name
            ),
        ],

        [
            "Brand",
            pdf_text(
                inspection.brand_name
            ),
        ],

        [
            "Category",
            pdf_text(
                inspection.category
            ),
        ],

        [
            "MRP",
            pdf_text(
                inspection.mrp
            ),
        ],

        [
            "Net Quantity",
            pdf_text(
                inspection.net_quantity
            ),
        ],
    ]

    inspection_table = Table(
        inspection_data,

        colWidths=[
            48 * mm,
            132 * mm,
        ],
    )

    inspection_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (0, -1),
                colors.HexColor("#F1F5F9"),
            ),

            (
                "TEXTCOLOR",
                (0, 0),
                (0, -1),
                colors.HexColor("#081D41"),
            ),

            (
                "FONTNAME",
                (0, 0),
                (0, -1),
                bold_font_name,
            ),

            (
                "FONTNAME",
                (1, 0),
                (1, -1),
                font_name,
            ),

            (
                "FONTSIZE",
                (0, 0),
                (-1, -1),
                8.5,
            ),

            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#CBD5E1"),
            ),

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP",
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
        ])
    )

    story.append(
        inspection_table
    )

    # ========================================================
    # Compliance summary
    # ========================================================

    story.append(
        Paragraph(
            "Compliance Summary",
            heading_style,
        )
    )

    compliance_percentage = (
        float(
            inspection.compliance_percentage
        )
        if inspection.compliance_percentage
        is not None
        else 0.0
    )

    overall_status = normalize_status(
        inspection.overall_status
    )

    if overall_status == "COMPLIANT":

        display_status = "COMPLIANT"

    elif overall_status == "VIOLATION":

        display_status = "POTENTIAL VIOLATION"

    else:

        display_status = "NEEDS REVIEW"

    if (
        inspection.average_ocr_confidence
        is not None
    ):

        ocr_confidence = (
            f"{float(inspection.average_ocr_confidence) * 100:.1f}%"
        )

    else:

        ocr_confidence = "Not available"

    summary_data = [
        [
            "Overall Status",
            display_status,
        ],

        [
            "Compliance Score",
            f"{compliance_percentage:.1f}%",
        ],

        [
            "Total Checks",
            str(
                inspection.total_checks
                or 0
            ),
        ],

        [
            "Passed",
            str(
                inspection.passed_checks
                or 0
            ),
        ],

        [
            "Needs Review",
            str(
                inspection.partial_checks
                or 0
            ),
        ],

        [
            "Violations",
            str(
                inspection.failed_checks
                or 0
            ),
        ],

        [
            "Average OCR Confidence",
            ocr_confidence,
        ],
    ]

    summary_table = Table(
        summary_data,

        colWidths=[
            65 * mm,
            115 * mm,
        ],
    )

    summary_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (0, -1),
                colors.HexColor("#F1F5F9"),
            ),

            (
                "FONTNAME",
                (0, 0),
                (0, -1),
                bold_font_name,
            ),

            (
                "FONTNAME",
                (1, 0),
                (1, -1),
                font_name,
            ),

            (
                "FONTSIZE",
                (0, 0),
                (-1, -1),
                9,
            ),

            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#CBD5E1"),
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
        ])
    )

    # Status color

    if overall_status == "COMPLIANT":

        summary_table.setStyle(
            TableStyle([
                (
                    "TEXTCOLOR",
                    (1, 0),
                    (1, 0),
                    colors.HexColor("#15803D"),
                ),

                (
                    "FONTNAME",
                    (1, 0),
                    (1, 0),
                    bold_font_name,
                ),
            ])
        )

    elif overall_status == "VIOLATION":

        summary_table.setStyle(
            TableStyle([
                (
                    "TEXTCOLOR",
                    (1, 0),
                    (1, 0),
                    colors.HexColor("#B91C1C"),
                ),

                (
                    "FONTNAME",
                    (1, 0),
                    (1, 0),
                    bold_font_name,
                ),
            ])
        )

    else:

        summary_table.setStyle(
            TableStyle([
                (
                    "TEXTCOLOR",
                    (1, 0),
                    (1, 0),
                    colors.HexColor("#B45309"),
                ),

                (
                    "FONTNAME",
                    (1, 0),
                    (1, 0),
                    bold_font_name,
                ),
            ])
        )

    story.append(
        summary_table
    )

    # ========================================================
    # Rule results
    # ========================================================

    story.append(
        Paragraph(
            "Rule-by-Rule Compliance Results",
            heading_style,
        )
    )

    if rule_results:

        rule_data = [
            [
                Paragraph(
                    "Rule",
                    small_bold_style,
                ),

                Paragraph(
                    "Status",
                    small_bold_style,
                ),

                Paragraph(
                    "Detected Value",
                    small_bold_style,
                ),

                Paragraph(
                    "Confidence",
                    small_bold_style,
                ),

                Paragraph(
                    "Source Text",
                    small_bold_style,
                ),
            ]
        ]

        for rule in rule_results:

            normalized_rule_status = (
                normalize_status(
                    rule.status
                )
            )

            if normalized_rule_status == "COMPLIANT":

                rule_display_status = "PASS"

            elif normalized_rule_status == "VIOLATION":

                rule_display_status = "VIOLATION"

            else:

                rule_display_status = "REVIEW"

            confidence = "—"

            if rule.confidence is not None:

                confidence = (
                    f"{float(rule.confidence) * 100:.1f}%"
                )

            rule_name = (
                rule.rule_name
                or rule.rule_code
                or "Unnamed Rule"
            )

            detected_value = (
                rule.value
                if rule.value is not None
                else "—"
            )

            source_text = (
                rule.source_text
                if rule.source_text is not None
                else "—"
            )

            rule_data.append([
                Paragraph(
                    pdf_text(rule_name),
                    small_style,
                ),

                Paragraph(
                    pdf_text(
                        rule_display_status
                    ),
                    small_style,
                ),

                Paragraph(
                    pdf_text(
                        detected_value,
                        "—",
                    ),
                    small_style,
                ),

                Paragraph(
                    pdf_text(confidence),
                    small_style,
                ),

                Paragraph(
                    pdf_text(
                        source_text,
                        "—",
                    ),
                    small_style,
                ),
            ])

        rule_table = Table(
            rule_data,

            colWidths=[
                43 * mm,
                25 * mm,
                38 * mm,
                25 * mm,
                49 * mm,
            ],

            repeatRows=1,
        )

        rule_table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#081D41"),
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    bold_font_name,
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    7.5,
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),
            ])
        )

        # ----------------------------------------------------
        # Color rule statuses
        # ----------------------------------------------------

        for row_index, rule in enumerate(
            rule_results,
            start=1,
        ):

            normalized_rule_status = (
                normalize_status(
                    rule.status
                )
            )

            if normalized_rule_status == "COMPLIANT":

                status_color = (
                    colors.HexColor("#15803D")
                )

            elif normalized_rule_status == "VIOLATION":

                status_color = (
                    colors.HexColor("#B91C1C")
                )

            else:

                status_color = (
                    colors.HexColor("#B45309")
                )

            rule_table.setStyle(
                TableStyle([
                    (
                        "TEXTCOLOR",
                        (1, row_index),
                        (1, row_index),
                        status_color,
                    ),

                    (
                        "FONTNAME",
                        (1, row_index),
                        (1, row_index),
                        bold_font_name,
                    ),
                ])
            )

        story.append(
            rule_table
        )

    else:

        story.append(
            Paragraph(
                "No rule results were recorded for this inspection.",
                normal_style,
            )
        )

    # ========================================================
    # Footer
    # ========================================================

    story.append(
        Spacer(
            1,
            8 * mm,
        )
    )

    story.append(
        Paragraph(
            "Generated by NiyamDrishti — Legal Metrology Label Compliance System.",
            small_style,
        )
    )

    story.append(
        Paragraph(
            "This report is generated from inspection data stored in the NiyamDrishti database.",
            small_style,
        )
    )

    # ========================================================
    # Page footer
    # ========================================================

    def draw_page_footer(canvas, document):

        canvas.saveState()

        canvas.setFont(
            font_name,
            7,
        )

        canvas.setFillColor(
            colors.HexColor("#64748B")
        )

        canvas.drawString(
            15 * mm,
            8 * mm,
            "NiyamDrishti",
        )

        canvas.drawRightString(
            A4[0] - 15 * mm,
            8 * mm,
            f"Page {document.page}",
        )

        canvas.restoreState()

    # ========================================================
    # Build PDF
    # ========================================================

    try:

        doc.build(
            story,
            onFirstPage=draw_page_footer,
            onLaterPages=draw_page_footer,
        )

    except Exception as pdf_error:

        print(
            "ERROR generating PDF:",
            repr(pdf_error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate PDF report: "
                f"{str(pdf_error)}"
            ),
        )

    buffer.seek(0)

    # ========================================================
    # Return PDF
    # ========================================================

    return StreamingResponse(
        buffer,

        media_type="application/pdf",

        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
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

    # --------------------------------------------------------
    # Force OpenAPI 3.0.3
    # --------------------------------------------------------

    openapi_schema["openapi"] = "3.0.3"

    # --------------------------------------------------------
    # Fix single-upload schema
    # --------------------------------------------------------

    single_schema = openapi_schema.get(
        "components",
        {}
    ).get(
        "schemas",
        {}
    ).get(
        "Body_analyze_label_analyze_label_post"
    )

    if single_schema:

        properties = (
            single_schema.get(
                "properties",
                {}
            )
        )

        if "file" in properties:

            properties["file"] = {
                "type": "string",
                "format": "binary",
            }

    # --------------------------------------------------------
    # Fix multi-upload schema
    # --------------------------------------------------------

    multi_schema = openapi_schema.get(
        "components",
        {}
    ).get(
        "schemas",
        {}
    ).get(
        "Body_analyze_multiple_labels_analyze_label_multi_post"
    )

    if multi_schema:

        properties = (
            multi_schema.get(
                "properties",
                {}
            )
        )

        if "files" in properties:

            properties["files"] = {
                "type": "array",
                "items": {
                    "type": "string",
                    "format": "binary",
                },
            }

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi
