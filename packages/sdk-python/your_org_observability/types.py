"""
your-org-observability - Shared type definitions
"""

from typing import Literal, TypedDict, Optional


LogLevel = Literal["debug", "info", "warn", "error", "critical"]
"""Log level enumeration"""


class LogEntry(TypedDict, total=False):
    """Complete structured log entry schema - used consistently across all SDKs"""

    level: LogLevel
    """Log level"""

    msg: str
    """Human-readable log message"""

    service: str
    """Name of the microservice emitting this log"""

    environment: str
    """Environment (production, staging, development, etc.)"""

    ts: str
    """ISO8601 UTC timestamp"""

    request_id: Optional[str]
    """Request ID for tracing across services (UUID v4)"""

    user_id: Optional[str]
    """Application user ID if available"""

    duration_ms: Optional[int]
    """Response duration in milliseconds (response logs only)"""

    status_code: Optional[int]
    """HTTP status code (response logs only)"""

    route: Optional[str]
    """HTTP route/path (response logs only)"""

    error: Optional[str]
    """Error message if this is an error log"""

    traceback: Optional[str]
    """Full stack trace if this is an error log"""


class ObservabilityConfig(TypedDict, total=False):
    """Configuration for ObservabilityLogger"""

    service: str
    """Required: name of your microservice"""

    environment: str
    """Environment name; defaults to os.environ.get('DJANGO_ENV')"""

    skip_routes: list[str]
    """Routes to skip logging for"""
