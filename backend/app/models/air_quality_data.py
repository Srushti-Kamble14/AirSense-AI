from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class AirQualityData(Base):
    __tablename__ = "air_quality_data"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String)

    recorded_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())