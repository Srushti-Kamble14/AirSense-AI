"""FastAPI application factory and ASGI entry point for AirSenseAI.
This module wires middleware, logging, settings, routing, and DB test plumbing.
Business features will be added through routers and services in later phases.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.config.logging import configure_logging
from app.config.settings import settings
from app.database.database import get_engine
from app.routes import api_router


configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description="Backend infrastructure for the AirSenseAI smart city platform.",
)


@app.get("/")
def root():
    return {"message": "Welcome to AirSenseAI Backend"}


@app.get("/db-test")
def database_connection_test():
    try:
        with get_engine().connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar_one()

        return {
            "status": "success",
            "database": "Connected",
            "result": result,
        }
    except (RuntimeError, SQLAlchemyError, ModuleNotFoundError):
        logger.exception("Database connection test failed.")
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": "Database connection failed",
            },
        )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
