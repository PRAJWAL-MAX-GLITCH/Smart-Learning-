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


class CourseSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str()
    category = fields.Str()
    youtube_url = fields.Str(allow_none=True, validate=validate.URL(schemes={'http', 'https'}))
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class QuestionSchema(Schema):
    id = fields.Int(dump_only=True)
    course_id = fields.Int(required=True)
    question_text = fields.Str(required=True)
    option_a = fields.Str(required=True)
    option_b = fields.Str(required=True)
    option_c = fields.Str(required=True)
    option_d = fields.Str(required=True)
    correct_answer = fields.Str(required=True)
    difficulty = fields.Str()
    explanation = fields.Str()


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
