from flask import Blueprint, jsonify
from flask import current_app

email_status_bp = Blueprint("email_status", __name__)


@email_status_bp.route("/status", methods=["GET"])
def smtp_status():
    """Health check: returns which Resend variables are configured and which are missing."""
    required_keys = ["RESEND_API_KEY"]
    missing = []
    for key in required_keys:
        val = current_app.config.get(key)
        if val is None or val == "":
            missing.append(key)

    return jsonify({
        "resend_configured": len(missing) == 0,
        "missing_variables": missing,
        "note": (
            "Resend configuration is set. Email delivery should work."
            if not missing
            else f"Add the following environment variables on Render: {', '.join(missing)}"
        )
    }), 200
