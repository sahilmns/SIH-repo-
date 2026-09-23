from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from sqlalchemy.orm import Session
from typing import List

from ruleengine import (
    LegalMetrologyRuleEngine,
    LegalMetrologyOCREngine
)

from database import get_db

from services.scan_service import (
    save_scan_result
)

import tempfile
import os


# ============================================================
# FASTAPI APP
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
        "https://labellens-0xkp.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# OCR ENGINE
# Initialize only once because PaddleOCR model loading
# is expensive.
# ============================================================

ocr_engine = LegalMetrologyOCREngine()


# ============================================================
# ALLOWED IMAGE FORMATS
# ============================================================

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "NiyamDrishti API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "OK",
        "message": "NiyamDrishti API is healthy"
    }


# ============================================================
# HELPER: SAVE UPLOADED FILE
# ============================================================

async def save_upload_to_temp(file: UploadFile):

    if not file.filename:
        raise ValueError("No file uploaded.")

    suffix = os.path.splitext(
        file.filename
    )[1].lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Unsupported image format. "
            "Allowed formats: JPG, JPEG, PNG, WEBP."
        )

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        temp_file.write(
            await file.read()
        )

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

        image_path = await save_upload_to_temp(
            file
        )

        # ----------------------------------------------------
        # OCR
        # ----------------------------------------------------

        ocr_result = ocr_engine.extract_to_json(
            image_path
        )

        # Preserve original filename
        ocr_result["image"] = file.filename

        # ----------------------------------------------------
        # Rule Engine
        # ----------------------------------------------------

        rule_engine = LegalMetrologyRuleEngine(
            ocr_result
        )

        # ----------------------------------------------------
        # Generate final report
        # ----------------------------------------------------

        final_report = (
            rule_engine.generate_final_report()
        )

        final_report[
            "compliance_report"
        ]["image"] = file.filename

        # ----------------------------------------------------
        # SAVE INSPECTION TO DATABASE
        # ----------------------------------------------------

        inspection = save_scan_result(
            db=db,
            final_report=final_report,
            uploaded_files=[
                {
                    "filename": file.filename,
                    "file_path": image_path,
                    "mime_type": file.content_type
                }
            ],
            ocr_results=[
                ocr_result
            ]
        )

        # ----------------------------------------------------
        # Return existing API response
        # + database information
        # ----------------------------------------------------

        response = final_report

        response["inspection"] = {
            "id": inspection.id,
            "inspection_code": inspection.inspection_code,
            "status": inspection.status
        }

        return response

    except Exception as e:

        db.rollback()

        return {
            "status": "ERROR",
            "message": str(e)
        }

    finally:

        # ----------------------------------------------------
        # Delete temporary image
        # ----------------------------------------------------

        if (
            image_path
            and os.path.exists(image_path)
        ):
            os.remove(image_path)


# ============================================================
# MULTI IMAGE ANALYSIS
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

        # ----------------------------------------------------
        # Validate number of images
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Store all OCR detections
        # ----------------------------------------------------

        all_detections = []
        image_names = []

        # ----------------------------------------------------
        # Process every image
        # ----------------------------------------------------

        for file in files:

            # -----------------------------------------------
            # Save image
            # -----------------------------------------------

            image_path = await save_upload_to_temp(
                file
            )

            image_paths.append(
                image_path
            )

            uploaded_files.append(
                {
                    "filename": file.filename,
                    "file_path": image_path,
                    "mime_type": file.content_type
                }
            )

            image_names.append(
                file.filename
            )

            # -----------------------------------------------
            # OCR
            # -----------------------------------------------

            ocr_result = (
                ocr_engine.extract_to_json(
                    image_path
                )
            )

            # Keep complete OCR result
            all_ocr_results.append(
                ocr_result
            )

            # -----------------------------------------------
            # Add source image to every detection
            # -----------------------------------------------

            for detection in ocr_result.get(
                "detections",
                []
            ):

                detection["source_image"] = (
                    file.filename
                )

                all_detections.append(
                    detection
                )

        # ----------------------------------------------------
        # CREATE COMBINED OCR RESULT
        # ----------------------------------------------------

        combined_ocr_result = {
            "image": image_names,
            "total_detections": len(
                all_detections
            ),
            "detections": all_detections
        }

        # ----------------------------------------------------
        # ONE RULE ENGINE FOR ALL IMAGES
        # ----------------------------------------------------

        rule_engine = LegalMetrologyRuleEngine(
            combined_ocr_result
        )

        # ----------------------------------------------------
        # GENERATE FINAL REPORT
        # ----------------------------------------------------

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
        # SAVE INSPECTION TO DATABASE
        # ----------------------------------------------------

        inspection = save_scan_result(
            db=db,
            final_report=final_report,
            uploaded_files=uploaded_files,
            ocr_results=all_ocr_results,
            combined_ocr_result=combined_ocr_result
        )

        # ----------------------------------------------------
        # Add database information
        # ----------------------------------------------------

        final_report["inspection"] = {
            "id": inspection.id,
            "inspection_code": inspection.inspection_code,
            "status": inspection.status
        }

        return final_report

    except Exception as e:

        db.rollback()

        return {
            "status": "ERROR",
            "message": str(e)
        }

    finally:

        # ----------------------------------------------------
        # Delete all temporary files
        # ----------------------------------------------------

        for image_path in image_paths:

            if os.path.exists(
                image_path
            ):
                os.remove(
                    image_path
                )


# ============================================================
# CUSTOM OPENAPI SCHEMA
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

    # Force OpenAPI 3.0
    openapi_schema["openapi"] = "3.0.3"

    schemas = (
        openapi_schema
        .get("components", {})
        .get("schemas", {})
    )

    # --------------------------------------------------------
    # Fix SINGLE image upload
    # --------------------------------------------------------

    single_schema_name = (
        "Body_analyze_label_analyze_label_post"
    )

    single_schema = schemas.get(
        single_schema_name
    )

    if single_schema:

        properties = single_schema.get(
            "properties",
            {}
        )

        file_schema = properties.get(
            "file"
        )

        if file_schema:

            file_schema["type"] = "string"
            file_schema["format"] = "binary"

            file_schema.pop(
                "contentMediaType",
                None
            )

    # --------------------------------------------------------
    # Keep MULTIPLE image upload working
    # --------------------------------------------------------

    multi_schema_name = (
        "Body_analyze_multiple_labels_analyze_label_multi_post"
    )

    multi_schema = schemas.get(
        multi_schema_name
    )

    if multi_schema:

        properties = multi_schema.get(
            "properties",
            {}
        )

        files_schema = properties.get(
            "files"
        )

        if files_schema:

            files_schema["items"] = {
                "type": "string",
                "format": "binary"
            }

            files_schema.pop(
                "contentMediaType",
                None
            )

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi
