# Smart Learning Platform

An intelligent, full-stack educational platform built with modern web technologies. This application features a robust backend architecture, an Adaptive Learning Recommendation System, Machine Learning predictive feedback, an AI-powered Chatbot Tutor, AI video summarization, comprehensive analytics, and an intuitive user interface for both students and administrators.

---

## 🚀 Features

### For Students
- **Course Catalog**: Browse and enroll in various courses.
- **Interactive Lessons**: View detailed lesson content, including multimedia.
- **Quizzes & Assessments**: Test your knowledge with interactive quizzes.
- **Progress Tracking & Analytics**: Monitor learning streaks, average quiz scores, and recent activities via a personalized dashboard.
- **Adaptive Recommendations**: Receive personalized course recommendations targeting weak performance areas (accuracy < 60%) while highlighting strong topics.
- **AI Chatbot Tutor**: Chat in real-time with a subject-aware AI tutor powered by Google Gemini. Automatically detects topic context (subject & difficulty level) and stores your full conversation history.
- **ML Performance Predictor**: Leverages an integrated Machine Learning model to predict your likelihood of passing the next quiz based on your performance history.
- **Certificates**: Automatically earn and verify digital completion certificates when scoring above 80% on course quizzes.
- **AI Video Summaries**: Get AI-generated summaries of lesson YouTube videos.
- **Notifications**: Stay updated on course announcements and deadlines.

### For Administrators
- **Comprehensive Dashboard**: View system-wide analytics, popular courses, and user engagement metrics.
- **Course & Lesson Management**: Create, edit, and organize educational content.
- **Bulk Import**: Easily import quizzes and course data via CSV/JSON.
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
- Machine Learning (scikit-learn, pandas, joblib)
- YouTube Transcript API & Google Gemini (Generative AI)

---

## 📂 Project Structure

```text
SmartLearning/
├── backend/                      # Flask Backend
│   ├── app/                      # Application code
│   │   ├── controllers/          # Route handlers (Auth, AI, ML, Analytics, Chat)
│   │   ├── models/               # Database models (User, Course, Result, Chat, etc.)
│   │   ├── routes/               # API endpoints routing
│   │   ├── schemas/              # Data validation schemas (Marshmallow)
│   │   ├── services/             # Business logic (AI, ML predictions, chat)
│   │   └── utils/                # Decorators & validators
│   ├── ml/                       # Machine Learning pipeline & models
│   │   ├── train_model.py        # Synthetic dataset generator & model trainer
│   │   └── model.pkl             # Trained Logistic Regression model binary
│   ├── fix_topics.py             # DB maintenance: re-aligns question topic mapping
│   └── run.py                    # Backend entry point
│
└── frontend/                     # React Frontend
    ├── public/                   # Static assets
    └── src/
        ├── components/           # Reusable UI components (Navbar, Layout, etc.)
        ├── context/              # React Context (AuthContext)
        ├── pages/                # View pages (Dashboard, Chatbot, Quizzes, Admin)
        ├── routes/               # Application routing
        └── services/             # API integration (aiService, mlService, etc.)
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)

### 1. Backend Setup
Navigate to the backend directory and set up a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Run Database Maintenance Script
Ensure question topics match parent course categories so recommendations work correctly:
```bash
python fix_topics.py
```

#### Train the Machine Learning Model
Generate the synthetic dataset and train the Logistic Regression predictor:
```bash
python ml/train_model.py
```

#### Start the Server
Run the Flask development server:
```bash
python run.py
```

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 AI & Machine Learning Features

### AI Chatbot Tutor
The platform includes a built-in AI tutor powered by **Google Gemini**. Students can ask questions on any topic, and the chatbot:
- Detects the **subject** and **difficulty level** automatically
- Maintains a **persistent conversation history** (stored per user in the database)
- Is accessible directly from the student navigation bar

**API Endpoint:** `POST /api/ai/chat`

### Adaptive Course Recommendations
The system analyzes user quiz accuracy per topic. Topics scoring `< 60%` are categorized as **weak topics**, and courses matching these topics are fetched as personalized recommendations. The `fix_topics.py` script normalizes course categories to ensure robust matching.

**API Endpoint:** `GET /api/analytics/recommendations`

### ML Performance Predictor (Logistic Regression)
Predicts whether a student will pass or fail their next quiz using three features:

| Feature | Description |
|---|---|
| `average_score` | User's cumulative quiz percentage |
| `total_attempts` | Total number of quiz attempts |
| `weak_topics_count` | Count of topics where accuracy < 50% |

Returns a **Pass / Fail** prediction with a **confidence score**.

**API Endpoint:** `GET /api/ml/predict/<user_id>`

---

## 🔐 Environment Variables
Create a `.env` file inside the `backend/` directory and configure the following:

```env
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
DATABASE_URL=sqlite:///smartlearning.db   # or your DB connection string
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).