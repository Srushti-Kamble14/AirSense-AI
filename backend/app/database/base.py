"""Declarative SQLAlchemy base for future ORM models.
No database tables are declared or created in this foundation layer.
Feature-specific models will inherit from Base when schemas are designed.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
