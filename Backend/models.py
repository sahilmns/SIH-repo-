from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    Index,
)

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from database import Base


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)

    email = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )

    role = Column(
        String(50),
        nullable=False,
        default="INSPECTOR",
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    inspections = relationship(
        "Inspection",
        back_populates="user",
    )


# ============================================================
# INSPECTION
# ============================================================

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Human-readable ID shown in History / Reports
    inspection_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # Inspector / user who performed the inspection.
    # Nullable for now because your current frontend
    # authentication is localStorage-based.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    # physical / online
    inspection_type = Column(
        String(30),
        nullable=False,
        default="physical",
        index=True,
    )

    # Current lifecycle state of the inspection.
    #
    # CREATED
    # ANALYZING
    # COMPLETED
    # ERROR
    status = Column(
        String(30),
        nullable=False,
        default="CREATED",
        index=True,
    )

    # --------------------------------------------------------
    # PRODUCT INFORMATION
    # --------------------------------------------------------

    product_name = Column(
        String(255),
        nullable=True,
    )

    brand_name = Column(
        String(255),
        nullable=True,
    )

    category = Column(
        String(150),
        nullable=True,
    )

    # Keep the original user-entered value.
    # We should not assume it is always a clean numeric value.
    mrp = Column(
        String(100),
        nullable=True,
    )

    # Same reasoning as MRP:
    # "1 kg", "500 g", "250 mL", etc.
    net_quantity = Column(
        String(100),
        nullable=True,
    )

    # Used primarily by the online inspection flow.
    product_url = Column(
        Text,
        nullable=True,
    )

    # --------------------------------------------------------
    # COMPLIANCE SUMMARY
    # --------------------------------------------------------

    overall_status = Column(
        String(30),
        nullable=True,
        index=True,
    )

    compliance_percentage = Column(
        Float,
        nullable=True,
    )

    total_checks = Column(
        Integer,
        nullable=False,
        default=0,
    )

    passed_checks = Column(
        Integer,
        nullable=False,
        default=0,
    )

    partial_checks = Column(
        Integer,
        nullable=False,
        default=0,
    )

    failed_checks = Column(
        Integer,
        nullable=False,
        default=0,
    )

    average_ocr_confidence = Column(
        Float,
        nullable=True,
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        index=True,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # --------------------------------------------------------
    # RELATIONSHIPS
    # --------------------------------------------------------

    user = relationship(
        "User",
        back_populates="inspections",
    )

    images = relationship(
        "InspectionImage",
        back_populates="inspection",
        cascade="all, delete-orphan",
    )

    ocr_detections = relationship(
        "OCRDetection",
        back_populates="inspection",
        cascade="all, delete-orphan",
    )

    rule_results = relationship(
        "RuleResult",
        back_populates="inspection",
        cascade="all, delete-orphan",
    )

    location = relationship(
        "InspectionLocation",
        back_populates="inspection",
        uselist=False,
        cascade="all, delete-orphan",
    )

    online_listing = relationship(
        "OnlineListing",
        back_populates="inspection",
        uselist=False,
        cascade="all, delete-orphan",
    )


# ============================================================
# INSPECTION IMAGE
# ============================================================

class InspectionImage(Base):
    __tablename__ = "inspection_images"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    original_filename = Column(
        String(255),
        nullable=False,
    )

    stored_filename = Column(
        String(255),
        nullable=False,
    )

    file_path = Column(
        Text,
        nullable=False,
    )

    mime_type = Column(
        String(100),
        nullable=True,
    )

    file_size = Column(
        Integer,
        nullable=True,
    )

    # Position of image in the inspection:
    # 1, 2, 3...
    image_order = Column(
        Integer,
        nullable=False,
        default=1,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    inspection = relationship(
        "Inspection",
        back_populates="images",
    )

    ocr_detections = relationship(
        "OCRDetection",
        back_populates="image",
        cascade="all, delete-orphan",
    )


# ============================================================
# OCR DETECTION
# ============================================================

class OCRDetection(Base):
    __tablename__ = "ocr_detections"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    image_id = Column(
        Integer,
        ForeignKey("inspection_images.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    detection_index = Column(
        Integer,
        nullable=True,
    )

    text = Column(
        Text,
        nullable=False,
    )

    confidence = Column(
        Float,
        nullable=True,
    )

    # OCR bounding box
    x1 = Column(Float, nullable=True)
    y1 = Column(Float, nullable=True)
    x2 = Column(Float, nullable=True)
    y2 = Column(Float, nullable=True)

    width_pixels = Column(
        Float,
        nullable=True,
    )

    height_pixels = Column(
        Float,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    inspection = relationship(
        "Inspection",
        back_populates="ocr_detections",
    )

    image = relationship(
        "InspectionImage",
        back_populates="ocr_detections",
    )

    evidence_links = relationship(
        "RuleResultEvidence",
        back_populates="ocr_detection",
        cascade="all, delete-orphan",
    )


# ============================================================
# RULE RESULT
# ============================================================

class RuleResult(Base):
    __tablename__ = "rule_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Stable internal rule identifier.
    # Example:
    # MRP
    # NET_QUANTITY
    # CONSUMER_CARE
    rule_code = Column(
        String(100),
        nullable=True,
        index=True,
    )

    # Human-readable name returned to frontend.
    # Example:
    # "MRP"
    # "Net Quantity"
    # "Manufacturer / Packer / Importer"
    rule_name = Column(
        String(255),
        nullable=False,
    )

    # PASS / PARTIAL / VIOLATION
    status = Column(
        String(30),
        nullable=False,
        index=True,
    )

    found = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # Human-readable detected value.
    value = Column(
        Text,
        nullable=True,
    )

    confidence = Column(
        Float,
        nullable=True,
    )

    source_text = Column(
        Text,
        nullable=True,
    )

    # Preserve the bounding box returned by
    # the rule engine without losing structure.
    bounding_box = Column(
        JSONB,
        nullable=True,
    )

    # Rule-specific structured information.
    #
    # Example:
    # {
    #     "mrp": 30,
    #     "currency": "INR"
    # }
    #
    # or:
    #
    # {
    #     "quantity": 250,
    #     "unit": "g"
    # }
    result_data = Column(
        JSONB,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    inspection = relationship(
        "Inspection",
        back_populates="rule_results",
    )

    evidence_links = relationship(
        "RuleResultEvidence",
        back_populates="rule_result",
        cascade="all, delete-orphan",
    )


# ============================================================
# RULE RESULT ↔ OCR EVIDENCE
# ============================================================

class RuleResultEvidence(Base):
    __tablename__ = "rule_result_evidence"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    rule_result_id = Column(
        Integer,
        ForeignKey("rule_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    ocr_detection_id = Column(
        Integer,
        ForeignKey("ocr_detections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    rule_result = relationship(
        "RuleResult",
        back_populates="evidence_links",
    )

    ocr_detection = relationship(
        "OCRDetection",
        back_populates="evidence_links",
    )


# ============================================================
# INSPECTION LOCATION
# ============================================================

class InspectionLocation(Base):
    __tablename__ = "inspection_locations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    location_name = Column(
        String(255),
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    city = Column(
        String(100),
        nullable=True,
    )

    district = Column(
        String(100),
        nullable=True,
    )

    state = Column(
        String(100),
        nullable=True,
    )

    pincode = Column(
        String(20),
        nullable=True,
    )

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    inspection = relationship(
        "Inspection",
        back_populates="location",
    )


# ============================================================
# ONLINE LISTING
# ============================================================

class OnlineListing(Base):
    __tablename__ = "online_listings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    url = Column(
        Text,
        nullable=False,
    )

    source_domain = Column(
        String(255),
        nullable=True,
    )

    product_name = Column(
        String(255),
        nullable=True,
    )

    brand_name = Column(
        String(255),
        nullable=True,
    )

    category = Column(
        String(150),
        nullable=True,
    )

    mrp = Column(
        String(100),
        nullable=True,
    )

    net_quantity = Column(
        String(100),
        nullable=True,
    )

    # Keep the complete fetched listing response.
    listing_data = Column(
        JSONB,
        nullable=True,
    )

    fetched_at = Column(
        DateTime,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    inspection = relationship(
        "Inspection",
        back_populates="online_listing",
    )

    matches = relationship(
        "OnlineMatch",
        back_populates="online_listing",
        cascade="all, delete-orphan",
    )


# ============================================================
# ONLINE MATCH
# ============================================================

class OnlineMatch(Base):
    __tablename__ = "online_matches"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    online_listing_id = Column(
        Integer,
        ForeignKey("online_listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Example:
    # product_name
    # brand_name
    # mrp
    # net_quantity
    field_name = Column(
        String(100),
        nullable=False,
    )

    physical_value = Column(
        Text,
        nullable=True,
    )

    online_value = Column(
        Text,
        nullable=True,
    )

    # MATCH / MISMATCH / NOT_AVAILABLE
    match_status = Column(
        String(30),
        nullable=False,
    )

    confidence = Column(
        Float,
        nullable=True,
    )

    details = Column(
        JSONB,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    online_listing = relationship(
        "OnlineListing",
        back_populates="matches",
    )


# ============================================================
# INDEXES
# ============================================================

Index(
    "ix_rule_results_inspection_status",
    RuleResult.inspection_id,
    RuleResult.status,
)

Index(
    "ix_ocr_detections_inspection_image",
    OCRDetection.inspection_id,
    OCRDetection.image_id,
)

Index(
    "ix_online_matches_inspection_field",
    OnlineMatch.inspection_id,
    OnlineMatch.field_name,
)
