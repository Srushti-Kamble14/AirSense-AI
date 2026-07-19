from sqlalchemy.orm import Session
from app.models.prediction import Prediction


def create_prediction(db: Session, data: dict):

    prediction = Prediction(**data)

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction