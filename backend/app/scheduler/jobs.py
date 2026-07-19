import asyncio

from app.scheduler.logger import logger

from app.database.database import SessionLocal

# Services
from app.services.weather_service import get_current_weather
from app.services.openaq_service import OpenAQService
from app.services.prediction_service import PredictionService
from app.services.advisory_service import AdvisoryService

# CRUD
from app.crud.weather import create_weather
from app.crud.air_quality import create_air_quality
from app.crud.prediction import create_prediction
from app.crud.advisory import create_advisory
from app.crud.location import get_all_locations


MAX_RETRIES = 3
RETRY_DELAY = 2
RATE_LIMIT_DELAY = 1


async def fetch_and_store_data():

    logger.info("========== Scheduler Started ==========")

    db = SessionLocal()

    try:

        locations = get_all_locations(db)

        logger.info("Locations found = %d", len(locations))

        for location in locations:

            city = location.city_name

            logger.info("Fetching city=%s", city)

            for attempt in range(MAX_RETRIES):

                try:

                    # ---------------- Weather ----------------
                    weather = await get_current_weather(city=city)

                    create_weather(
                        db=db,
                        data=weather,
                    )

                    logger.info("Weather fetched successfully")

                    # ---------------- Air Quality ----------------
                    aq = await OpenAQService.get_air_quality(city)

                    create_air_quality(
                        db=db,
                        data=aq,
                    )

                    logger.info("Air Quality fetched successfully")

                    # ---------------- Prediction ----------------
                    prediction = await PredictionService.predict(
                        weather,
                        aq,
                    )

                    create_prediction(
                        db=db,
                        data=prediction,
                    )

                    logger.info("Prediction generated")

                    # ---------------- Advisory ----------------
                    advisory = await AdvisoryService.generate(
                        prediction["aqi_24hr"]
                    )

                    create_advisory(
                        db=db,
                        data=advisory,
                    )

                    logger.info("Health advisory generated")

                    logger.info("Completed city=%s", city)

                    success = True
                    break

                except Exception as e:

                    logger.warning(
                        "Attempt %d failed for city=%s Error=%s",
                        attempt + 1,
                        city,
                        str(e),
                    )

                    await asyncio.sleep(RETRY_DELAY)

            if not success:

                logger.error(
                    "All retries failed for city=%s",
                    city,
                )

            # Rate Limiting
            await asyncio.sleep(RATE_LIMIT_DELAY)

        logger.info("========== Scheduler Finished ==========")

    finally:

        db.close()