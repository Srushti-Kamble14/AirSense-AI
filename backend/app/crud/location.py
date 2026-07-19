from sqlalchemy.orm import Session
from app.models.location import Location


def get_all_locations(db: Session):
    return db.query(Location).all()