"""Logging configuration for backend runtime visibility.
This module defines a reusable logging setup for API startup and diagnostics.
Application modules should use standard Python loggers after this is configured.
"""

import logging


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
