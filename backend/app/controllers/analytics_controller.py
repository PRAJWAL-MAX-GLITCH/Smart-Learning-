from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.progress import UserCourseProgress
from app.models.premium_models import UserLessonProgress, Lesson
from app.models.course import Course
from app.models.result import Result
from app.models.user import User
from app.extensions import db
from sqlalchemy import func
from datetime import datetime, timedelta

class AnalyticsController:
    @staticmethod
    def get_student_dashboard_stats():
        user_id = get_jwt_identity()
        
        # 1. Basic Stats
        total_courses_enrolled = UserCourseProgress.query.filter_by(user_id=user_id).count()
        completed_courses = UserCourseProgress.query.filter_by(user_id=user_id, completed=True).count()
        total_lessons_completed = UserLessonProgress.query.filter_by(user_id=user_id, completed=True).count()
        
        # 2. Average Quiz Score
        avg_score = db.session.query(func.avg(Result.score)).filter(Result.user_id == user_id).scalar() or 0
        
        # 3. Weekly Learning Activity (Last 7 days)
        weekly_stats = []
        for i in range(6, -1, -1):
            date = (datetime.utcnow() - timedelta(days=i)).date()
            count = UserLessonProgress.query.filter(
                UserLessonProgress.user_id == user_id,
                func.date(UserLessonProgress.watched_at) == date
            ).count()
            weekly_stats.append({
                "day": date.strftime("%a"),
                "lessons": count
            })

        # 4. Continue Learning (Recently Active Courses)
        active_progress = UserCourseProgress.query.filter_by(user_id=user_id)\
            .order_by(UserCourseProgress.updated_at.desc()).limit(3).all()
        
        continue_learning = []
        for p in active_progress:
            course = Course.query.get(p.course_id)
            if not course: continue
            
            total_lessons = Lesson.query.filter_by(course_id=course.id).count()
            completed_in_course = UserLessonProgress.query.filter_by(user_id=user_id, course_id=course.id, completed=True).count()
            
            progress_percent = round(completed_in_course / total_lessons * 100) if total_lessons > 0 else 0
            
            last_lesson = Lesson.query.get(p.last_watched_lesson_id) if p.last_watched_lesson_id else None

            continue_learning.append({
                "course_id": course.id,
                "course_title": course.title,
                "progress": progress_percent,
                "last_lesson": last_lesson.title if last_lesson else "Start Learning",
                "category": course.category
            })

        # 5. Real Activity Feed (Unified stream of events)
        activities = []
        
        # Add Lesson Activity
        recent_lessons = UserLessonProgress.query.filter_by(user_id=user_id, completed=True)\
            .order_by(UserLessonProgress.watched_at.desc()).limit(3).all()
        for lp in recent_lessons:
            lesson = Lesson.query.get(lp.lesson_id)
            activities.append({
                "type": "lesson",
                "title": "Lesson Completed",
                "content": lesson.title if lesson else "Unknown Lesson",
                "timestamp": lp.watched_at.isoformat(),
                "icon": "play"
            })

        # Add Quiz Activity
        recent_quizzes = Result.query.filter_by(user_id=user_id)\
            .order_by(Result.submitted_at.desc()).limit(3).all()
        for r in recent_quizzes:
            course = Course.query.get(r.course_id)
            activities.append({
                "type": "quiz",
                "title": "Quiz Attempted",
                "content": f"{course.title} ({r.score}%)",
                "timestamp": r.submitted_at.isoformat(),
                "icon": "trending-up"
            })

        # Sort activities by timestamp
        activities = sorted(activities, key=lambda x: x['timestamp'], reverse=True)[:5]

        # 6. Improved Streak Logic (Forgiving for the current day)
        streak = 0
        current_date = datetime.utcnow().date()
        
        # Check if user had activity today or yesterday to even start/continue a streak
        has_activity_today = UserLessonProgress.query.filter(
            UserLessonProgress.user_id == user_id,
            func.date(UserLessonProgress.watched_at) == current_date
        ).first()
        
        has_activity_yesterday = UserLessonProgress.query.filter(
            UserLessonProgress.user_id == user_id,
            func.date(UserLessonProgress.watched_at) == (current_date - timedelta(days=1))
        ).first()

        if has_activity_today or has_activity_yesterday:
            # Start counting backwards from the most recent active day
            start_check_date = current_date if has_activity_today else (current_date - timedelta(days=1))
            
            while True:
                check_date = start_check_date - timedelta(days=streak)
                has_activity = UserLessonProgress.query.filter(
                    UserLessonProgress.user_id == user_id,
                    func.date(UserLessonProgress.watched_at) == check_date
                ).first()
                
                if has_activity:
                    streak += 1
                else:
                    break

        # 7. Certifications (Completed Courses)
        completed_records = UserCourseProgress.query.filter_by(user_id=user_id, completed=True).all()
        certifications = []
        for cr in completed_records:
            c = Course.query.get(cr.course_id)
            if not c: continue
            
            # Get quiz score
            res = Result.query.filter_by(user_id=user_id, course_id=c.id).order_by(Result.score.desc()).first()
            
            certifications.append({
                "course_id": c.id,
                "course_title": c.title,
                "completed_at": cr.updated_at.isoformat(),
                "score": res.score if res else 0
            })

        return jsonify({
            "stats": {
                "enrolled": total_courses_enrolled,
                "completed": completed_courses,
                "lessons_done": total_lessons_completed,
                "avg_score": round(float(avg_score), 1),
                "streak": streak
            },
            "weekly_activity": weekly_stats,
            "continue_learning": continue_learning,
            "activities": activities,
            "certifications": certifications
        }), 200

    @staticmethod
    def get_admin_stats():
        # 1. Basic Stats
        total_students = User.query.filter_by(role='student').count()
        total_courses = Course.query.count()
        total_results = Result.query.count()
        avg_score = db.session.query(func.avg(Result.score)).scalar() or 0
        
        # 2. Most Popular Course (based on enrollments)
        popular_course_id = db.session.query(
            UserCourseProgress.course_id, 
            func.count(UserCourseProgress.user_id).label('count')
        ).group_by(UserCourseProgress.course_id).order_by(db.desc('count')).first()
        
        popular_course_name = "N/A"
        if popular_course_id:
            c = Course.query.get(popular_course_id[0])
            popular_course_name = c.title if c else "N/A"

        # 3. Recent Admin Events
        recent_events = []
        enrollments = UserCourseProgress.query.order_by(UserCourseProgress.updated_at.desc()).limit(5).all()
        for e in enrollments:
            u = User.query.get(e.user_id)
            c = Course.query.get(e.course_id)
            if u and c:
                recent_events.append({
                    "type": "New Enrollment",
                    "detail": f"{u.username} joined {c.title}",
                    "time": e.updated_at.isoformat()
                })

        return jsonify({
            "total_students": total_students,
            "total_courses": total_courses,
            "total_results": total_results,
            "avg_platform_score": round(float(avg_score), 1),
            "insights": {
                "popular_course": popular_course_name,
                "engagement": "High" if total_results > 10 else "Moderate"
            },
            "recent_events": recent_events
        }), 200

    @staticmethod
    def get_learning_recommendations():
        user_id = get_jwt_identity()
        from app.models.user_topic_stats import UserTopicStats
        
        # Get all topic stats for this user
        topic_stats = UserTopicStats.query.filter_by(user_id=user_id).all()
        
        weak_topics = []
        strong_topics = []

        for ts in topic_stats:
            accuracy = round((ts.correct_count / ts.total_attempted * 100)) if ts.total_attempted > 0 else 0
            if accuracy < 60:
                weak_topics.append(ts.topic)
            elif accuracy >= 80:
                strong_topics.append(ts.topic)

        # Get courses the user has already completed
        completed_course_ids = [
            cp.course_id for cp in UserCourseProgress.query.filter_by(user_id=user_id, completed=True).all()
        ]

        recommendations = []
        
        if weak_topics:
            # Query courses whose category matches a weak topic
            if completed_course_ids:
                potential_courses = Course.query.filter(Course.id.notin_(completed_course_ids), Course.category.in_(weak_topics)).all()
            else:
                potential_courses = Course.query.filter(Course.category.in_(weak_topics)).all()

            # Sort by difficulty: beginner -> intermediate -> advanced
            def difficulty_score(course):
                diff = (course.difficulty_level or "").lower()
                if "beginner" in diff: return 1
                if "intermediate" in diff: return 2
                if "advanced" in diff: return 3
                return 4
                
            potential_courses.sort(key=difficulty_score)

            for course in potential_courses[:5]:
                recommendations.append({
                    "course_id": course.id,
                    "title": course.title,
                    "topic": course.category,
                    "difficulty": course.difficulty_level or "Beginner",
                    "reason": f"Recommended because you are weak in {course.category}",
                    "priority": "high"
                })

        overall_score_increase = len(weak_topics) * 5
        if overall_score_increase > 20: overall_score_increase = 20

        return jsonify({
            "weak_topics": weak_topics,
            "strong_topics": strong_topics,
            "recommendations": recommendations,
            "insight_message": f"If you improve your weak topics, your overall score can increase by {overall_score_increase}%" if weak_topics else "You're doing great! Keep it up."
        }), 200
