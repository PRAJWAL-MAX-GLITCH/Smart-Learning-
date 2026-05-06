import re


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))


def validate_password(password: str) -> bool:
    """Password must be at least 8 characters."""
    return len(password) >= 8


def validate_required_fields(data: dict, required_fields: list) -> list:
    """Return a list of missing or empty required field names."""
    return [field for field in required_fields if not data.get(field)]
