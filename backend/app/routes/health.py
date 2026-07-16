"""Health check route for backend uptime verification.
This endpoint confirms the FastAPI service is running without touching external systems.
It is intentionally lightweight for local development and deployment probes.
"""

from fastapi import APIRouter


router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "success",
        "message": "AirSenseAI Backend Running",
    }
