"""Reusable SQLAlchemy session factory and dependency helpers.
Routes and services will request database sessions through this module.
Session lifecycle is handled centrally to keep API code consistent.
"""

from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.database.database import engine


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    if engine is None:
        raise RuntimeError("DATABASE_URL is not configured.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
