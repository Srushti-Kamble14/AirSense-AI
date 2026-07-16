from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, nullable=False)
    state = Column(String)
    country = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stations = relationship(
        "MonitoringStation",
        back_populates="location",
        cascade="all, delete-orphan"
    )

    weather_records = relationship(
        "WeatherData",
        back_populates="location",
        cascade="all, delete-orphan"
    )

    predictions = relationship(
        "Prediction",
        back_populates="location",
        cascade="all, delete-orphan"
    )