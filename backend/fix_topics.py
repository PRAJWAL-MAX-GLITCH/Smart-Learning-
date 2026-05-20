"""
FIX: Align question topics with course categories so recommendations work.
"""
from app import create_app
from app.extensions import db
from app.models.question import Question
from app.models.course import Course
from app.models.user_topic_stats import UserTopicStats

app = create_app()

with app.app_context():
    print("=" * 60)
    print("STEP 1: Normalizing Course Categories")
    print("=" * 60)
    courses = Course.query.all()
    for course in courses:
        old = course.category
        normalized = (course.category or "General").strip().title()
        course.category = normalized
        print(f"  Course ID={course.id} | '{old}' -> '{normalized}'")
    db.session.commit()
    print(f"  DONE: {len(courses)} course(s) updated.\n")

    print("=" * 60)
    print("STEP 2: Aligning Question Topics with Course Categories")
    print("=" * 60)
    questions = Question.query.all()
    for q in questions:
        course = Course.query.get(q.course_id)
        if course:
            old_topic = q.topic
            q.topic = course.category
            print(f"  Question ID={q.id} (Course: '{course.title}') | topic: '{old_topic}' -> '{q.topic}'")
        else:
            print(f"  WARNING: Question ID={q.id} has no valid course! Skipping.")
    db.session.commit()
    print(f"  DONE: {len(questions)} question(s) aligned.\n")

    print("=" * 60)
    print("STEP 3: Clearing Stale UserTopicStats (fresh start)")
    print("=" * 60)
    deleted = UserTopicStats.query.delete()
    db.session.commit()
    print(f"  DONE: Deleted {deleted} stale topic stat record(s).\n")

    print("=" * 60)
    print("FINAL STATE:")
    print("=" * 60)
    for course in Course.query.all():
        q_count = Question.query.filter_by(course_id=course.id).count()
        print(f"  Course: '{course.title}' | Category: '{course.category}' | Questions: {q_count}")

    print("\nFIX COMPLETE!")
    print("Next steps:")
    print("  1. Have a student attempt a quiz and answer some questions WRONG.")
    print("  2. Call GET /api/analytics/recommendations")
    print("  3. weak_topics and recommendations should now be populated.")
