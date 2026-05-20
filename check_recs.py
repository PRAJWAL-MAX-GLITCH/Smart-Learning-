import sqlite3
import os
import requests

# ── 1. Find DB ──────────────────────────────────────────────
db_paths = [
    r'd:\project\SmartLearning\backend\instance\smartlearning_v3.db',
    r'd:\project\SmartLearning\backend\instance\smartlearning.db',
]

db_path = None
for p in db_paths:
    if os.path.exists(p):
        db_path = p
        break

if not db_path:
    print("No DB found at known paths. Searching...")
    for root, dirs, files in os.walk(r'd:\project\SmartLearning\backend'):
        for f in files:
            if f.endswith('.db'):
                db_path = os.path.join(root, f)
                print(f"  Found: {db_path}")

if not db_path:
    print("ERROR: Could not find database file!")
    exit(1)

print(f"\n[OK] Database: {db_path}\n")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# ── 2. List tables ───────────────────────────────────────────
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print(f"Tables: {tables}\n")

# ── 3. Show users ────────────────────────────────────────────
if 'users' in tables:
    cursor.execute("SELECT id, email, username, role FROM users LIMIT 5")
    rows = cursor.fetchall()
    print(f"=== USERS ({len(rows)} shown) ===")
    for r in rows:
        print(f"  id={r[0]}, email={r[1]}, username={r[2]}, role={r[3]}")

# ── 4. Show user_topic_stats ─────────────────────────────────
if 'user_topic_stats' in tables:
    cursor.execute("SELECT * FROM user_topic_stats LIMIT 20")
    rows = cursor.fetchall()
    print(f"\n=== USER_TOPIC_STATS ({len(rows)} records) ===")
    if rows:
        for r in rows:
            total = r[3] if r[3] else 0
            correct = r[4] if r[4] else 0
            acc = round(correct/total*100) if total > 0 else 0
            print(f"  user_id={r[1]}, topic='{r[2]}', attempted={total}, correct={correct}, accuracy={acc}%")
    else:
        print("  [!] NO RECORDS -- users have not taken any quizzes yet!")
else:
    print("\n[!] Table 'user_topic_stats' does NOT EXIST in DB!")

# ── 5. Show questions (topic field) ──────────────────────────
if 'questions' in tables:
    cursor.execute("SELECT DISTINCT topic FROM questions LIMIT 20")
    topics = [r[0] for r in cursor.fetchall()]
    print(f"\n=== QUESTION TOPICS in DB: {topics}")

# ── 6. Show courses (category field) ─────────────────────────
if 'courses' in tables:
    cursor.execute("SELECT id, title, category, difficulty_level FROM courses LIMIT 10")
    rows = cursor.fetchall()
    print(f"\n=== COURSES ({len(rows)} shown) ===")
    for r in rows:
        print(f"  id={r[0]}, title='{r[1]}', category='{r[2]}', difficulty='{r[3]}'")

conn.close()

# ── 7. Test API endpoint (unauthenticated) ───────────────────
print("\n=== API HEALTH CHECK ===")
try:
    r = requests.get("http://127.0.0.1:5000/", timeout=5)
    print(f"  Backend: {r.status_code} — {r.json().get('message','')}")
except Exception as e:
    print(f"  Backend ERROR: {e}")

# ── 8. Check recommendations route exists ────────────────────
try:
    r = requests.get("http://127.0.0.1:5000/api/analytics/recommendations", timeout=5)
    print(f"  /api/analytics/recommendations: {r.status_code}")
    if r.status_code == 401:
        print("  -> Route EXISTS [OK] (401 = needs auth token, which is correct)")
    elif r.status_code == 404:
        print("  -> Route NOT FOUND [FAIL]")
    else:
        print(f"  → Response: {r.text[:200]}")
except Exception as e:
    print(f"  ERROR: {e}")

try:
    r = requests.get("http://127.0.0.1:5000/api/ai/weak-topics", timeout=5)
    print(f"  /api/ai/weak-topics: {r.status_code}")
    if r.status_code == 401:
        print("  -> Route EXISTS [OK] (401 = needs auth token)")
    elif r.status_code == 404:
        print("  -> Route NOT FOUND [FAIL]")
except Exception as e:
    print(f"  ERROR: {e}")
