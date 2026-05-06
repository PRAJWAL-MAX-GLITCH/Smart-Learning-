import sqlite3
import os

# Path to your database
db_path = os.path.join('backend', 'instance', 'smartlearning_v3.db')

def upgrade():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    print("Upgrading database...")
    
    # Add columns to questions table
    try:
        c.execute("ALTER TABLE questions ADD COLUMN difficulty TEXT DEFAULT 'medium'")
        print("✅ Added 'difficulty' to questions table")
    except sqlite3.OperationalError:
        print("ℹ️ 'difficulty' already exists")
        
    try:
        c.execute("ALTER TABLE questions ADD COLUMN explanation TEXT")
        print("✅ Added 'explanation' to questions table")
    except sqlite3.OperationalError:
        print("ℹ️ 'explanation' already exists")
        
    # Add columns to results table
    try:
        c.execute("ALTER TABLE results ADD COLUMN time_taken INTEGER")
        print("✅ Added 'time_taken' to results table")
    except sqlite3.OperationalError:
        print("ℹ️ 'time_taken' already exists")
        
    conn.commit()
    conn.close()
    print("Database upgrade complete!")

if __name__ == "__main__":
    upgrade()
