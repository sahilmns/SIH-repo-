from database import engine, Base

from models import (
    User,
    Inspection,
    InspectionImage,
    OCRDetection,
    RuleResult,
    RuleResultEvidence,
    InspectionLocation,
)

print("========================================")
print("Creating NiyamDrishti database tables...")
print("========================================")

try:
    Base.metadata.create_all(bind=engine)

    print()
    print("Database tables created successfully!")
    print()
    print("Tables:")
    print(" - users")
    print(" - inspections")
    print(" - inspection_images")
    print(" - ocr_detections")
    print(" - rule_results")
    print(" - rule_result_evidence")
    print(" - inspection_locations")
    print()

except Exception as e:
    print()
    print("Database table creation failed!")
    print()
    print(e)
