from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    predicted_aqi = Column(Float)
    confidence = Column(Float)
    model_name = Column(String)

    prediction_time = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False
    )

    location = relationship(
        "Location",
        back_populates="predictions"
    )

    health_advisories = relationship(
        "HealthAdvisory",
        back_populates="prediction",
     cascade="all, delete-orphan",
    )