from sqlalchemy.orm import Session
from app.models.health_advisory import HealthAdvisory


def create_advisory(db: Session, data: dict):

    advisory = HealthAdvisory(**data)

    db.add(advisory)
    db.commit()
    db.refresh(advisory)

    return advisory