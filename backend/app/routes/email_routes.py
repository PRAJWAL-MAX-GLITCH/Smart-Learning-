from flask import Blueprint, jsonify
from flask import current_app

email_status_bp = Blueprint("email_status", __name__)


@email_status_bp.route("/status", methods=["GET"])
def smtp_status():
    """Health check: returns which SMTP variables are configured and which are missing."""
    required_keys = ["SMTP_SERVER", "SMTP_PORT", "SMTP_EMAIL", "SMTP_PASSWORD"]
    missing = []
    for key in required_keys:
        val = current_app.config.get(key)
        # SMTP_PORT defaults to 587 (int) – treat 0 or None as missing
        if val is None or val == "" or val == 0:
            missing.append(key)

    return jsonify({
        "smtp_configured": len(missing) == 0,
        "missing_variables": missing,
        "note": (
            "All SMTP variables are set. Email delivery should work."
            if not missing
            else f"Add the following environment variables on Render: {', '.join(missing)}"
        )
    }), 200
