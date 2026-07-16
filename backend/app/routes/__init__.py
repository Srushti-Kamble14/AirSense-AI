"""API router registry for the AirSenseAI backend.
This package exposes a single router that main.py can include cleanly.
Additional route modules will be registered here as features are added.
"""

from fastapi import APIRouter

from app.routes.health import router as health_router


api_router = APIRouter()
api_router.include_router(health_router)
