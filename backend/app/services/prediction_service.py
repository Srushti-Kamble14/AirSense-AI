"""AQI prediction service backed by the trained ML artifacts."""

from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "ml" / "models"
MODEL_PATH = MODEL_DIR / "model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
FEATURE_DEFAULTS_PATH = MODEL_DIR / "feature_defaults.pkl"

_model: Any | None = None
_feature_columns: list[str] | None = None
_feature_defaults: dict[str, Any] | None = None


class PredictionServiceError(Exception):
    """Raised when model loading, feature preparation, or prediction fails."""


def load_model() -> None:
    """Load model artifacts once for the application process."""
    global _model, _feature_columns, _feature_defaults

    if _model is not None and _feature_columns is not None and _feature_defaults is not None:
        return

    try:
        _model = joblib.load(MODEL_PATH)
        _feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
        _feature_defaults = joblib.load(FEATURE_DEFAULTS_PATH)
    except Exception as exc:
        logger.exception("Failed to load AQI prediction artifacts.")
        raise PredictionServiceError("Prediction model is unavailable.") from exc

    logger.info("AQI prediction model loaded with %d features.", len(_feature_columns))


def _aqi_category(aqi: float) -> str:
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    if aqi <= 200:
        return "Unhealthy"
    if aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"


def health_advisory(category: str) -> str:
    advisories = {
        "Good": "Air quality is good. Outdoor activities are safe.",
        "Moderate": "Sensitive individuals should reduce prolonged outdoor exposure.",
        "Unhealthy for Sensitive Groups": "Sensitive groups should avoid prolonged outdoor activity.",
        "Unhealthy": "Wear an N95 mask and limit outdoor exercise.",
        "Very Unhealthy": "Avoid outdoor activities.",
        "Hazardous": "Remain indoors whenever possible.",
    }
    return advisories.get(category, "Monitor local air quality before outdoor activity.")



def _normalize_visibility(value: Any) -> Any:
    if not isinstance(value, (int, float)):
        return value
    return value / 1000 if value > 100 else value

def _season_for_month(month: int) -> str:
    if month in {12, 1, 2}:
        return "winter"
    if month in {3, 4, 5}:
        return "summer"
    if month in {6, 7, 8, 9}:
        return "monsoon"
    return "post-monsoon"


def prepare_features(weather_data: dict[str, Any], air_quality_data: dict[str, Any]) -> pd.DataFrame:
    """Merge live service data and defaults into the saved model feature order."""
    load_model()
    if _feature_columns is None or _feature_defaults is None:
        raise PredictionServiceError("Prediction model features are unavailable.")

    now = datetime.now()
    live_values: dict[str, Any] = {
        "year": now.year,
        "month": now.month,
        "day": now.day,
        "hour": now.hour,
        "day_of_week": now.strftime("%A"),
        "is_weekend": int(now.weekday() >= 5),
        "season": _season_for_month(now.month),
        "city": weather_data.get("city"),
        "station": air_quality_data.get("station"),
        "latitude": air_quality_data.get("latitude"),
        "longitude": air_quality_data.get("longitude"),
        "temperature": weather_data.get("temperature"),
        "humidity": weather_data.get("humidity"),
        "wind_speed": weather_data.get("wind_speed"),
        "visibility": _normalize_visibility(weather_data.get("visibility")),
        "pm25": air_quality_data.get("pm25"),
        "pm10": air_quality_data.get("pm10"),
        "no2": air_quality_data.get("no2"),
        "so2": air_quality_data.get("so2"),
        "co": air_quality_data.get("co"),
        "o3": air_quality_data.get("o3"),
    }

    row = {
        feature: live_values.get(feature)
        if live_values.get(feature) is not None
        else _feature_defaults.get(feature)
        for feature in _feature_columns
    }
    return pd.DataFrame([row], columns=_feature_columns)


def predict(weather_data: dict[str, Any], air_quality_data: dict[str, Any]) -> dict[str, Any]:
    """Predict AQI from merged weather and air quality values."""
    load_model()
    if _model is None:
        raise PredictionServiceError("Prediction model is unavailable.")

    try:
        features = prepare_features(weather_data, air_quality_data)
        predicted_aqi = float(_model.predict(features)[0])
    except Exception as exc:
        logger.exception("AQI prediction failed.")
        raise PredictionServiceError("Prediction failed.") from exc

    predicted_aqi = round(max(0.0, predicted_aqi), 2)
    category = _aqi_category(predicted_aqi)
    return {
        "predicted_aqi": predicted_aqi,
        "category": category,
        "health_advisory": health_advisory(category),
    }

