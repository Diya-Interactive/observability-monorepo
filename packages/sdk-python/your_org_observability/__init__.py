"""
your-org-observability - Zero-dependency observability SDK for Python and Django
"""

from .logger import (
    ObservabilityLogger,
    default_logger,
    logger,
    debug,
    info,
    warn,
    error,
    critical,
)
from .middleware import ObservabilityMiddleware
from .health_check import health_view, live_view, ready_view, get_health_urls
from .error_capturer import setup_error_handlers
from .types import LogEntry, LogLevel, ObservabilityConfig

__version__ = "1.0.0"
VERSION = "1.0.0"

__all__ = [
    "ObservabilityLogger",
    "default_logger",
    "logger",
    "debug",
    "info",
    "warn",
    "error",
    "critical",
    "ObservabilityMiddleware",
    "health_view",
    "live_view",
    "ready_view",
    "get_health_urls",
    "setup_error_handlers",
    "LogEntry",
    "LogLevel",
    "ObservabilityConfig",
    "VERSION",
    "__version__",
]
