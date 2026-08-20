import os
import json
import urllib.request
import urllib.error
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

import database

load_dotenv()

app = Flask(__name__, static_folder="dist", static_url_path="")
CORS(app)

PORT = 5001
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
fallbacks_enabled = not GEMINI_API_KEY

# Initialize DB on start
database.init_db()

# Helper for calling Gemini API using standard library urllib
def call_gemini_api(system_instruction, prompt, response_schema=None):
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not defined.")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_instruction}]}
    }
    
    if response_schema:
        payload["generationConfig"] = {
            "responseMimeType": "application/json",
            "responseSchema": response_schema
        }
        
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        print(f"Gemini API HTTPError: {e.code} - {error_msg}")
        raise e
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        raise e

# --- Authentication API endpoints ---

@app.route("/api/auth/signup", methods=["POST"])
def auth_signup():
    data = request.json or {}
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")
    is_pro = data.get("is_pro", False)
    
    if not email or not name or not password:
        return jsonify({"error": "Please provide email, name, and password."}), 400
        
    user = database.create_user(email, name, password, is_pro=is_pro)
    if not user:
        return jsonify({"error": "A user with this email already exists."}), 400
        
    return jsonify(user)

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Please provide email and password."}), 400
        
    user = database.authenticate_user(email, password)
    if not user:
        return jsonify({"error": "Invalid email or password."}), 401
        
    return jsonify(user)

# --- User Profile endpoints ---

@app.route("/api/user", methods=["GET"])
def get_user():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required."}), 400
        
    user = database.get_user(email)
    if not user:
        return jsonify({"error": "User not found."}), 404
        
    return jsonify(user)

@app.route("/api/user/update", methods=["POST"])
def update_user():
    data = request.json or {}
    email = data.get("email")
    name = data.get("name")
    avatar = data.get("avatar")
    bio = data.get("bio")
    streak = data.get("streak", 1)
    total_minutes = data.get("totalMinutes", 0)  # notice camelCase mapping
    is_pro = data.get("isPro", False)            # notice camelCase mapping
    
    if not email:
        return jsonify({"error": "Email is required to update profile."}), 400
        
    user = database.get_user(email)
    if not user:
        return jsonify({"error": "User not found."}), 404
        
    updated_user = database.update_user(email, name, avatar, bio, streak, total_minutes, is_pro)
    return jsonify(updated_user)

@app.route("/api/user/reset-progress", methods=["POST"])
def reset_progress():
    data = request.json or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required to reset progress."}), 400
        
    success = database.reset_user_progress(email)
    if not success:
        return jsonify({"error": "Failed to reset progress."}), 500
        
    return jsonify({"success": True})

# --- Mood Logs endpoints ---

@app.route("/api/moods", methods=["GET"])
def get_moods():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email parameter is required."}), 400
    return jsonify(database.get_moods(email))

@app.route("/api/moods", methods=["POST"])
def add_mood():
    data = request.json or {}
    email = data.get("email")
    entry = data.get("entry")
    
    if not email or not entry:
        return jsonify({"error": "Email and mood entry details are required."}), 400
        
    success = database.add_mood(
        email=email,
        mood_id=entry.get("id"),
        date=entry.get("date"),
        value=entry.get("value"),
        name=entry.get("name"),
        note=entry.get("note"),
        factors=entry.get("factors", []),
        timestamp=entry.get("timestamp"),
        analysis=entry.get("analysis")
    )
    
    if not success:
        return jsonify({"error": "Failed to save mood log."}), 500
        
    return jsonify({"success": True})

# --- Journal Logs endpoints ---

@app.route("/api/journals", methods=["GET"])
def get_journals():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email parameter is required."}), 400
    return jsonify(database.get_journals(email))

@app.route("/api/journals", methods=["POST"])
def add_journal():
    data = request.json or {}
    email = data.get("email")
    entry = data.get("entry")
    
    if not email or not entry:
        return jsonify({"error": "Email and journal entry details are required."}), 400
        
    success = database.add_journal(
        email=email,
        journal_id=entry.get("id"),
        date=entry.get("date"),
        title=entry.get("title"),
        content=entry.get("content"),
        mood_value=entry.get("moodValue"),
        timestamp=entry.get("timestamp"),
        analysis=entry.get("analysis")
    )
    
    if not success:
        return jsonify({"error": "Failed to save journal log."}), 500
        
    return jsonify({"success": True})

