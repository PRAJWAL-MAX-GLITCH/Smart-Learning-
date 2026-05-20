import sqlite3
import os
import json

db_path = os.path.join('backend', 'instance', 'smartlearning_v3.db')

if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

print("--- STARTING DATABASE RECONCILIATION FOR RECOMMENDATION SYSTEM ---")

# 1. Ensure user_topic_stats table exists
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_topic_stats'")
if not c.fetchone():
    print("Creating user_topic_stats table...")
    c.execute("""
        CREATE TABLE user_topic_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            topic VARCHAR(50) NOT NULL,
            total_attempted INTEGER DEFAULT 0,
            correct_count INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, topic)
        )
    """)
    conn.commit()
    print("[OK] user_topic_stats table created successfully.")
else:
    print("[OK] user_topic_stats table already exists.")

# Clear any stale topic stats to do a clean rebuild from all results
c.execute("DELETE FROM user_topic_stats")
conn.commit()
print("Cleared old user_topic_stats for rebuild.")

# 2. Fetch all results to rebuild user_topic_stats
c.execute("SELECT id, user_id, course_id, score, total_questions, correct_answers, topic_performance FROM results")
results = c.fetchall()
print(f"Found {len(results)} quiz results in history.")

for r in results:
    r_id, user_id, course_id, score, total, correct, topic_perf_str = r
    
    # Reconstruct topic performance if None, empty, or containing 'General'
    needs_update = False
    topic_perf = {}
    
    if topic_perf_str:
        try:
            topic_perf = json.loads(topic_perf_str)
        except Exception:
            topic_perf = {}
            
    # If the topic is General or empty, we will map it to the actual course question topic ('Coding')
    if not topic_perf or "General" in topic_perf:
        needs_update = True
        # Let's find the most common topic for questions in this course
        c.execute("SELECT topic FROM questions WHERE course_id = ? GROUP BY topic ORDER BY COUNT(topic) DESC LIMIT 1", (course_id,))
        row = c.fetchone()
        course_topic = row[0] if row else "Coding"
        
        # Build synthetic topic performance
        topic_perf = {
            course_topic: {
                "correct": correct,
                "total": total
            }
        }
        
    if needs_update:
        new_perf_str = json.dumps(topic_perf)
        c.execute("UPDATE results SET topic_performance = ? WHERE id = ?", (new_perf_str, r_id))
        print(f"  -> Updated Result ID {r_id} (Course {course_id}): set topic_performance = {new_perf_str}")

    # Now populate/update user_topic_stats
    for topic, stats in topic_perf.items():
        # Get existing record
        c.execute("SELECT id, total_attempted, correct_count FROM user_topic_stats WHERE user_id = ? AND topic = ?", (user_id, topic))
        stats_row = c.fetchone()
        
        if stats_row:
            stats_id, current_total, current_correct = stats_row
            new_total = (current_total or 0) + stats["total"]
            new_correct = (current_correct or 0) + stats["correct"]
            c.execute("UPDATE user_topic_stats SET total_attempted = ?, correct_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
                      (new_total, new_correct, stats_id))
        else:
            c.execute("INSERT INTO user_topic_stats (user_id, topic, total_attempted, correct_count) VALUES (?, ?, ?, ?)",
                      (user_id, topic, stats["total"], stats["correct"]))

conn.commit()
print("\n--- RECONCILIATION COMPLETED SUCCESSFULLY ---")

# 3. Print the new state of user_topic_stats
c.execute("""
    SELECT user_topic_stats.user_id, users.username, user_topic_stats.topic, 
           user_topic_stats.total_attempted, user_topic_stats.correct_count 
    FROM user_topic_stats 
    JOIN users ON user_topic_stats.user_id = users.id
""")
rows = c.fetchall()
print("\n=== UPDATED USER TOPIC STATS ===")
for r in rows:
    user_id, username, topic, total, correct = r
    acc = round(correct/total*100) if total > 0 else 0
    status = "Weak" if acc < 60 else ("Strong" if acc >= 80 else "Improving")
    print(f"User: {username} (ID: {user_id}) | Topic: '{topic}' | Stats: {correct}/{total} ({acc}%) | Status: {status}")

conn.close()
