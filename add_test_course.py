import sqlite3
import os

db_path = os.path.join('backend', 'instance', 'smartlearning_v3.db')
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("""
    INSERT INTO courses (title, description, category, duration, total_lessons, difficulty_level, created_by)
    VALUES ('React Advanced Course', 'Master React state management and hooks.', 'Coding', '10 Hours', 15, 'Advanced', 2)
""")
conn.commit()
conn.close()
print("Successfully inserted React Advanced Course into database!")
