# Smart Learning Platform

An intelligent, full-stack educational platform built with modern web technologies. This application features a robust backend architecture, an Adaptive learning recommendation system, Machine Learning predictive feedback, AI-assisted learning capabilities, comprehensive analytics, and an intuitive user interface for both students and administrators.

---

## 🚀 Features

### For Students
- **Course Catalog**: Browse and enroll in various courses.
- **Interactive Lessons**: View detailed lesson content, including multimedia.
- **Quizzes & Assessments**: Test your knowledge with interactive quizzes.
- **Progress Tracking & Analytics**: Monitor learning streaks, average quiz scores, and recent activities.
- **Adaptive Recommendations**: Receives personalized course recommendations targeting weak performance areas (accuracy < 60%) while highlighting strong accomplishments.
- **ML Performance Predictor**: Leverages an integrated machine learning model to predict your likelihood of passing the next quiz based on performance history.
- **Certificates**: Automatically earn and verify digital completion certificates when scoring above 80% on course quizzes.
- **AI-Powered Assistance**: Smart study help powered by AI video summaries.
- **Notifications**: Stay updated on course announcements and deadlines.

### For Administrators
- **Comprehensive Dashboard**: View system-wide analytics, popular courses, and user engagement metrics.
- **Course & Lesson Management**: Create, edit, and organize educational content.
- **Bulk Import**: Easily import quizzes and course data.
- **Student Management**: Manage user roles, access, and monitor progress.
- **Activity Logs**: Track system activity and user actions.
- **System Settings**: Configure application-wide settings and premium features.

---

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router / Lucide Icons / Recharts

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
├── backend/                  # Flask Backend
│   ├── app/                  # Application code
│   │   ├── controllers/      # Route handlers (Auth, AI, ML, Analytics, etc.)
│   │   ├── models/           # Database models (User, Course, Result, UserTopicStats)
│   │   ├── routes/           # API endpoints routing
│   │   ├── schemas/          # Data validation schemas (Marshmallow)
│   │   ├── services/         # Business logic (AI summaries, ML predictions, etc.)
│   │   └── utils/            # Decorators & validators
│   ├── ml/                   # Machine Learning pipeline & models
│   │   ├── train_model.py    # Synthetic dataset generator & model training script
│   │   └── model.pkl         # Trained Logistic Regression model binary
│   ├── fix_topics.py         # Database maintenance script (re-aligns topic mapping)
│   └── run.py                # Backend entry point
│
└── frontend/                 # React Frontend
    ├── public/               # Static assets
    └── src/
        ├── components/       # Reusable UI components
        ├── context/          # React Context (AuthContext)
        ├── pages/            # View pages (Dashboard, Admin portal, Quizzes)
        ├── routes/           # Application routing
        └── services/         # API integration methods (mlService, analyticsService, etc.)
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
Ensure question topics match parent course categories so the recommendation engine behaves correctly:
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
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🧠 Machine Learning & Recommendation Details

### Adaptive Recommendations
The system analyzes user quiz accuracy. Topics scoring `< 60%` are categorized as **weak topics**, and courses matching these topics are fetched as recommendations. The database alignment script (`fix_topics.py`) normalizes course categories and matches question topics to make this mapping robust.

### Logistic Regression Classifier
The platform predicts student performance using a trained Logistic Regression model stored in `backend/ml/model.pkl`. It uses three features:
1. `average_score` (User's cumulative quiz percentage)
2. `total_attempts` (Number of quiz attempts)
3. `weak_topics_count` (Count of topics where accuracy is < 50%)

It outputs a prediction class (**Pass** / **Fail**) along with a probability confidence score, allowing the application to provide proactive feedback.

---

## 🔐 Environment Variables
Make sure to configure the necessary environment variables for your database connection, JWT secret key, and AI service credentials in a `.env` file in your backend directory.

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).