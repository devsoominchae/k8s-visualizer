# utils.py

from datetime import datetime


def format_timestamp(timestamp):
    """Format a timestamp string to a more readable format."""
    try:
        dt = datetime.fromisoformat(timestamp)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        return timestamp
    