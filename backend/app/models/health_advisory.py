from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class HealthAdvisory(Base):
    __tablename__ = "health_advisories"

    id = Column(Integer, primary_key=True, index=True)
    aqi_category = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    message = Column(String, nullable=False)
    recommended_action = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False
    )

    location = relationship(
        "Location",
        back_populates="health_advisories"
    )
