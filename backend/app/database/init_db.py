"""Database initialization helpers.

This module imports ORM models before creating tables so Base.metadata is
populated with every mapped table.
"""

import logging

from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.database.base import Base

# Importing app.models registers every model class on the shared Base.metadata.
import app.models  # noqa: F401


logger = logging.getLogger(__name__)


def init_db(engine: Engine) -> None:
    """Connect to the configured database and create missing tables."""
    with engine.connect() as connection:
        database_name = connection.execute(text("select current_database()")).scalar_one()

    logger.info("Database Connected: %s", database_name)

    discovered_tables = list(Base.metadata.tables.keys())
    print(Base.metadata.tables.keys())
    logger.info("Models discovered: %s", ", ".join(discovered_tables) or "none")

    if not discovered_tables:
        raise RuntimeError(
            "No SQLAlchemy models were discovered. Ensure app.models imports every model "
            "and each model inherits from app.database.base.Base."
        )

    logger.info("Creating Tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully")
