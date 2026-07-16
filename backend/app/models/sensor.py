from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_name = Column(String, nullable=False)
    parameter = Column(String, nullable=False)
    unit = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    station_id = Column(
        Integer,
        ForeignKey("monitoring_stations.id"),
        nullable=False
    )

    station = relationship(
        "MonitoringStation",
        back_populates="sensors"
    )

    air_quality_records = relationship(
        "AirQualityData",
        back_populates="sensor",
        cascade="all, delete-orphan"
    )
