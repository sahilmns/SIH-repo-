from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi.openapi.utils import get_openapi

from ruleengine import (
    LegalMetrologyRuleEngine,
    LegalMetrologyOCREngine
)

import tempfile
import os


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="LabelLens API",
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
        "message": "LabelLens API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "OK",
        "message": "LabelLens API is healthy"
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
    file: UploadFile = File(...)
):

    image_path = None

    try:

        # ----------------------------------------------------
        # Save uploaded image
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

        # ----------------------------------------------------
        # Preserve original image filename
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Add image information
        # ----------------------------------------------------

        final_report["compliance_report"]["image"] = (
            file.filename
        )

        return final_report

    except Exception as e:

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
    files: List[UploadFile] = File(...)
):

    image_paths = []

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

        # ----------------------------------------------------
        # ADD IMAGE INFORMATION
        # ----------------------------------------------------

        final_report["compliance_report"][
            "images"
        ] = image_names

        final_report["compliance_report"][
            "total_images"
        ] = len(files)

        return final_report

    except Exception as e:

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
#
# This changes the generated file-array schema from:
#
#     array<string>
#
# to the Swagger-compatible:
#
#     array of binary files
#
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
    # Force OpenAPI 3.0 format
    # --------------------------------------------------------

    openapi_schema["openapi"] = "3.0.3"

    # --------------------------------------------------------
    # Locate the multi-upload request body
    # --------------------------------------------------------

    schemas = openapi_schema.get(
        "components",
        {}
    ).get(
        "schemas",
        {}
    )

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

            # Make each array item an actual binary file
            files_schema["items"] = {
                "type": "string",
                "format": "binary"
            }

            # Remove OpenAPI 3.1-specific representation
            files_schema.pop(
                "contentMediaType",
                None
            )

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi
