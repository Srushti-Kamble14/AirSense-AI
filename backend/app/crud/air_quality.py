from sqlalchemy.orm import Session
from app.models.air_quality_data import AirQualityData


def create_air_quality(db: Session, data: dict):

    aq = AirQualityData(**data)

    db.add(aq)
    db.commit()
    db.refresh(aq)

    return aq