import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib
import os
import random

# Ensure directories exist
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATASETS_DIR, exist_ok=True)

def generate_dataset(num_rows=5500):
    print(f"Generating dataset with {num_rows} rows...")
    np.random.seed(42)
    random.seed(42)

    data = []
    
    levels = ["School Student", "Beginner", "Intermediate", "Advanced"]
    
    for i in range(num_rows):
        level = np.random.choice(levels, p=[0.25, 0.35, 0.25, 0.15])
        
        # Base values depending on the level
        if level == "School Student":
            quiz_score = np.random.randint(10, 50)
            accuracy = np.random.uniform(10, 45)
            retry_count = np.random.randint(4, 10)
            avg_quiz_time = np.random.randint(300, 900)  # slow, 5-15 mins
            course_completion = np.random.randint(5, 40)
            chat_complexity = np.random.randint(1, 3)  # low complexity
            learning_speed = 1  # slow
            weak_topics_count = np.random.randint(4, 10)
            
        elif level == "Beginner":
            quiz_score = np.random.randint(40, 70)
            accuracy = np.random.uniform(40, 65)
            retry_count = np.random.randint(2, 6)
            avg_quiz_time = np.random.randint(200, 600)  # moderate
            course_completion = np.random.randint(20, 60)
            chat_complexity = np.random.randint(3, 5)
            learning_speed = 2  # medium
            weak_topics_count = np.random.randint(2, 6)
            
        elif level == "Intermediate":
            quiz_score = np.random.randint(65, 85)
            accuracy = np.random.uniform(65, 85)
            retry_count = np.random.randint(1, 4)
            avg_quiz_time = np.random.randint(120, 300)  # fast
            course_completion = np.random.randint(50, 90)
            chat_complexity = np.random.randint(5, 8)
            learning_speed = 3  # fast
            weak_topics_count = np.random.randint(1, 4)
            
        else: # Advanced
            quiz_score = np.random.randint(85, 101)
            accuracy = np.random.uniform(85, 100)
            retry_count = np.random.randint(0, 2)
            avg_quiz_time = np.random.randint(60, 180)  # very fast
            course_completion = np.random.randint(80, 101)
            chat_complexity = np.random.randint(7, 11)  # high complexity
            learning_speed = 3  # fast
            weak_topics_count = np.random.randint(0, 2)
            
        # Add a bit of noise
        if random.random() < 0.1:
            quiz_score = np.clip(quiz_score + np.random.randint(-15, 16), 0, 100)
            
        data.append([
            i + 1,  # student_id
            quiz_score,
            round(accuracy, 2),
            retry_count,
            avg_quiz_time,
            course_completion,
            chat_complexity,
            learning_speed,
            weak_topics_count,
            level
        ])

    df = pd.DataFrame(data, columns=[
        "student_id", "quiz_score", "accuracy", "retry_count", 
        "avg_quiz_time", "course_completion", "chat_complexity", 
        "learning_speed", "weak_topics_count", "student_level"
    ])
    
    csv_path = os.path.join(DATASETS_DIR, "student_learning_behavior.csv")
    df.to_csv(csv_path, index=False)
    print(f"Dataset saved to: {csv_path}")
    
    return df

def train_model():
    print("=" * 50)
    print("  Personalized Explanation Engine - Training")
    print("=" * 50)

    # 1. Generate Dataset
    df = generate_dataset()

    # 2. Preprocess features
    X = df.drop(columns=["student_id", "student_level"])
    y = df["student_level"]

    # 3. Encode labels
    print("Encoding labels...")
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Save label encoder
    le_path = os.path.join(MODELS_DIR, "label_encoder.pkl")
    joblib.dump(le, le_path)
    print(f"Label encoder saved to: {le_path}")

    # 4. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    # 5. Train model
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train, y_train)

    # 6. Evaluate accuracy
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted")
    rec = recall_score(y_test, y_pred, average="weighted")
    f1 = f1_score(y_test, y_pred, average="weighted")
    
    print("\n[MODEL METRICS]")
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall   : {rec * 100:.2f}%")
    print(f"F1-score : {f1 * 100:.2f}%")
    
    print("\n[CLASSIFICATION REPORT]")
    # Get original label names sorted by their encoded integer value
    target_names = [str(cls) for cls in le.classes_]
    print(classification_report(y_test, y_pred, target_names=target_names))

    # 8. Save model
    model_path = os.path.join(MODELS_DIR, "student_level_model.pkl")
    joblib.dump(model, model_path)
    print(f"[SAVED] Model saved to: {model_path}")
    print("=" * 50)

if __name__ == "__main__":
    train_model()
