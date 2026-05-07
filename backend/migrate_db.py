import sqlite3
import os

# Find the database file
db_path = None
for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith('.db'):
            db_path = os.path.join(root, f)
            print(f"Found database: {db_path}")
            break

if not db_path:
    print("ERROR: No .db file found! Creating fresh database...")
    from app import create_app
    from app.extensions import db
    app = create_app()
    with app.app_context():
        db.create_all()
    print("Fresh database created successfully!")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(users)")
existing_columns = [col[1] for col in cursor.fetchall()]
print(f"Existing columns: {existing_columns}")

# Add missing columns safely
columns_to_add = [
    ("bio", "TEXT"),
    ("profile_image", "TEXT"),
    ("streak", "INTEGER DEFAULT 0"),
    ("last_active", "TIMESTAMP"),
    ("updated_at", "TIMESTAMP"),
]

for col_name, col_type in columns_to_add:
    if col_name not in existing_columns:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"✅ Added column: {col_name}")
        except Exception as e:
            print(f"⚠️  Skipped {col_name}: {e}")
    else:
        print(f"✓ Column already exists: {col_name}")

conn.commit()
conn.close()
print("\n🎉 Migration complete! Restart your Flask server now.")