@app.route("/api/journals/<journal_id>", methods=["DELETE"])
def delete_journal(journal_id):
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email parameter is required."}), 400
        
    success = database.delete_journal(email, journal_id)
    if not success:
        return jsonify({"error": "Failed to delete journal entry."}), 500
        
    return jsonify({"success": True})

# --- Emotion Sessions API endpoints ---

@app.route("/api/emotion-sessions", methods=["GET"])
def get_emotion_sessions():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email parameter is required."}), 400
        
    sessions = database.get_emotion_sessions(email)
    return jsonify(sessions)

@app.route("/api/emotion-sessions", methods=["POST"])
def add_emotion_session():
    data = request.json or {}
    email = data.get("email")
    session = data.get("session")
    
    if not email or not session:
        return jsonify({"error": "Email and session data are required."}), 400
        
    success = database.add_emotion_session(email, session)
    if not success:
        return jsonify({"error": "Failed to save emotion session."}), 500
        
    return jsonify({"success": True})

# --- Gemini API Proxies ---

@app.route("/api/analyze-journal", methods=["POST"])
def analyze_journal():
    data = request.json or {}
    content = data.get("content")
    mood_value = data.get("moodValue")
    
    if not content:
        return jsonify({"error": "Content is required"}), 400
        
    if fallbacks_enabled:
        tones = ["Reflective", "Searching", "Anxious", "Grateful", "Tired", "Hopeful"]
        tone = tones[min(len(content) % len(tones), len(tones) - 1)]
        journal_analysis = {
            "emotionalTone": f"{tone} (Self-guided Insight)",
            "underlyingThemes": [
                "Personal growth",
                "Career pacing" if ("work" in content.lower() or "job" in content.lower()) else "Mindful awareness",
                "Circadian recovery" if ("sleep" in content.lower() or "tired" in content.lower()) else "Daily life rhythms"
            ],
            "copingStrategies": [
                "Take three slow deep breaths when feeling unsettled.",
                "Practice standard 5-minute boxed breathing.",
                "Set aside 10 minutes for expressive writing daily."
            ],
            "psychologicalInsight": "Based on your self-reflection, writing things down helps externalize heavy feelings. Consider using our sonic sanctuary for deep relaxation.",
            "note": "Gemini API key is not currently configured. Using high-fidelity local cognitive analysis fallback."
        }
        return jsonify(journal_analysis)
        
    try:
        system_instruction = "You are an empathetic, clinical cognitive-behavioral therapy advisor. Provide constructive, safe psychological observations. Do not give official medical diagnoses."
        prompt = f'Analyze this psychological cognitive journal entry. Mood self-rating level is {mood_value}/5. Entry content: "{content}"'
        
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "emotionalTone": { 
                    "type": "STRING", 
                    "description": "A compact description of the primary emotional tone (e.g., Grateful, Overwhelmed but resilient)" 
                },
                "underlyingThemes": { 
                    "type": "ARRAY", 
                    "items": {"type": "STRING"},
                    "description": "List of 2-3 psychological or functional themes found in the entry" 
                },
                "copingStrategies": { 
                    "type": "ARRAY", 
                    "items": {"type": "STRING"},
                    "description": "3 highly specific, clear actionable wellness exercises or recommendations based on CBT" 
                },
                "psychologicalInsight": { 
                    "type": "STRING", 
                    "description": "A compassionate, insightful 2-sentence clinical review of their current mindset" 
                },
            },
            "required": ["emotionalTone", "underlyingThemes", "copingStrategies", "psychologicalInsight"]
        }
        
        raw_response = call_gemini_api(system_instruction, prompt, response_schema)
        parsed = json.loads(raw_response)
        return jsonify(parsed)
    except Exception as e:
        print("CBT analysis error:", str(e))
        return jsonify({"error": "Failed to perform AI analysis. Check your server settings or try again."}), 500

