from flask import jsonify, request
from app.models.settings import SystemSettings
from app.extensions import db
from app.utils.decorators import admin_required

class AdminSettingsController:
    @staticmethod
    @admin_required
    def get_all_settings():
        settings = SystemSettings.query.all()
        return jsonify({
            "settings": {s.key: s.value for s in settings}
        }), 200

    @staticmethod
    @admin_required
    def update_settings():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
                
            for key, value in data.items():
                SystemSettings.set_value(key, value)
                
            return jsonify({"message": "Settings updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
