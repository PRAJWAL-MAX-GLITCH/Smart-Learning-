import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# -----------------------------------------------
# STEP 1: Generate Synthetic Dataset
# -----------------------------------------------
def generate_synthetic_data(num_rows=200):
    np.random.seed(42)

    data = {
        'average_score':     np.random.randint(0, 101, num_rows),
        'total_attempts':    np.random.randint(1, 6,   num_rows),
        'weak_topics_count': np.random.randint(0, 6,   num_rows)
    }

    df = pd.DataFrame(data)

    def determine_result(row):
        score   = row['average_score']
        weak    = row['weak_topics_count']
        attempts = row['total_attempts']

        # Clear Pass: high score, low weak topics
        if score > 70 and weak <= 2:
            return 1
        # Clear Fail: low score, high weak topics
        elif score < 50 and weak >= 3:
            return 0
        else:
            # Fuzzy middle ground with attempts as tiebreaker
            prob = 0.5 + (score - 60) * 0.01 - (weak - 2) * 0.1 + (attempts - 3) * 0.05
            return 1 if prob > 0.5 else 0

    df['result'] = df.apply(determine_result, axis=1)
    return df


# -----------------------------------------------
# STEP 2: Train + Evaluate + Save Model
# -----------------------------------------------
def train_and_evaluate():
    print("=" * 50)
    print("  SmartLearning ML Training Pipeline")
    print("=" * 50)

    # Generate dataset
    print("\n[1] Generating synthetic dataset (200 rows)...")
    df = generate_synthetic_data(200)

    print("\n[DATASET PREVIEW - first 10 rows]")
    print(df.head(10).to_string(index=False))
    print(f"\n  Total rows    : {len(df)}")
    print(f"  Pass (1) count: {(df['result'] == 1).sum()}")
    print(f"  Fail (0) count: {(df['result'] == 0).sum()}")

    # Features and target
    X = df[['average_score', 'total_attempts', 'weak_topics_count']]
    y = df['result']

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"\n[2] Train size: {len(X_train)}  |  Test size: {len(X_test)}")

    # Train model
    print("\n[3] Training Logistic Regression...")
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print("\n[RESULTS]")
    print(f"  Accuracy: {accuracy * 100:.2f}%")
    print("\n[Classification Report]")
    print(classification_report(y_test, y_pred, target_names=["Fail", "Pass"]))

    # Save model
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
    joblib.dump(model, model_path)
    print(f"[SAVED] Model saved to: {model_path}")
    print("\n  Pipeline complete! Model is ready for API integration.")
    print("=" * 50)


if __name__ == "__main__":
    train_and_evaluate()
