import json
import urllib.request
import sys
from sqlalchemy import create_engine
from config import settings

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

# 2. Google Gemini API Key Test
print("\n[2] Testing Google Gemini API Key...")
if not settings.GEMINI_API_KEY or "ADD_YOUR" in settings.GEMINI_API_KEY:
    print(" [SKIP] Gemini Key: Skipped (placeholder detected)")
else:
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        req = urllib.request.Request(
            url,
            headers={"Content-Type": "application/json"},
            data=json.dumps({"contents": [{"parts": [{"text": "ping"}]}]}).encode("utf-8"),
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=8) as res:
            res_data = json.loads(res.read().decode())
            if "candidates" in res_data:
                print(" [OK] Gemini API Key: VALID!")
            else:
                print(" [FAIL] Gemini API Key: INVALID (Unexpected response format)")
                errors += 1
    except Exception as e:
        errors += 1
        print(f" [FAIL] Gemini API Key: FAILED. Reason: {str(e)[:100]}")

# 3. OpenAI API Key Test
print("\n[3] Testing OpenAI API Key...")
if not settings.OPENAI_API_KEY or "ADD_YOUR" in settings.OPENAI_API_KEY:
    print(" [SKIP] OpenAI Key: Skipped (placeholder detected)")
else:
    try:
        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"},
            data=json.dumps({"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "ping"}], "max_tokens": 5}).encode("utf-8"),
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=8) as res:
            json.loads(res.read().decode())
            print(" [OK] OpenAI API Key: VALID!")
    except Exception as e:
        errors += 1
        print(f" [FAIL] OpenAI API Key: FAILED. Reason: {str(e)[:100]}")

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
