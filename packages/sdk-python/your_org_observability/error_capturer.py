"""
your-org-observability - Django error capturing
"""

from typing import Any, Optional
from .logger import default_logger

try:
    from django.core.signals import got_request_exception
    from django.dispatch import receiver
    HAS_DJANGO = True
except ImportError:
    HAS_DJANGO = False


def setup_error_handlers(logger: Any) -> None:
    """
    Set up error handlers for non-Django usage
    
    For Django, the signal is automatically registered when middleware is installed.
    """
    if not HAS_DJANGO:
        import sys
        
        def excepthook(exc_type: Any, exc_value: Any, tb: Any) -> None:
            logger.critical(
                f"Uncaught exception: {exc_type.__name__}",
                error=str(exc_value),
                traceback="".join(__import__("traceback").format_tb(tb)) if tb else None,
            )
            sys.__excepthook__(exc_type, exc_value, tb)
        
        sys.excepthook = excepthook


if HAS_DJANGO:
    @receiver(got_request_exception)  # type: ignore[untyped-decorator]
    def log_request_exception(
        sender: Any,
        request: Any,
        **kwargs: Any,
    ) -> None:
        """Django signal receiver for got_request_exception"""
        exc = kwargs.get("exception")
        
        if exc is None:
            return
        
        default_logger.error(
            f"Request exception: {type(exc).__name__}",
            error=str(exc),
            traceback=__import__("traceback").format_exc(),
        )
