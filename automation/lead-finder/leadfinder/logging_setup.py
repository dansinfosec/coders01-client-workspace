"""Structured logging setup shared by the CLI and modules."""

from __future__ import annotations

import logging

LOGGER_NAME = "leadfinder"


def get_logger() -> logging.Logger:
    return logging.getLogger(LOGGER_NAME)


def configure(level: str = "INFO") -> logging.Logger:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)-7s [%(name)s] %(message)s",
        datefmt="%H:%M:%S",
    )
    return get_logger()
