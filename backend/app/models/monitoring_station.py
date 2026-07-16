from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class MonitoringStation(Base):
    __tablename__ = "monitoring_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_name = Column(String, nullable=False)
    provider = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    is_mobile = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())