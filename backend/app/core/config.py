"""
Central place for environment-driven settings.
Add these to your .env file:

    OPENAQ_API_KEY=your_openaq_key_here
    OPENWEATHER_API_KEY=your_openweather_key_here

Get an OpenAQ key (free) at: https://explore.openaq.org/register
Get an OpenWeatherMap key (free) at: https://home.openweathermap.org/users/sign_up
"""
import os
from functools import lru_cache


class Settings:
    OPENAQ_API_KEY: str = os.getenv("OPENAQ_API_KEY", "")
    OPENAQ_BASE_URL: str = "https://api.openaq.org/v3"

    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"

    NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"

    # Nominatim's usage policy requires a descriptive User-Agent identifying your app
    NOMINATIM_USER_AGENT: str = "AirSenseAI/1.0"

    HTTP_TIMEOUT_SECONDS: float = 10.0

@lru_cache
def get_settings() -> Settings:
    return Settings()