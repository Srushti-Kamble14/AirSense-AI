"""Model package reserved for future SQLAlchemy ORM definitions.
No database tables are created in the current backend foundation.
Domain models will be introduced only after the data schema is finalized.
"""
from .user import User
from .location import Location
from .monitoring_station import MonitoringStation
from .sensor import Sensor
from .air_quality_data import AirQualityData
from .weather_data import WeatherData
from .prediction import Prediction
from .health_advisory import HealthAdvisory
