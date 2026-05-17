# Smart Learning Platform

An intelligent, full-stack educational platform built with modern web technologies. This application features a robust backend architecture, AI-assisted learning capabilities, comprehensive analytics, and an intuitive user interface for both students and administrators.

## 🚀 Features

### For Students
- **Course Catalog**: Browse and enroll in various courses.
- **Interactive Lessons**: View detailed lesson content, including multimedia.
- **Quizzes & Assessments**: Test your knowledge with interactive quizzes.
- **Progress Tracking**: Monitor your learning journey and track topic-wise statistics.
- **AI-Powered Assistance**: Get smart learning recommendations and help.
- **Certificates**: Earn and verify certificates upon course completion.
- **Notifications**: Stay updated on course announcements and deadlines.

### For Administrators
- **Comprehensive Dashboard**: View system-wide analytics and user engagement.
- **Course & Lesson Management**: Create, edit, and organize educational content.
- **Bulk Import**: Easily import quizzes and course data.
- **Student Management**: Manage user roles, access, and monitor progress.
- **Activity Logs**: Track system activity and user actions.
- **System Settings**: Configure application-wide settings and premium features.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router

**Backend:**
- Python (Flask)
- SQLAlchemy (ORM)
- JWT (JSON Web Tokens) for Authentication

## 📂 Project Structure

```text
SmartLearning/
├── backend/                  # Flask Backend
│   ├── app/                  # Application code
│   │   ├── controllers/      # Route handlers & logic
│   │   ├── models/           # Database models
│   │   ├── routes/           # API endpoints routing
│   │   ├── schemas/          # Data validation schemas
│   │   └── services/         # Business logic & external services
│   └── run.py                # Backend entry point
│
└── frontend/                 # React Frontend
    ├── public/               # Static assets
    └── src/
        ├── components/       # Reusable UI components
        ├── context/          # React Context (Auth, etc.)
        ├── pages/            # View components (Admin/Student)
        ├── routes/           # Application routing
        └── services/         # API integration methods
```

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

Run the backend development server:
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

## 🔐 Environment Variables
Make sure to configure the necessary environment variables for your database connection, JWT secret key, and AI service credentials in a `.env` file in your backend directory.

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).