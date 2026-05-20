from marshmallow import Schema, fields, validate


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=8))
    role = fields.Str()
    first_name = fields.Str()
    last_name = fields.Str()
    created_at = fields.DateTime(dump_only=True)


class LessonSchema(Schema):
    id = fields.Int(dump_only=True)
    course_id = fields.Int(required=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    youtube_url = fields.Str(required=True)
    duration = fields.Str(allow_none=True)
    order_index = fields.Int()


class CourseSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    category = fields.Str(allow_none=True)
    topic = fields.Str(allow_none=True)
    thumbnail_url = fields.Str(allow_none=True)
    youtube_url = fields.Str(allow_none=True)
    duration = fields.Str(allow_none=True)
    total_lessons = fields.Int(allow_none=True)
    difficulty_level = fields.Str(allow_none=True)
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    lessons = fields.Nested(LessonSchema, many=True, dump_only=True)


class QuestionSchema(Schema):
    id = fields.Int(dump_only=True)
    course_id = fields.Int(required=True)
    question_text = fields.Str(required=True)
    option_a = fields.Str(required=True)
    option_b = fields.Str(required=True)
    option_c = fields.Str(required=True)
    option_d = fields.Str(required=True)
    correct_answer = fields.Str(required=True)
    difficulty = fields.Str(allow_none=True)
    topic = fields.Str(allow_none=True)
    explanation = fields.Str(allow_none=True)


class ResultSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    course_id = fields.Int(dump_only=True)
    score = fields.Float(dump_only=True)
    total_questions = fields.Int(dump_only=True)
    correct_answers = fields.Int(dump_only=True)
    feedback = fields.Str(dump_only=True)
    time_taken = fields.Int(dump_only=True)
    submitted_at = fields.DateTime(dump_only=True)
    topic_performance = fields.Method("get_topic_performance", dump_only=True)

    def get_topic_performance(self, obj):
        import json
        if not obj.topic_performance:
            return {}
        if isinstance(obj.topic_performance, dict):
            return obj.topic_performance
        try:
            return json.loads(obj.topic_performance)
        except Exception:
            return {}
