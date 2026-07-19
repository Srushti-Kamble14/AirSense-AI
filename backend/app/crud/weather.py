from sqlalchemy.orm import Session
from app.models.weather_data import WeatherData


def create_weather(db: Session, data: dict):

    weather = WeatherData(**data)

    db.add(weather)
    db.commit()
    db.refresh(weather)

    return weather