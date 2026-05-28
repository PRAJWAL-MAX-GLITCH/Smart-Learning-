import os
import joblib
import pandas as pd

# Load models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "student_level_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "models", "label_encoder.pkl")

def test_model():
    print("=" * 60)
    print("  SmartLearning Student Level ML Model Checker")
    print("=" * 60)
    
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
        print("ERROR: Model or Label Encoder not found at paths:")
        print(f"  Model: {MODEL_PATH}")
        print(f"  Encoder: {ENCODER_PATH}")
        print("Please train the model first by running train_student_level.py.")
        return

    try:
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        print("[OK] Successfully loaded student level model and label encoder.")
    except Exception as e:
        print(f"ERROR loading model: {e}")
        return

    # Define standard scenarios mimicking each profile
    scenarios = [
        {
            "name": "Typical School Student",
            "features": {
                "quiz_score": 25.0,
                "accuracy": 20.0,
                "retry_count": 7,
                "avg_quiz_time": 600,
                "course_completion": 15,
                "chat_complexity": 2,
                "learning_speed": 1,
                "weak_topics_count": 6
            }
        },
        {
            "name": "Typical Beginner",
            "features": {
                "quiz_score": 55.0,
                "accuracy": 50.0,
                "retry_count": 4,
                "avg_quiz_time": 400,
                "course_completion": 40,
                "chat_complexity": 4,
                "learning_speed": 2,
                "weak_topics_count": 4
            }
        },
        {
            "name": "Typical Intermediate",
            "features": {
                "quiz_score": 75.0,
                "accuracy": 75.0,
                "retry_count": 2,
                "avg_quiz_time": 200,
                "course_completion": 70,
                "chat_complexity": 6,
                "learning_speed": 3,
                "weak_topics_count": 2
            }
        },
        {
            "name": "Typical Advanced",
            "features": {
                "quiz_score": 95.0,
                "accuracy": 92.0,
                "retry_count": 0,
                "avg_quiz_time": 100,
                "course_completion": 90,
                "chat_complexity": 9,
                "learning_speed": 3,
                "weak_topics_count": 0
            }
        }
    ]

    print("\n--- Running Scenario Predictions ---")
    for s in scenarios:
        df = pd.DataFrame([s["features"]])
        # Keep features in the correct order
        df = df[["quiz_score", "accuracy", "retry_count", "avg_quiz_time", "course_completion", "chat_complexity", "learning_speed", "weak_topics_count"]]
        
        try:
            pred_idx = model.predict(df)[0]
            pred_level = label_encoder.inverse_transform([pred_idx])[0]
            
            # Predict probabilities if supported
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(df)[0]
                conf = probs[pred_idx] * 100
                conf_str = f"Confidence: {conf:.2f}%"
            else:
                conf_str = ""

            print(f"\nProfile: {s['name']}")
            print(f"  Input Features : {s['features']}")
            print(f"  Predicted Level: \033[1;32m{pred_level}\033[0m ({conf_str})")
        except Exception as e:
            print(f"  Error predicting for {s['name']}: {e}")

    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_model()