@app.route("/api/analyze-mood", methods=["POST"])
def analyze_mood():
    data = request.json or {}
    mood_value = data.get("moodValue")
    note = data.get("note")
    factors = data.get("factors")
    
    if fallbacks_enabled:
        stability_index = min(max(40 + (mood_value * 10) + (len(note) % 15 if note else 5), 20), 98)
        mood_analysis = {
            "stabilityIndex": stability_index,
            "primaryStressors": factors if factors and len(factors) > 0 else ["Unspecified stress"],
            "sentimentScore": "Positive Alignment" if mood_value >= 4 else "Balanced State" if mood_value == 3 else "Reflective/Strained State",
            "advice": "Your feedback indicates emotional variations. Focus on self-care, maintaining daily hygiene routines, and ensuring 7-8 hours of sleep.",
            "note": "Gemini API key is not currently configured. Using dynamic rule-based emotional evaluation."
        }
        return jsonify(mood_analysis)
        
    try:
        system_instruction = "You are a professional clinical psychologist companion identifying emotional stability and triggers. Give helpful safety guidance."
        prompt = f'Perform a mental health check-in analysis. Core Mood Level: {mood_value}/5. User Notes: "{note or "No note added"}". Factors checked: {json.dumps(factors or [])}. Highlight emotional insights.'
        
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "stabilityIndex": { 
                    "type": "INTEGER", 
                    "description": "An emotional stability and grounding percentage score from 0 to 100" 
                },
                "primaryStressors": { 
                    "type": "ARRAY", 
                    "items": {"type": "STRING"},
                    "description": "Top 2 causes or stressors linked to this mood state" 
                },
                "sentimentScore": { 
                    "type": "STRING", 
                    "description": "Overall sentiment summary (e.g. Balanced, High Distress, Grounded Contentment)" 
                },
                "advice": { 
                    "type": "STRING", 
                    "description": "A single, incredibly targeted 2-sentence encouraging piece of advice" 
                },
            },
            "required": ["stabilityIndex", "primaryStressors", "sentimentScore", "advice"]
        }
        
        raw_response = call_gemini_api(system_instruction, prompt, response_schema)
        parsed = json.loads(raw_response)
        return jsonify(parsed)
    except Exception as e:
        print("Mood assessment error:", str(e))
        return jsonify({"error": "Failed to perform AI analysis. Try again later."}), 500

@app.route("/api/therapy-chat", methods=["POST"])
def therapy_chat():
    data = request.json or {}
    messages = data.get("messages")
    if not messages or not isinstance(messages, list):
        return jsonify({"error": "Messages array is required."}), 400
        
    if fallbacks_enabled:
        last_user_msg = messages[-1].get("text", "") if messages else ""
        reply = "I am listening closely. Tell me more about what is going on. How has that been affecting your focus and sleep?"
        if any(word in last_user_msg.lower() for word in ["sad", "down", "depress"]):
            reply = "I'm really sorry you're carrying such heavy feelings today. When we feel overwhelmed, our minds can paint everything in gray. Let's take a small step together: what is one little thing you can do for yourself in the next hour to feel safe?"
        elif any(word in last_user_msg.lower() for word in ["anxious", "scared", "worry"]):
            reply = "Anxiety can feel like an alarm bell that won't turn off. Let's practice box breathing right now: inhale for 4 seconds, hold for 4, exhale for 4, and hold for 4. Feel your feet on the floor. I'm here for you."
        elif any(word in last_user_msg.lower() for word in ["happy", "good", "glad"]):
            reply = "That is truly wonderful to hear! Let's pause and appreciate this moment of warm clarity. What do you think contributed most directly to this positive experience?"
        return jsonify({"text": reply, "isFallback": True})
        
    try:
        formatted_history = []
        for msg in messages:
            sender = "Client" if msg.get("sender") == "user" else "CBT Companion"
            formatted_history.append(f"{sender}: {msg.get('text', '')}")
            
        prompt = "\n".join(formatted_history) + "\nCBT Companion:"
        system_instruction = "You are 'Serene Clarity', MindCare's AI Companion and Cognitive Behavioral Therapist. You write in a soft, gentle, articulate, and immensely respectful tone. Support the client under distress, guide them in externalizing doubts, and suggest clinical coping techniques without ever pretending to replace an emergency response line. Limit your answers to 3-4 gentle sentences maximum."
        
        reply_text = call_gemini_api(system_instruction, prompt)
        return jsonify({"text": reply_text})
    except Exception as e:
        print("Therapy chat error:", str(e))
        return jsonify({"error": "Could not fetch AI advice."}), 500

# --- Serve Static Vite App ---

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_static(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    print(f"[MindCare Flask Server] Running on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
