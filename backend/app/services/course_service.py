from app.extensions import db
from app.models.course import Course
import logging

logger = logging.getLogger(__name__)


class CourseService:
    @staticmethod
    def get_paginated_courses(page, per_page):
        pagination = Course.query.order_by(Course.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        return {
            "items": pagination.items,
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": pagination.page,
            "per_page": pagination.per_page
        }

    @staticmethod
    def get_course_by_id(course_id):
        return Course.query.get(course_id)

    @staticmethod
    def create_course(data, user_id):
        course = Course(
            title=data["title"],
            description=data.get("description"),
            category=data.get("category"),
            youtube_url=data.get("youtube_url"),
            created_by=user_id
        )
        db.session.add(course)
        db.session.commit()
        logger.info(f"Course created: {course.title} by user {user_id}")
        return course

    @staticmethod
    def update_course(course, data):
        for field in ["title", "description", "category", "youtube_url"]:
            if field in data:
                setattr(course, field, data[field])
        db.session.commit()
        return course

    @staticmethod
    def delete_course(course):
        db.session.delete(course)
        db.session.commit()
        return True
