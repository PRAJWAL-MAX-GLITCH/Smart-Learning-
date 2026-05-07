from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    # He sagle junye tables delete karel aani navin schema nusar parat banvel
    print("Dropping old tables...")
    db.drop_all()
    print("Creating new tables with updated schema (bio, streak, etc.)...")
    db.create_all()
    print("Database recreated successfully! Aata backend server restart kara.")
