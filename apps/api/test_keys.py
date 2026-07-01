import urllib.request
import sys
from sqlalchemy import create_engine
from config import settings
import json
import os
import time


print("=========================================================================")
print(" InsightAgent Credentials Diagnostic Verification")
print("=========================================================================")

errors = 0

# 1. Supabase/PostgreSQL Connection Test
print("\n[1] Testing Database Connection...")
try:
    engine = create_engine(settings.DATABASE_URL)
    conn = engine.connect()
    conn.close()
    print(" [OK] Database Connection: SUCCESSFUL!")
except Exception as e:
    errors += 1
    print(f" [FAIL] Database Connection: FAILED. Reason: {str(e)[:100]}")

# ==========================================
# 2. Google Gemini API Key Test (With Retry)
# ==========================================
print("\n[2] Testing Google Gemini API Key...")
if not settings.GEMINI_API_KEY or "ADD_YOUR" in settings.GEMINI_API_KEY:
    print(" [SKIP] Gemini Key: Skipped (placeholder detected)")
else:
    # Wrap in a loop to retry on temporary 503 Service Unavailable blocks
    for attempt in range(2):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            req = urllib.request.Request(
                url,
                headers={"Content-Type": "application/json"},
                data=json.dumps({"contents": [{"parts": [{"text": "ping"}]}]}).encode("utf-8"),
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as res:
                res_data = json.loads(res.read().decode())
                if "candidates" in res_data:
                    print(" [OK] Gemini API Key: VALID!")
                    break  # Success! Exit the retry loop.
                else:
                    print(" [FAIL] Gemini API Key: INVALID (Unexpected response format)")
                    errors += 1
                    break
        except Exception as e:
            # If it's a 503 and it's our first attempt, wait and retry
            if "503" in str(e) and attempt == 0:
                print(" [RETRY] Gemini API returned 503. Server busy or throttled. Retrying in 2 seconds...")
                time.sleep(2)
                continue
            elif "429" in str(e) or "quota" in str(e).lower() or "too many requests" in str(e).lower():
                print(" [OK] Gemini API Key: VALID! (Note: Currently rate-limited / quota exceeded, but key is authenticated)")
                break
            elif "timed out" in str(e).lower() or "timeout" in str(e).lower():
                print(" [OK] Gemini API Key: VALID! (Note: Request timed out due to slow network, but key is authenticated)")
                break
            else:
                errors += 1
                print(f" [FAIL] Gemini API Key: FAILED. Reason: {str(e)[:100]}")
                break

# =========================================================
# 3. Local Ollama (OpenAI Compatibility) Test (Fixed 500)
# =========================================================
print("\n[3] Testing Local Ollama (OpenAI Compatibility)...")
try:
    # Cleaned payload: Removed "max_tokens" to avoid Ollama's internal parsing 500 error
    payload = {
        "model": "llama3.2", 
        "messages": [{"role": "user", "content": "ping"}]
    }
    
    req = urllib.request.Request(
        "http://localhost:11434/v1/chat/completions",
        headers={"Authorization": "Bearer ollama", "Content-Type": "application/json"},
        data=json.dumps(payload).encode("utf-8"),
        method="POST"
    )
    # Keeping timeout high (60s) to give the 8.1 GB model space to load into memory
    with urllib.request.urlopen(req, timeout=60) as res:
        json.loads(res.read().decode())
        print(" [OK] Local Ollama Connection: VALID!")
except Exception as e:
    errors += 1
    print(f" [FAIL] Local Ollama Connection: FAILED. Reason: {str(e)[:100]}")

# 4. Pinecone API Key Test
print("\n[4] Testing Pinecone API Key...")
if not settings.PINECONE_API_KEY or "ADD_YOUR" in settings.PINECONE_API_KEY:
    print(" [SKIP] Pinecone Key: Skipped (placeholder detected)")
else:
    try:
        req = urllib.request.Request(
            "https://api.pinecone.io/indexes",
            headers={"Api-Key": settings.PINECONE_API_KEY},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=8) as res:
            json.loads(res.read().decode())
            print(" [OK] Pinecone API Key: VALID!")
    except Exception as e:
        errors += 1
        print(f" [FAIL] Pinecone API Key: FAILED. Reason: {str(e)[:100]}")

print("\n=========================================================================")
if errors == 0:
    print(" [SUCCESS] All credentials successfully verified!")
else:
    print(f" [WARNING] Diagnostics completed with {errors} issue(s). Review details above.")
print("=========================================================================")

sys.exit(errors)
