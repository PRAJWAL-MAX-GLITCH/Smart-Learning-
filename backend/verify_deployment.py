import sys
import os
import joblib

print("1. Checking Python Version...")
print(sys.version)

print("\n2. Checking ML Models...")
base_dir = os.path.dirname(os.path.abspath(__file__))
ml_models = [
    os.path.join(base_dir, "models", "student_level_model.pkl"),
    os.path.join(base_dir, "models", "label_encoder.pkl"),
    os.path.join(base_dir, "ml", "model.pkl")
]

all_loaded = True
for model_path in ml_models:
    try:
        model = joblib.load(model_path)
        print(f"  [OK] Loaded: {os.path.basename(model_path)}")
    except Exception as e:
        print(f"  [ERROR] Failed to load {os.path.basename(model_path)}: {e}")
        all_loaded = False

if all_loaded:
    print("  => All ML models loaded successfully.")

print("\n3. Checking Gemini API Configuration...")
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "dummy_key_for_testing" and api_key.strip() != "":
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        # Just a quick ping
        print("  [OK] Gemini API key configured. Attempting ping...")
        response = model.generate_content("Ping")
        if response.text:
            print("  [OK] Gemini API responded successfully.")
        else:
             print("  [WARNING] Gemini API responded with empty text.")
    except Exception as e:
        print(f"  [ERROR] Gemini API failed: {e}")
else:
    print("  [WARNING] Gemini API key not found or using dummy key. Skipping live ping.")

print("\nVerification Complete.")
