"""Runtime AQI prediction helper.

Example:
    python ml/predict.py --input "{\"pm25\": 80, \"pm10\": 160, \"no2\": 45}"
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
FEATURE_DEFAULTS_PATH = MODEL_DIR / "feature_defaults.pkl"


def get_aqi_category(aqi: float) -> str:
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Satisfactory"
    if aqi <= 200:
        return "Moderate"
    if aqi <= 300:
        return "Poor"
    if aqi <= 400:
        return "Very Poor"
    return "Severe"


def load_artifacts(
    model_path: Path = MODEL_PATH,
    feature_columns_path: Path = FEATURE_COLUMNS_PATH,
    feature_defaults_path: Path = FEATURE_DEFAULTS_PATH,
) -> tuple[Any, list[str], dict[str, Any]]:
    model = joblib.load(model_path)
    feature_columns = joblib.load(feature_columns_path)
    defaults = joblib.load(feature_defaults_path) if feature_defaults_path.exists() else {}
    return model, feature_columns, defaults


def prepare_input(payload: dict[str, Any], feature_columns: list[str], defaults: dict[str, Any]) -> pd.DataFrame:
    row = {}
    missing_without_default = []

    normalized_payload = {key.lower(): value for key, value in payload.items()}
    for feature in feature_columns:
        if feature in payload:
            row[feature] = payload[feature]
        elif feature.lower() in normalized_payload:
            row[feature] = normalized_payload[feature.lower()]
        elif feature in defaults:
            row[feature] = defaults[feature]
        else:
            missing_without_default.append(feature)

    if missing_without_default:
        raise ValueError(
            "Missing required prediction features: "
            + ", ".join(missing_without_default)
        )

    return pd.DataFrame([row], columns=feature_columns)


def predict_aqi(payload: dict[str, Any]) -> dict[str, Any]:
    model, feature_columns, defaults = load_artifacts()
    frame = prepare_input(payload, feature_columns, defaults)
    prediction = float(model.predict(frame)[0])
    bounded_prediction = max(0.0, min(500.0, prediction))

    return {
        "predicted_aqi": round(bounded_prediction, 2),
        "aqi_category": get_aqi_category(bounded_prediction),
        "confidence": None,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict AQI from a JSON feature dictionary.")
    parser.add_argument("--input", required=True, help="JSON object containing weather and pollution values.")
    args = parser.parse_args()
    payload = json.loads(args.input)
    print(json.dumps(predict_aqi(payload), indent=2))


if __name__ == "__main__":
    main()
