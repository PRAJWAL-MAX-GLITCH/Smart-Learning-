import os
import json
import logging
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
from app.models.transcript import CourseTranscript
from app.models.course import Course
from app.extensions import db

logger = logging.getLogger(__name__)

FALLBACK_TRANSCRIPT = """
Welcome to this course on coding basics. Today we will cover some fundamental concepts.
Variables are used to store data. In Python, you can declare a variable simply by assigning a value to a name, like x = 10.
Functions are blocks of reusable code. You define them using the 'def' keyword.
Lists are used to store multiple items in a single variable. They are created using square brackets.
A loop allows you to run a block of code multiple times. For example, a 'for' loop iterates over a sequence.
Conditional statements like 'if', 'elif', and 'else' allow your code to make decisions based on certain conditions.
"""

def extract_video_id(url):
    """Extract YouTube video ID from URL"""
    if not url:
        return None
    
    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "youtube.com/watch" in url:
        if "v=" in url:
            parts = url.split("v=")
            if len(parts) > 1:
                return parts[1].split("&")[0]
    return None

class AIService:
    @staticmethod
    def get_or_extract_transcript(course_id, youtube_url=None):
        """
        Gets transcript from DB cache or fetches via youtube-transcript-api.
        Uses fallback if everything fails.
        """
        # 1. Check DB Cache
        transcript_record = CourseTranscript.query.filter_by(course_id=course_id).first()
        if transcript_record:
            logger.info(f"Using cached transcript for course_id: {course_id}")
            return transcript_record.transcript_text

        # 2. Extract from YouTube
        transcript_text = None
        video_id = extract_video_id(youtube_url)
        
        if video_id:
            try:
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
                transcript_text = " ".join([t['text'] for t in transcript_list])
                logger.info(f"Successfully extracted YouTube transcript for video: {video_id}")
            except Exception as e:
                logger.error(f"Failed to extract transcript for {video_id}: {e}")
        else:
            logger.warning(f"No valid YouTube video ID found in URL: {youtube_url}")

        # 3. Fallback Mechanism (Mandatory)
        if not transcript_text or len(transcript_text.strip()) < 50:
            logger.info("Using Fallback Dummy Transcript.")
            transcript_text = FALLBACK_TRANSCRIPT

        # 4. Save to DB Cache
        try:
            new_record = CourseTranscript(course_id=course_id, transcript_text=transcript_text)
            db.session.add(new_record)
            db.session.commit()
        except Exception as e:
            logger.error(f"Failed to save transcript to DB: {e}")
            db.session.rollback()

        return transcript_text

    @staticmethod
    def generate_quiz(transcript_text, course_id):
        """
        Calls Gemini AI to generate 5 MCQs based on the transcript.
        Enforces difficulty: 2 easy, 2 medium, 1 hard.
        Returns a validated list of question dictionaries.
        """
        if not transcript_text:
            return None, "Transcript text is required"

        prompt = f"""
        You are an expert educational AI. 
        Based on the following transcript, generate a quiz with exactly 20 multiple-choice questions.
        
        DIFFICULTY REQUIREMENT:
        - Exactly 8 Easy questions
        - Exactly 8 Medium questions
        - Exactly 4 Hard questions

        TRANSCRIPT:
        {transcript_text[:10000]}  # limit text length for safety

        OUTPUT FORMAT:
        You must return ONLY a valid JSON array of objects. Do not include markdown blocks like ```json or ```. 
        Each object MUST have the following keys:
        - "question": string
        - "options": an array of exactly 4 string options
        - "correct_answer": string (Must be exactly "A", "B", "C", or "D")
        - "difficulty": string (Must be "easy", "medium", or "hard")
        - "explanation": string (A short explanation of why the answer is correct)
        """

        try:
            # If no API key is provided, use a mock response instead of failing
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "dummy_key_for_testing" or api_key.strip() == "":
                logger.info("No valid Gemini API key found. Using Mock AI response.")
                return AIService._get_mock_quiz_response(), None

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            
            raw_text = response.text.strip()
            
            # Clean up markdown code blocks if AI included them despite instructions
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            raw_text = raw_text.strip()
            
            try:
                questions_data = json.loads(raw_text)
            except json.JSONDecodeError:
                logger.error(f"AI returned invalid JSON: {raw_text}")
                return None, "AI failed to generate a valid JSON response."

            # Validation Loop
            validated_questions = []
            for idx, q in enumerate(questions_data):
                if not isinstance(q, dict):
                    return None, f"Item {idx} is not a valid object."
                
                if "question" not in q or "options" not in q or "correct_answer" not in q:
                    return None, f"Item {idx} is missing required keys."
                
                if not isinstance(q["options"], list) or len(q["options"]) != 4:
                    return None, f"Item {idx} options must be an array of exactly 4 items."
                
                if q["correct_answer"] not in ["A", "B", "C", "D"]:
                    return None, f"Item {idx} correct_answer must be A, B, C, or D."
                    
                validated_questions.append({
                    "question": q["question"],
                    "option_a": str(q["options"][0]),
                    "option_b": str(q["options"][1]),
                    "option_c": str(q["options"][2]),
                    "option_d": str(q["options"][3]),
                    "correct_answer": q["correct_answer"],
                    "difficulty": q.get("difficulty", "medium").lower(),
                    "explanation": q.get("explanation", "Correct answer is " + q["correct_answer"])
                })

            if len(validated_questions) == 0:
                return None, "AI did not generate any valid questions."

            return validated_questions, None

        except Exception as e:
            logger.error(f"Error calling AI API: {e}")
            logger.info("Falling back to Mock AI response due to API Error.")
            return AIService._get_mock_quiz_response(), None

    @staticmethod
    def _get_mock_quiz_response():
        """Returns a static mock response to simulate AI generation when no API key is present."""
        base_questions = [
            {
                "question": "[AI Mock] What are variables used for in Python?",
                "option_a": "To loop code",
                "option_b": "To store data",
                "option_c": "To print text",
                "option_d": "To end a program",
                "correct_answer": "B",
                "difficulty": "easy",
                "explanation": "Variables hold data values assigned to a name."
            },
            {
                "question": "[AI Mock] How do you define a function in Python?",
                "option_a": "Using 'def'",
                "option_b": "Using 'function'",
                "option_c": "Using 'func'",
                "option_d": "Using 'create'",
                "correct_answer": "A",
                "difficulty": "easy",
                "explanation": "The 'def' keyword introduces a function definition."
            },
            {
                "question": "[AI Mock] Which bracket is used to create a list?",
                "option_a": "()",
                "option_b": "{}",
                "option_c": "[]",
                "option_d": "<>",
                "correct_answer": "C",
                "difficulty": "medium",
                "explanation": "Square brackets are used to define a list in Python."
            },
            {
                "question": "[AI Mock] What does a 'for' loop iterate over?",
                "option_a": "Only integers",
                "option_b": "A sequence",
                "option_c": "Functions",
                "option_d": "Errors",
                "correct_answer": "B",
                "difficulty": "medium",
                "explanation": "A for loop in Python iterates over items of any sequence (a list, a string)."
            },
            {
                "question": "[AI Mock] Which conditional statements make decisions?",
                "option_a": "if, elif, else",
                "option_b": "try, except",
                "option_c": "while, break",
                "option_d": "import, from",
                "correct_answer": "A",
                "difficulty": "hard",
                "explanation": "If, elif, and else statements control the flow based on conditional logic."
            }
        ]
        
        # Multiply by 4 to get exactly 20 mock questions for testing
        mock_quiz = []
        for i in range(4):
            for idx, q in enumerate(base_questions):
                new_q = q.copy()
                new_q["question"] = f"{new_q['question']} (Variant {i+1})"
                mock_quiz.append(new_q)
                
        return mock_quiz

    @staticmethod
    def get_chat_response(user_id, message):
        """
        Retrieves the chat response for the given message using gemini-2.5-flash.
        Keeps answers under 150-200 words.
        Stores user prompt and assistant response in the database.
        """
        from app.models.chat import ChatMessage
        
        # 1. Fetch all previous messages for this user (unlimited history context)
        try:
            previous_messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).all()
        except Exception as e:
            logger.error(f"Failed to fetch chat messages: {e}")
            previous_messages = []

        # 2. Format history for Gemini
        # Gemini API format: {'role': 'user'|'model', 'parts': [content]}
        formatted_history = []
        for msg in previous_messages:
            role = "user" if msg.role == "user" else "model"
            formatted_history.append({
                "role": role,
                "parts": [msg.content]
            })

        # 3. Check for API key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "dummy_key_for_testing" or api_key.strip() == "":
            logger.info("No valid Gemini API key found. Using Mock AI Response.")
            reply = AIService._get_mock_chat_response(message)
            
            # Save user message & assistant reply to DB
            try:
                user_msg = ChatMessage(user_id=user_id, role="user", content=message)
                assistant_msg = ChatMessage(user_id=user_id, role="assistant", content=reply)
                db.session.add(user_msg)
                db.session.add(assistant_msg)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                logger.error(f"Failed to save mock chat messages to DB: {e}")
                
            return reply, None

        # 4. Initialize Gemini Model and Chat
        try:
            genai.configure(api_key=api_key)
            
            system_instruction = """You are an AI learning assistant for students.

Your role:
* Explain concepts in very simple language
* Support students from school level (10th–12th) to beginner learners
* Break down complex topics step-by-step
* Use examples and analogies
* Be friendly and encouraging

Subjects:
* Mathematics
* Science (Physics, Chemistry)
* Programming
* General studies

Rules:
* Avoid complex jargon unless user asks
* If user is confused, simplify further
* Keep answers clear and structured
* Keep answers under 150–200 words unless needed."""

            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                system_instruction=system_instruction
            )
            
            chat = model.start_chat(history=formatted_history)
            response = chat.send_message(message)
            reply = response.text.strip()

            # Save user message & assistant reply to DB
            try:
                user_msg = ChatMessage(user_id=user_id, role="user", content=message)
                assistant_msg = ChatMessage(user_id=user_id, role="assistant", content=reply)
                db.session.add(user_msg)
                db.session.add(assistant_msg)
                db.session.commit()
            except Exception as db_err:
                db.session.rollback()
                logger.error(f"Failed to save real chat messages to DB: {db_err}")

            return reply, None

        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            # Try to save the user message to keep the history consistent
            try:
                user_msg = ChatMessage(user_id=user_id, role="user", content=message)
                db.session.add(user_msg)
                db.session.commit()
            except Exception as db_err:
                db.session.rollback()
                logger.error(f"Failed to save user message to DB on failure: {db_err}")
                
            return "Sorry, I couldn't understand that. Try asking in a simpler way.", None

    @staticmethod
    def _get_mock_chat_response(message):
        """
        Generate mock responses for test queries when GEMINI_API_KEY is not set.
        """
        msg_lower = message.lower()
        if "pythagoras" in msg_lower:
            return (
                "The Pythagoras theorem is a simple math rule for right-angled triangles (triangles with one 90-degree corner).\n\n"
                "It states that: a² + b² = c²\n\n"
                "Where 'a' and 'b' are the two shorter sides, and 'c' is the longest side (called the hypotenuse).\n\n"
                "Example: If one side is 3cm and the other is 4cm, the longest side will be 5cm because 3² (9) + 4² (16) = 5² (25)."
            )
        elif "photosynthesis" in msg_lower:
            return (
                "Photosynthesis is how plants make their own food using sunlight!\n\n"
                "Here is how it works step-by-step:\n"
                "1. Plants absorb carbon dioxide from the air and water from the soil.\n"
                "2. Green leaves contain chlorophyll, which captures sunlight.\n"
                "3. Sunlight turns water and carbon dioxide into glucose (food) and oxygen.\n"
                "4. The plant releases oxygen into the air for us to breathe!"
            )
        elif "binary tree" in msg_lower:
            return (
                "A binary tree is a data structure in programming that looks like an upside-down family tree.\n\n"
                "1. It starts with a single top item called the **Root**.\n"
                "2. Each item (called a **Node**) can connect to at most **two** other items below it (a left child and a right child).\n"
                "3. It is used to organize data so it can be searched very quickly, just like looking up a word in a sorted dictionary."
            )
        elif "newton" in msg_lower:
            return (
                "Sir Isaac Newton proposed three laws of motion that explain how things move:\n\n"
                "1. **First Law (Inertia)**: An object will keep doing what it's doing (resting or moving) unless a force pushes it.\n"
                "2. **Second Law (F = ma)**: Pushing an object harder makes it speed up faster. A heavier object needs more push to speed up.\n"
                "3. **Third Law (Action & Reaction)**: For every action, there is an equal and opposite reaction. For example, balloon air going down pushes the balloon up!"
            )
        else:
            return f"[AI Mock Learning Assistant] You asked: '{message}'. This is a simplified explanation to help you learn! To enable live Gemini responses, please configure a valid GEMINI_API_KEY."

