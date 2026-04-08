"""
your-org-observability - Django middleware
"""

import uuid
import time
from typing import Any, Callable, Optional
from .logger import ObservabilityLogger, default_logger


class ObservabilityMiddleware:
    """Django middleware for automatic request/response logging"""

    def __init__(self, get_response: Callable[[Any], Any]) -> None:
        """Initialize the middleware"""
        self.get_response = get_response
        self.logger = default_logger

    def __call__(self, request: Any) -> Any:
        """Process the request and response"""
        # Generate request ID
        request_id = str(uuid.uuid4())
        self.logger.set_request_id(request_id)

        # Attach to response for client visibility
        # We'll set this when we have the response object

        # Record start time
        start_time = time.time()

        # Get the response
        response = self.get_response(request)

        # Attach request ID header
        response["X-Request-Id"] = request_id

        # Calculate duration
        duration_ms = int((time.time() - start_time) * 1000)

        # Get user ID if available
        user_id: Optional[str] = None
        if hasattr(request, "user") and request.user.is_authenticated:
            user_id = str(request.user.id)

        # Determine log level based on status code
        status_code = response.status_code
        if 200 <= status_code < 300:
            level: str = "info"
        elif 300 <= status_code < 400:
            level = "info"
        elif 400 <= status_code < 500:
            level = "warn"
        else:
            level = "error"

        # Log the request/response
        method = request.method
        path = request.path
        getattr(self.logger, level)(
            f"{method} {path}",
            duration_ms=duration_ms,
            status_code=status_code,
            route=path,
            user_id=user_id,
        )

        # Clear request ID
        self.logger.set_request_id(None)

        return response
