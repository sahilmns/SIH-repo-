from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from ruleengine import (
    LegalMetrologyRuleEngine,
    LegalMetrologyOCREngine
)

import tempfile
import os


app = FastAPI(
    title="LabelLens API",
    description="Legal Metrology Label Compliance API",
    version="1.0"
)


# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Deployed frontend
        "https://labellens-0xkp.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create OCR engine only once
ocr_engine = LegalMetrologyOCREngine()


# -------------------------
# HOME
# -------------------------
@app.get("/")
def home():
    return {
        "message": "LabelLens API is running"
    }


# -------------------------
# ANALYZE LABEL
# -------------------------
@app.post("/analyze-label")
async def analyze_label(file: UploadFile = File(...)):

    # Check that a file was uploaded
    if not file.filename:
        return {
            "status": "ERROR",
            "message": "No file uploaded"
        }

    # Get image extension
    suffix = os.path.splitext(file.filename)[1].lower()

    # Allowed image formats
    allowed_extensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]

    if suffix not in allowed_extensions:
        return {
            "status": "ERROR",
            "message": "Unsupported image format"
        }

    # -------------------------
    # Save image temporarily
    # -------------------------
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        temp_file.write(await file.read())
        image_path = temp_file.name

    try:

        # -------------------------
        # OCR
        # -------------------------
        ocr_result = ocr_engine.extract_to_json(
            image_path
        )

        # -------------------------
        # RULE ENGINE
        # -------------------------
        rule_engine = LegalMetrologyRuleEngine(
            ocr_result
        )

        # -------------------------
        # FINAL REPORT
        # -------------------------
        final_report = rule_engine.generate_final_report()

        # Add original filename
        final_report["compliance_report"]["image"] = file.filename

        return final_report

    except Exception as e:

        return {
            "status": "ERROR",
            "message": str(e)
        }

    finally:

        # Delete temporary image
        if os.path.exists(image_path):
            os.remove(image_path)

