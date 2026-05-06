import sqlite3
import os

db_path = "backend/instance/smartlearning.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- COURSES ---")
    cursor.execute("SELECT id, title FROM courses")
    courses = cursor.fetchall()
    for c in courses:
        print(f"ID: {c[0]}, Title: {c[1]}")
        
    print("\n--- USERS ---")
    cursor.execute("SELECT id, username, role FROM users")
    users = cursor.fetchall()
    for u in users:
        print(f"ID: {u[0]}, User: {u[1]}, Role: {u[2]}")
        
    conn.close()
else:
    print("Database not found.")
