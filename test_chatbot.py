import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def safe_print(text):
    try:
        print(text.encode('ascii', errors='replace').decode('ascii'))
    except Exception:
        print(text)

def run_tests():
    print("--- STARTING CHATBOT BACKEND TESTS ---")
    
    # 1. Login to get a valid JWT token
    login_url = f"{BASE_URL}/auth/login"
    # Try logging in with the default seeded student account
    login_payloads = [
        {"email": "abc152@gmail.com", "password": "password123"},
        {"email": "testuser999@gmail.com", "password": "password123"},
        {"email": "admin@smartlearning.com", "password": "Admin@1234"},
        {"email": "prajwal@google.com", "password": "password123"},
        {"email": "student@example.com", "password": "password123"}
    ]
    
    token = None
    email_used = ""
    for payload in login_payloads:
        try:
            r = requests.post(login_url, json=payload)
            if r.status_code == 200:
                res_data = r.json()
                if "token" in res_data:
                    token = res_data.get("token")
                    email_used = payload["email"]
                    print(f"[OK] Successfully logged in as {email_used}")
                    break
                else:
                    print(f"[INFO] Response 200 for {payload['email']} but no token found (2FA might be enabled). trying next...")
        except Exception as e:
            print(f"[WARN] Error trying login with {payload['email']}: {e}")
            
    if not token:
        print("[FAIL] Failed to log in with any test account. Make sure the backend server is running.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Clear Chat history first
    print("\n1. Testing POST /api/ai/chat/clear...")
    clear_url = f"{BASE_URL}/ai/chat/clear"
    try:
        r = requests.post(clear_url, headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"[FAIL] Clear chat failed: {e}")

    # 3. Test Get Chat History (should be empty)
    print("\n2. Testing GET /api/ai/chat/history (Expected: Empty)...")
    history_url = f"{BASE_URL}/ai/chat/history"
    try:
        r = requests.get(history_url, headers=headers)
        print(f"Status: {r.status_code}")
        history = r.json().get("history", [])
        print(f"History Count: {len(history)}")
    except Exception as e:
        print(f"[FAIL] Get chat history failed: {e}")

    # 4. Test Chat Bot response (Photosynthesis test query)
    print("\n3. Testing POST /api/ai/chat with 'What is photosynthesis?'...")
    chat_url = f"{BASE_URL}/ai/chat"
    chat_payload = {"message": "What is photosynthesis?"}
    try:
        r = requests.post(chat_url, json=chat_payload, headers=headers)
        print(f"Status: {r.status_code}")
        reply = r.json().get("reply")
        safe_print(f"Reply: {reply}")
        word_count = len(reply.split())
        print(f"Word count: {word_count} (Target: <150-200 words)")
    except Exception as e:
        print(f"[FAIL] Chat failed: {e}")

    # 5. Test Chat Bot response (Binary Tree test query)
    print("\n4. Testing POST /api/ai/chat with 'Explain binary tree'...")
    chat_payload = {"message": "Explain binary tree"}
    try:
        r = requests.post(chat_url, json=chat_payload, headers=headers)
        print(f"Status: {r.status_code}")
        reply = r.json().get("reply")
        safe_print(f"Reply: {reply}")
        word_count = len(reply.split())
        print(f"Word count: {word_count} (Target: <150-200 words)")
    except Exception as e:
        print(f"[FAIL] Chat failed: {e}")

    # 6. Test Get Chat History again (should have 4 messages: 2 user queries + 2 replies)
    print("\n5. Testing GET /api/ai/chat/history (Expected: 4 messages)...")
    try:
        r = requests.get(history_url, headers=headers)
        print(f"Status: {r.status_code}")
        history = r.json().get("history", [])
        print(f"History Count: {len(history)}")
        for idx, msg in enumerate(history):
            safe_print(f"  [{idx + 1}] {msg['role']}: {msg['content'][:60]}...")
    except Exception as e:
        print(f"[FAIL] Get chat history failed: {e}")

if __name__ == "__main__":
    run_tests()
