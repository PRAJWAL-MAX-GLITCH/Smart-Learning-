import requests

# Test data with a known Admin Token (we'll try to get one or just test the model)
# But here I'll try to just hit the endpoint with a test script

def test_add_question():
    url = "http://127.0.0.1:5000/api/quizzes/questions"
    
    # We need a real token. Let's try to login first.
    login_url = "http://127.0.0.1:5000/api/auth/login"
    login_data = {"email": "prajwal@google.com", "password": "password123"} # Change to your actual email
    
    try:
        r = requests.post(login_url, json=login_data)
        if r.status_code == 200:
            token = r.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            
            q_data = {
                "course_id": 1,
                "question_text": "Is connectivity working?",
                "option_a": "Yes",
                "option_b": "No",
                "option_c": "Maybe",
                "option_d": "None",
                "correct_answer": "A",
                "difficulty": "easy"
            }
            
            res = requests.post(url, json=q_data, headers=headers)
            print(f"Status: {res.status_code}")
            print(f"Response: {res.text}")
        else:
            print(f"Login failed: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_add_question()
