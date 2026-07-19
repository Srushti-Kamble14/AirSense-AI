"""
Health Advisory Service

Generates health recommendations
based on predicted AQI.
"""


class AdvisoryService:

    @staticmethod
    async def generate(predicted_aqi: float) -> dict:

        if predicted_aqi <= 50:

            return {
                "category": "Good",
                "message": "Air quality is satisfactory.",
                "advice": [
                    "Enjoy outdoor activities."
                ]
            }

        elif predicted_aqi <= 100:

            return {
                "category": "Moderate",
                "message": "Acceptable air quality.",
                "advice": [
                    "Sensitive individuals should reduce prolonged outdoor activity."
                ]
            }

        elif predicted_aqi <= 200:

            return {
                "category": "Poor",
                "message": "Air pollution may affect sensitive groups.",
                "advice": [
                    "Wear a mask outdoors.",
                    "Avoid heavy exercise."
                ]
            }

        elif predicted_aqi <= 300:

            return {
                "category": "Very Poor",
                "message": "Health effects likely.",
                "advice": [
                    "Wear an N95 mask.",
                    "Avoid outdoor activities.",
                    "Keep windows closed."
                ]
            }

        else:

            return {
                "category": "Severe",
                "message": "Emergency conditions.",
                "advice": [
                    "Stay indoors.",
                    "Wear an N95 mask.",
                    "Use air purifier.",
                    "Avoid all outdoor exercise."
                ]
            }