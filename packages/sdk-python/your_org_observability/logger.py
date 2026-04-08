"""
your-org-observability - Core logger implementation
"""

import json
import sys
import os
import threading
import traceback
from datetime import datetime
from typing import Optional, Callable, Any
from .types import LogEntry, LogLevel, ObservabilityConfig


class ObservabilityLogger:
    """Structured JSON logger for Python and Django services"""

    def __init__(self, config: ObservabilityConfig) -> None:
        """
        Initialize the logger with configuration
        
        Args:
            config: ObservabilityConfig dictionary
        """
        self.service = config.get("service", "unknown-service")
        self.environment = config.get("environment") or os.environ.get("DJANGO_ENV", "development")
        self.skip_routes = config.get("skip_routes", ["/health", "/metrics"])
        
        # Thread-local storage for request_id
        self._local = threading.local()

    def _get_entry(
        self,
        level: LogLevel,
        msg: str,
        **kwargs: Any,
    ) -> LogEntry:
        """Create a complete log entry"""
        entry: LogEntry = {
            "level": level,
            "msg": msg,
            "service": self.service,
            "environment": self.environment,
            "ts": datetime.utcnow().isoformat() + "Z",
            "request_id": self.get_request_id(),
            "user_id": kwargs.get("user_id"),
            "duration_ms": kwargs.get("duration_ms"),
            "status_code": kwargs.get("status_code"),
            "route": kwargs.get("route"),
            "error": kwargs.get("error"),
            "traceback": kwargs.get("traceback"),
        }
        return entry

    def _log(
        self,
        level: LogLevel,
        msg: str,
        **kwargs: Any,
    ) -> None:
        """Internal logging method"""
        # Check if we're in an exception context
        if level in ("error", "critical") and not kwargs.get("error"):
            exc_info = sys.exc_info()
            if exc_info[0] is not None and exc_info[1] is not None:
                exc = exc_info[1]
                kwargs["error"] = str(exc)
                kwargs["traceback"] = traceback.format_exc()

        entry = self._get_entry(level, msg, **kwargs)
        json_str = json.dumps(entry)

        # error and critical go to stderr, others to stdout
        if level in ("error", "critical"):
            print(json_str, file=sys.stderr)
        else:
            print(json_str, file=sys.stdout)

    def debug(self, msg: str, **kwargs: Any) -> None:
        """Log a debug-level message"""
        self._log("debug", msg, **kwargs)

    def info(self, msg: str, **kwargs: Any) -> None:
        """Log an info-level message"""
        self._log("info", msg, **kwargs)

    def warn(self, msg: str, **kwargs: Any) -> None:
        """Log a warn-level message"""
        self._log("warn", msg, **kwargs)

    def error(self, msg: str, **kwargs: Any) -> None:
        """Log an error-level message"""
        self._log("error", msg, **kwargs)

    def critical(self, msg: str, **kwargs: Any) -> None:
        """Log a critical-level message"""
        self._log("critical", msg, **kwargs)

    def set_request_id(self, request_id: Optional[str]) -> None:
        """Set the request ID for the current thread/context"""
        self._local.request_id = request_id

    def get_request_id(self) -> Optional[str]:
        """Get the request ID for the current thread/context"""
        return getattr(self._local, "request_id", None)

    @classmethod
    def set_request_id_class(cls, request_id: Optional[str]) -> None:
        """Class method to set request ID on default logger"""
        default_logger.set_request_id(request_id)

    @classmethod
    def get_request_id_class(cls) -> Optional[str]:
        """Class method to get request ID from default logger"""
        return default_logger.get_request_id()


# Default logger instance that reads configuration from environment variables
default_logger = ObservabilityLogger({
    "service": os.environ.get("OBSERVABILITY_SERVICE", "unknown-service"),
    "environment": os.environ.get("OBSERVABILITY_ENV") or os.environ.get("DJANGO_ENV", "development"),
})


# Module-level convenience functions
def debug(msg: str, **kwargs: Any) -> None:
    """Log a debug-level message using the default logger"""
    default_logger.debug(msg, **kwargs)


def info(msg: str, **kwargs: Any) -> None:
    """Log an info-level message using the default logger"""
    default_logger.info(msg, **kwargs)


def warn(msg: str, **kwargs: Any) -> None:
    """Log a warn-level message using the default logger"""
    default_logger.warn(msg, **kwargs)


def error(msg: str, **kwargs: Any) -> None:
    """Log an error-level message using the default logger"""
    default_logger.error(msg, **kwargs)


def critical(msg: str, **kwargs: Any) -> None:
    """Log a critical-level message using the default logger"""
    default_logger.critical(msg, **kwargs)


# Module-level logger object for legacy usage
logger = default_logger
