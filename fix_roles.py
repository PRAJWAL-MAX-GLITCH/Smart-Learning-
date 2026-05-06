import sqlite3
import os

db_path = "backend/instance/smartlearning.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET role = 'admin'")
    conn.commit()
    print(f"Successfully updated {cursor.rowcount} users to admin role.")
    conn.close()
else:
    print("Database not found at path.")
