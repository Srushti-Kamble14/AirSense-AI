"""
Prediction Service

Responsible for generating AQI predictions using
latest weather and air quality data.

Current Version:
Dummy prediction logic.

Future:
Random Forest
XGBoost
LSTM
"""

from datetime import datetime


class PredictionService:

    @staticmethod
    async def predict(weather: dict, air_quality: dict) -> dict:
        """
        Predict AQI for next 24, 48 and 72 hours.
        """

        pm25 = air_quality.get("pm25", 0) or 0
        pm10 = air_quality.get("pm10", 0) or 0
        no2 = air_quality.get("no2", 0) or 0

        current_aqi = (pm25 * 0.5) + (pm10 * 0.3) + (no2 * 0.2)

        prediction = {
            "current_aqi": round(current_aqi, 2),
            "aqi_24hr": round(current_aqi + 5, 2),
            "aqi_48hr": round(current_aqi + 10, 2),
            "aqi_72hr": round(current_aqi + 15, 2),
            "generated_at": datetime.utcnow(),
        }

        return prediction