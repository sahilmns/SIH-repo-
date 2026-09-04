from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, completed, failed
    input_data = Column(JSON, nullable=True)    # Front-end input JSON
    analysis_result = Column(JSON, nullable=True) # Result from external API
    compliance_result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)