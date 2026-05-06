def generate_feedback(score: float) -> str:
    """Rule-based feedback based on score percentage."""
    if score < 50:
        return "Weak"
    elif score <= 80:
        return "Average"
    else:
        return "Strong"
