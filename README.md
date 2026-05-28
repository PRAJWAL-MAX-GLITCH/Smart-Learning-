# Smart Learning Platform

An intelligent, full-stack AI-powered educational platform built with modern web technologies. The platform features adaptive course recommendations, an AI Study Roadmap Generator, a real-time AI Chatbot Tutor, multi-model Machine Learning classifiers, comprehensive student analytics, certificates, and a full admin management portal.

---

## 🚀 Features

### For Students
- **Course Catalog**: Browse and enroll in a variety of courses.
- **Interactive Lessons**: View detailed lesson content including multimedia and YouTube videos.
- **Quizzes & Assessments**: Test your knowledge with interactive quizzes and receive instant feedback.
- **Progress Tracking & Dashboard**: Monitor learning streaks, average quiz scores, weekly activity charts, and recent activity feed.
- **Adaptive Recommendations**: Personalized course recommendations based on weak performance areas (accuracy < 60%), matched to course categories.
- **AI Study Roadmap**: A dynamic 4-week personalized study plan powered by **Google Gemini** (with a smart procedural fallback). The roadmap adapts to your detected student level (School/Beginner/Intermediate/Advanced), weak topics, and learning speed. Each task can be checked off, and a **Feedback Loop** system updates your topic stats when you complete study tasks.
- **Student Level Detection**: A trained **Random Forest ML Classifier** analyzes your quiz scores, accuracy, learning speed, chat complexity, and weak topic count to automatically predict your proficiency level.
- **ML Performance Predictor**: A **Logistic Regression** model predicts your likelihood of passing the next quiz based on quiz history.
- **AI Chatbot Tutor**: Real-time subject-aware chat powered by **Google Gemini**. Automatically detects topic context and stores full conversation history per user.
- **Certificates**: Automatically earn and verify digital certificates on scoring 80%+ in course quizzes.
- **AI Video Summaries**: Get AI-generated summaries of lesson YouTube videos.
- **Notifications**: Stay updated on course announcements and deadlines.

### For Administrators
- **Comprehensive Admin Dashboard**: View system-wide analytics, popular courses, and platform engagement metrics.
- **Course & Lesson Management**: Create, edit, and organize courses and lesson content.
- **Bulk Import**: Import quizzes and course data via CSV/JSON.
- **Student Management**: Manage user roles, access, and monitor individual progress.
- **Activity Logs**: Track system activity and user actions.
- **System Settings**: Configure application-wide settings and premium features.

---

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router
- Lucide Icons / Recharts

**Backend:**
- Python (Flask)
- SQLAlchemy (ORM)
- JWT (JSON Web Tokens) for Authentication
- Google Gemini API (Generative AI — Chatbot & Roadmap)
- YouTube Transcript API (AI Video Summaries)

**Machine Learning:**
- scikit-learn (Logistic Regression + Random Forest Classifier)
- pandas / joblib
- Synthetic + real behavioral datasets

---

## 📂 Project Structure

```text
SmartLearning/
├── backend/                          # Flask Backend
│   ├── app/                          # Application code
│   │   ├── controllers/              # Route handlers (Auth, AI, ML, Analytics, Chat, Roadmap)
│   │   ├── models/                   # DB Models (User, Course, Result, Chat, Roadmap, UserTopicStats)
│   │   ├── routes/                   # API endpoints routing
│   │   ├── schemas/                  # Data validation schemas (Marshmallow)
│   │   ├── services/                 # Business logic
│   │   │   ├── ai_service.py         # AI summarization & chatbot logic
│   │   │   ├── roadmap_service.py    # AI Study Roadmap Generator (Gemini + Procedural Fallback)
│   │   │   ├── student_level_service.py  # ML Student Proficiency Level Detector
│   │   │   ├── ml_service.py         # ML Quiz Performance Predictor
│   │   │   └── quiz_service.py       # Quiz scoring & topic stat tracking
│   │   └── utils/                    # Decorators & validators
│   ├── datasets/                     # Training datasets (student learning behavior CSV)
│   ├── ml/                           # Machine Learning pipelines & models
│   │   ├── train_model.py            # Pass/Fail Logistic Regression trainer
│   │   ├── train_student_level.py    # Student Level Random Forest trainer
│   │   └── model.pkl                 # Trained model binary
│   ├── models/                       # Saved ML model artifacts
│   │   ├── student_level_model.pkl   # Trained Random Forest (Student Level)
│   │   └── label_encoder.pkl         # Label encoder for student level classes
│   ├── fix_topics.py                 # DB maintenance: normalizes question topic mapping
│   └── run.py                        # Backend entry point
│
└── frontend/                         # React Frontend
    ├── public/                       # Static assets
    └── src/
        ├── components/               # Reusable UI components (Navbar, Layout, etc.)
        ├── context/                  # React Context (AuthContext)
        ├── pages/                    # View pages (Dashboard, Chatbot, Roadmap, Quizzes, Admin)
        ├── routes/                   # Application routing
        └── services/                 # API integration (aiService, mlService, analyticsService)
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Run Database Alignment Script
Normalizes question topics to match course categories (required for recommendations):
```bash
python fix_topics.py
```

#### Train ML Models
```bash
# Train the Quiz Pass/Fail predictor
python ml/train_model.py

# Train the Student Level classifier
python ml/train_student_level.py
```

#### Start the Backend Server
```bash
python run.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 AI & ML Features Summary

### 1. AI Study Roadmap Generator
Generates a dynamic **4-week personalized study plan** powered by **Google Gemini**. Falls back to a smart procedural engine if no API key is configured. Adapts based on:
- Detected Student Level (School / Beginner / Intermediate / Advanced)
- Weak topics (from quiz analytics)
- Learning speed (from quiz timing)
- Incomplete courses

Includes a **Feedback Loop**: completing roadmap tasks boosts topic accuracy in the database and automatically invalidates the cached roadmap to trigger fresh regeneration.

**API Endpoints:**
- `GET /api/ai/roadmap` — Generate/retrieve roadmap
- `POST /api/ai/roadmap/toggle` — Toggle task completion
- `DELETE /api/ai/roadmap/regenerate` — Force regenerate roadmap

### 2. AI Chatbot Tutor
Real-time AI tutor powered by **Google Gemini**. Detects subject and difficulty from the conversation and stores full chat history per user in the database.

**API Endpoint:** `POST /api/ai/chat`

### 3. Student Level Classifier (Random Forest)
Trained on a 5000-row behavioral dataset. Classifies students into:
`School Student` → `Beginner` → `Intermediate` → `Advanced`

**Features used:** quiz score, accuracy, retry count, avg quiz time, course completion, chat complexity, learning speed, weak topics count.

### 4. Quiz Pass/Fail Predictor (Logistic Regression)
Predicts whether a student will pass their next quiz.

| Feature | Description |
|---|---|
| `average_score` | Cumulative quiz percentage |
| `total_attempts` | Total quiz attempts |
| `weak_topics_count` | Topics with accuracy < 50% |

**API Endpoint:** `GET /api/ml/predict/<user_id>`

### 5. Adaptive Course Recommendations
Weak topics (accuracy < 60%) are matched against course categories to surface personalized course suggestions.

**API Endpoint:** `GET /api/analytics/recommendations`

---

## 🔐 Environment Variables
Create a `.env` file inside `backend/` and set:

```env
SECRET_KEY=your_flask_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite:///smartlearning.db
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).