"""FastAPI application factory and ASGI entry point for AirSenseAI.
This module wires middleware, logging, settings, and the initial API routes.
Business features will be added through routers and services in later phases.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.logging import configure_logging
from app.config.settings import settings
from app.routes import api_router



configure_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description="Backend infrastructure for the AirSenseAI smart city platform.",
)

@app.get("/")
def root():
    return {
        "message": "Welcome to AirSenseAI Backend 🚀"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
