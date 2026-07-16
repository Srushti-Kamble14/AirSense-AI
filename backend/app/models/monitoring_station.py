from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

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

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False
    )

    location = relationship(
        "Location",
        back_populates="stations"
    )

    sensors = relationship(
        "Sensor",
        back_populates="station",
        cascade="all, delete-orphan"
    )