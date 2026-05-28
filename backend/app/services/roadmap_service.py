import os
import json
import logging
import re
from datetime import datetime, timedelta
import google.generativeai as genai

from app.extensions import db
from app.models.user import User
from app.models.course import Course
from app.models.result import Result
from app.models.user_topic_stats import UserTopicStats
from app.models.progress import UserCourseProgress
from app.models.roadmap import UserRoadmap, RoadmapProgress
from app.services.student_level_service import StudentLevelService

logger = logging.getLogger(__name__)

class RoadmapService:
    @staticmethod
    def get_slugified_key(week, task_title):
        """Generates a globally unique slugified task key from task description."""
        clean_title = re.sub(r'[^a-zA-Z0-9\s]', '', task_title).lower().strip()
        slug = "_".join(clean_title.split()[:4])
        return f"week_{week}_{slug}"

    @classmethod
    def generate_roadmap(cls, user_id, force_regenerate=False):
        """
        Dynamically generates or retrieves cached AI Study Roadmap for a student.
        Returns a dict containing student level, roadmap, mentoring tips, and task progress.
        """
        # 1. Fetch Student Level
        student_level = StudentLevelService.get_student_level(user_id)
        
        # 2. Check for cache in database
        cached = UserRoadmap.query.filter_by(user_id=user_id).first()
        if cached and not force_regenerate:
            # Check 24 hour cooldown limit
            cooldown_limit = datetime.utcnow() - timedelta(hours=24)
            if cached.generated_at > cooldown_limit:
                try:
                    cached_data = json.loads(cached.roadmap_json)
                    logger.info(f"Returning cached study roadmap for user {user_id}")
                    return cls._inject_progress_to_roadmap(user_id, cached_data)
                except Exception as e:
                    logger.error(f"Error parsing cached roadmap: {e}")

        # 3. Aggregate Student Analytics
        analytics = cls.gather_student_analytics(user_id, student_level)
        
        # 4. Generate Study Roadmap (AI or Fallback)
        roadmap_data = None
        api_key = os.getenv("GEMINI_API_KEY")
        
        if api_key and api_key != "dummy_key_for_testing" and api_key.strip() != "":
            try:
                roadmap_data = cls._generate_ai_roadmap_via_gemini(api_key, analytics)
            except Exception as e:
                logger.error(f"Failed to generate roadmap via Gemini API: {e}. Falling back to procedural engine.")
                
        if not roadmap_data:
            logger.info("Using procedural fallback roadmap generation.")
            roadmap_data = cls._generate_procedural_roadmap(analytics)

        # 5. Save to Caching Layer
        try:
            if not cached:
                cached = UserRoadmap(user_id=user_id)
                db.session.add(cached)
            
            cached.roadmap_json = json.dumps(roadmap_data)
            cached.generated_at = datetime.utcnow()
            db.session.commit()
            logger.info(f"[SAVED] Cached student study roadmap in DB for user {user_id}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to cache roadmap in DB: {e}")

        return cls._inject_progress_to_roadmap(user_id, roadmap_data)

    @classmethod
    def gather_student_analytics(cls, user_id, student_level):
        """Aggregates student stats from database for personalization."""
        # A. Weak Topics (accuracy < 50%)
        topic_stats = UserTopicStats.query.filter_by(user_id=user_id).all()
        weak_topics = []
        all_topics = []
        for stat in topic_stats:
            if stat.total_attempted > 0:
                acc = (stat.correct_count / stat.total_attempted) * 100
                all_topics.append({"topic": stat.topic, "accuracy": acc})
                if acc < 50:
                    weak_topics.append(stat.topic)
        
        # Sort all topics by accuracy (weakest first)
        all_topics.sort(key=lambda x: x["accuracy"])
        weakest_ordered = [t["topic"] for t in all_topics if t["topic"] in weak_topics]
        
        # B. Incomplete Courses
        progress_records = UserCourseProgress.query.filter_by(user_id=user_id, completed=False).all()
        incomplete_courses = []
        for p in progress_records:
            if p.course:
                incomplete_courses.append({
                    "id": p.course.id,
                    "title": p.course.title,
                    "category": p.course.category,
                    "topic": p.course.topic
                })
        
        # C. Quiz Performance (average score, quiz timing)
        results = Result.query.filter_by(user_id=user_id).all()
        avg_score = 50.0
        avg_time = 300
        if results:
            scores = [r.score for r in results]
            avg_score = sum(scores) / len(scores)
            times = [r.time_taken for r in results if r.time_taken]
            if times:
                avg_time = sum(times) / len(times)
                
        # D. Learning Speed
        learning_speed = "Medium"
        if avg_time < 150:
            learning_speed = "Fast"
        elif avg_time > 400:
            learning_speed = "Slow"

        return {
            "user_id": user_id,
            "student_level": student_level,
            "weak_topics": weakest_ordered if weakest_ordered else (weak_topics if weak_topics else ["Recursion", "Trees"]),
            "incomplete_courses": incomplete_courses,
            "avg_score": round(avg_score, 1),
            "learning_speed": learning_speed
        }

    @classmethod
    def _generate_ai_roadmap_via_gemini(cls, api_key, analytics):
        """Calls Gemini API to generate highly personalized learning tracks."""
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        weak_topics_str = ", ".join(analytics["weak_topics"])
        courses_str = ", ".join([c["title"] for c in analytics["incomplete_courses"]]) if analytics["incomplete_courses"] else "None"
        
        prompt = f"""You are a senior AI Study Mentor on a smart learning platform.
Your task is to generate a highly personalized, structured 4-week Study Roadmap for a student with the following profile:
- Predicted Learning Level: {analytics["student_level"]} (Options: School Student, Beginner, Intermediate, Advanced)
- Weak Topics: {weak_topics_str}
- Incomplete Courses in progress: {courses_str}
- Learning Speed: {analytics["learning_speed"]}

ROADMAP PERSONALIZATION RULES:
1. School Student: Simple terminology, visual focus, slow pace, 2-3 short/conceptual tasks per week.
2. Beginner: Foundational concepts first, step-by-step instructions, 3-4 structured tasks per week.
3. Intermediate: Balanced topics, moderate programming/science problem solving, 4-5 moderate tasks per week.
4. Advanced: Fast-paced progression, deep technical concepts, advanced projects, 5+ challenging tasks per week.

CURRICULUM PRIORITY:
Always prioritize the Weak Topics and Incomplete Course concepts in the first 2 weeks, laying down solid foundational revision before introducing new subjects.

You MUST return a valid JSON object strictly matching this schema:
{{
  "student_level": "{analytics["student_level"]}",
  "weak_topics": {json.dumps(analytics["weak_topics"])},
  "learning_speed": "{analytics["learning_speed"]}",
  "mentoring_tip": "One concise paragraph (< 3 sentences) analyzing their weak topics and giving warm actionable advice.",
  "roadmap": [
    {{
      "week": 1,
      "focus": "Week Focus Topic Title",
      "tasks": [
        "Task 1 descriptive study task instruction text",
        "Task 2 descriptive study task instruction text"
      ]
    }},
    ... (exactly 4 weeks)
  ]
}}

Ensure that the task titles are practical and actionable, mentioning revision, quizzes, or specific concepts. Do not wrap output in markdown code blocks like ```json ... ```, return ONLY the raw JSON string. Do not include duplicate tasks. Keep recommendation short, actionable, and personalized."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown code blocks if AI included them anyway
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        data = json.loads(text)
        return data

    @classmethod
    def _generate_procedural_roadmap(cls, analytics):
        """Generates dynamic study tracks procedurally as a high-fidelity fallback."""
        level = analytics["student_level"]
        weak = analytics["weak_topics"]
        
        # Determine focus areas per week based on weak topics and fallbacks
        avail_weak = list(weak)
        weekly_foci = []
        
        # Week 1 Focus
        if len(avail_weak) > 0:
            weekly_foci.append(f"Mastering {avail_weak.pop(0)}")
        else:
            weekly_foci.append("Foundational Concepts Review")
            
        # Week 2 Focus
        if len(avail_weak) > 0:
            weekly_foci.append(f"Revising {avail_weak.pop(0)}")
        else:
            weekly_foci.append("Dynamic Problem Solving")
            
        # Week 3 Focus
        weekly_foci.append("Applied Practice & Quizzes")
        
        # Week 4 Focus
        weekly_foci.append("Comprehensive Subject Mastery")
        
        # Build tasks depending on level
        roadmap = []
        
        for w_idx in range(1, 5):
            focus = weekly_foci[w_idx - 1]
            tasks = []
            
            # Formulate tasks based on student learning level
            if level == "School Student":
                tasks = [
                    f"Watch a 5-minute visual cartoon or video on {focus}",
                    f"Review basic definitions and note down 3 key concepts",
                    f"Solve the visual MCQ Quiz to check understanding"
                ]
            elif level == "Beginner":
                tasks = [
                    f"Complete the introductory lesson on {focus}",
                    f"Solve the beginner practice quiz (Aim for 60%+ score)",
                    f"Perform a step-by-step code trace or basic revision drill",
                    f"Write down a brief summary explaining the concept to a friend"
                ]
            elif level == "Intermediate":
                tasks = [
                    f"Watch intermediate level tutorial on {focus}",
                    f"Work through 5 practical medium-difficulty exercises",
                    f"Take the Topic Practice Quiz and review weak responses",
                    f"Debug a small project block using this concept",
                    f"Create flashcards for revision before final examinations"
                ]
            else: # Advanced
                tasks = [
                    f"Deep-dive technical review of advanced details on {focus}",
                    f"Solve 5 optimization or advanced-level algorithm challenges",
                    f"Conduct a code optimization trace to improve time complexity",
                    f"Design a modular project demonstrating comprehensive application",
                    f"Contribute to or review peer solutions in learning forums",
                    f"Attempt the Advanced Mastery Quiz (Aim for 90%+ score)"
                ]
                
            roadmap.append({
                "week": w_idx,
                "focus": focus,
                "tasks": tasks
            })
            
        # Personalized mentoring tips procedurally
        tip_map = {
            "School Student": f"Since you are reviewing {', '.join(weak[:2])}, let's take it nice and slow! We've added simple visual animations and easy quiz exercises to boost your confidence. You're doing great!",
            "Beginner": f"Foundational concepts are key. We suggest focusing on revising {', '.join(weak[:2])} by breaking down definitions step-by-step before attempting the intermediate courses.",
            "Intermediate": f"To master {', '.join(weak[:2])}, we recommend working through practical implementation exercises and focusing on medium difficulty quizzes to build analytical muscles.",
            "Advanced": f"You're progressing extremely fast! Let's optimize your mastery of {', '.join(weak[:2])} by working on time complexity, deep algorithmic structures, and comprehensive projects."
        }

        return {
            "student_level": level,
            "weak_topics": weak,
            "learning_speed": analytics["learning_speed"],
            "mentoring_tip": tip_map.get(level, "Keep learning! Here is your structured study plan."),
            "roadmap": roadmap
        }

    @classmethod
    def _inject_progress_to_roadmap(cls, user_id, roadmap_data):
        """Reads active task checklist status from roadmap_progress and merges it into the response."""
        progress_records = RoadmapProgress.query.filter_by(user_id=user_id).all()
        completed_keys = {p.task_key for p in progress_records if p.completed}
        
        total_tasks = 0
        completed_tasks = 0
        
        injected_roadmap = []
        for week_plan in roadmap_data["roadmap"]:
            week_num = week_plan["week"]
            week_tasks = []
            
            for task_text in week_plan["tasks"]:
                task_key = cls.get_slugified_key(week_num, task_text)
                is_completed = task_key in completed_keys
                
                total_tasks += 1
                if is_completed:
                    completed_tasks += 1
                    
                week_tasks.append({
                    "key": task_key,
                    "title": task_text,
                    "completed": is_completed
                })
                
            injected_roadmap.append({
                "week": week_num,
                "focus": week_plan["focus"],
                "tasks": week_tasks
            })
            
        completion_percentage = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
        
        response = {
            "student_level": roadmap_data["student_level"],
            "weak_topics": roadmap_data.get("weak_topics", []),
            "learning_speed": roadmap_data.get("learning_speed", "Medium"),
            "mentoring_tip": roadmap_data.get("mentoring_tip", ""),
            "completion_percentage": completion_percentage,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "roadmap": injected_roadmap
        }
        
        return response

    @classmethod
    def toggle_task(cls, user_id, task_key, completed):
        """
        Toggles completion state of a task.
        Runs the analytical feedback loop: completing study tasks increases topic performance!
        """
        # Ex: "week_1_watch_intro_videos" -> extract week
        week = 1
        match = re.match(r'week_(\d+)_', task_key)
        if match:
            week = int(match.group(1))
            
        record = RoadmapProgress.query.filter_by(user_id=user_id, task_key=task_key).first()
        if not record:
            record = RoadmapProgress(user_id=user_id, week=week, task_key=task_key)
            db.session.add(record)
            
        record.completed = completed
        record.updated_at = datetime.utcnow()
        
        # FEEDBACK LOOP SYSTEM (VERY IMPORTANT)
        # If student completes a roadmap task, let's trace if the task text relates to their weak topics.
        # If they complete a task, we increment UserTopicStats to simulate progress!
        if completed:
            cls._apply_feedback_loop(user_id, task_key)
            
        try:
            db.session.commit()
            logger.info(f"Toggled task key {task_key} for user {user_id} to completed={completed}")
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to toggle task: {e}")
            return False

    @classmethod
    def _apply_feedback_loop(cls, user_id, task_key):
        """
        Feedback Loop: Completing roadmap tasks improves weak topic performance!
        Finds the weak topic matched in the slugified task key and boosts its accuracy stats in UserTopicStats.
        """
        try:
            # Let's see what weak topics are currently registered for this user
            stats = UserTopicStats.query.filter_by(user_id=user_id).all()
            for s in stats:
                topic_slug = s.topic.lower().replace(" ", "")
                # If topic_slug is in task_key (e.g. topic "Trees" slug "trees" is in "week_1_watch_trees_introduction")
                if topic_slug in task_key.replace("_", ""):
                    # Boost: Completing a study task counts as a correct attempt!
                    s.total_attempted += 1
                    s.correct_count += 1
                    s.updated_at = datetime.utcnow()
                    logger.info(f"[FEEDBACK LOOP] Boosted stats for topic '{s.topic}' for user {user_id} (Attempted: {s.total_attempted}, Correct: {s.correct_count})")
                    
                    # If this boost results in accuracy changing significantly, we invalidate cached roadmap JSON 
                    # so that the next refresh/load generates an adjusted roadmap!
                    UserRoadmap.query.filter_by(user_id=user_id).delete()
                    logger.info(f"[FEEDBACK LOOP] Invalidated cached study roadmap for user {user_id} due to performance boost.")
                    break
        except Exception as e:
            logger.error(f"Feedback loop adjustment failed: {e}")
