"""
Shared exception types for external API integrations.
Routes catch these and translate them into proper HTTP responses.
"""


class ExternalAPIError(Exception):
    """Base class for any error talking to an upstream API."""
    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class CityNotFoundError(ExternalAPIError):
    def __init__(self, city: str):
        super().__init__(f"City '{city}' could not be found.", status_code=404)


class NoStationsFoundError(ExternalAPIError):
    def __init__(self, city: str):
        super().__init__(f"No monitoring stations found near '{city}'.", status_code=404)


class StationNotFoundError(ExternalAPIError):
    def __init__(self, station_id: int):
        super().__init__(f"Monitoring station with id {station_id} not found.", status_code=404)


class SensorNotFoundError(ExternalAPIError):
    def __init__(self, sensor_id: int):
        super().__init__(f"Sensor with id {sensor_id} not found.", status_code=404)


class UpstreamTimeoutError(ExternalAPIError):
    def __init__(self, service: str):
        super().__init__(f"{service} API request timed out.", status_code=504)


class InvalidAPIKeyError(ExternalAPIError):
    def __init__(self, service: str):
        super().__init__(f"{service} API key is missing or invalid.", status_code=401)


class UpstreamServiceError(ExternalAPIError):
    def __init__(self, service: str, detail: str = ""):
        msg = f"{service} API returned an unexpected error."
        if detail:
            msg += f" Detail: {detail}"
        super().__init__(msg, status_code=502)