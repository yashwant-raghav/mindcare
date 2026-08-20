import sqlite3
import json
import os
import shutil
from werkzeug.security import generate_password_hash, check_password_hash

# Determine DB path depending on environment (Vercel serverless has a read-only filesystem except for /tmp)
IS_VERCEL = os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV")

if IS_VERCEL:
    DB_PATH = "/tmp/mindcare.db"
    base_db = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mindcare.db")
    if not os.path.exists(DB_PATH) and os.path.exists(base_db):
        try:
            shutil.copy(base_db, DB_PATH)
        except Exception as e:
            print(f"Failed to copy base database: {e}")
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mindcare.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT NOT NULL,
        bio TEXT NOT NULL,
        streak INTEGER DEFAULT 1,
        total_minutes INTEGER DEFAULT 0,
        joined_date TEXT NOT NULL,
        is_pro INTEGER DEFAULT 0
    );
    """)
    
    # 2. Create mood_entries table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mood_entries (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        date TEXT NOT NULL,
        value INTEGER NOT NULL,
        name TEXT NOT NULL,
        note TEXT,
        factors TEXT NOT NULL, -- JSON list of strings
        timestamp TEXT NOT NULL,
        stability_index INTEGER,
        primary_stressors TEXT, -- JSON list of strings
        sentiment_score TEXT,
        advice TEXT,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
    );
    """)
    
    # 3. Create journal_entries table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        mood_value INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        emotional_tone TEXT,
        underlying_themes TEXT, -- JSON list of strings
        coping_strategies TEXT, -- JSON list of strings
        psychological_insight TEXT,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
    );
    """)

    # 4. Create emotion_sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emotion_sessions (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        session_date TEXT NOT NULL,
        duration INTEGER NOT NULL,
        dominant_emotion TEXT NOT NULL,
        happy_percentage REAL NOT NULL,
        sad_percentage REAL NOT NULL,
        neutral_percentage REAL NOT NULL,
        angry_percentage REAL NOT NULL,
        surprise_percentage REAL NOT NULL,
        average_confidence REAL NOT NULL,
        expression_stability REAL NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    conn.close()

# Helper to serialize user
def serialize_user(row):
    if not row:
        return None
    return {
        "email": row["email"],
        "name": row["name"],
        "avatar": row["avatar"],
        "bio": row["bio"],
        "streak": row["streak"],
        "totalMinutes": row["total_minutes"],
        "joinedDate": row["joined_date"],
        "isPro": bool(row["is_pro"])
    }

# Helper to serialize mood entry
def serialize_mood(row):
    if not row:
        return None
    factors = []
    try:
        factors = json.loads(row["factors"])
    except:
        factors = []
        
    primary_stressors = []
    try:
        if row["primary_stressors"]:
            primary_stressors = json.loads(row["primary_stressors"])
    except:
        pass
        
    analysis = None
    if row["stability_index"] is not None:
        analysis = {
            "stabilityIndex": row["stability_index"],
            "primaryStressors": primary_stressors,
            "sentimentScore": row["sentiment_score"],
            "advice": row["advice"]
        }
        
    return {
        "id": row["id"],
        "date": row["date"],
        "value": row["value"],
        "name": row["name"],
        "note": row["note"] or "",
        "factors": factors,
        "timestamp": row["timestamp"],
        "analysis": analysis
    }

# Helper to serialize journal entry
def serialize_journal(row):
    if not row:
        return None
    
    underlying_themes = []
    try:
        if row["underlying_themes"]:
            underlying_themes = json.loads(row["underlying_themes"])
    except:
        pass
        
    coping_strategies = []
    try:
        if row["coping_strategies"]:
            coping_strategies = json.loads(row["coping_strategies"])
    except:
        pass
        
    analysis = None
    if row["emotional_tone"] is not None:
        analysis = {
            "emotionalTone": row["emotional_tone"],
            "underlyingThemes": underlying_themes,
            "copingStrategies": coping_strategies,
            "psychologicalInsight": row["psychological_insight"]
        }
        
    return {
        "id": row["id"],
        "date": row["date"],
        "title": row["title"],
        "content": row["content"],
        "moodValue": row["mood_value"],
        "timestamp": row["timestamp"],
        "analysis": analysis
    }

# --- Database API CRUD Functions ---

def create_user(email, name, password, avatar=None, bio=None, is_pro=False):
    email_clean = email.strip().lower()
    hashed_password = generate_password_hash(password)
    
    # Default placeholder values matching frontend demo configuration
    default_avatar = avatar or "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"
    default_bio = bio or "Mindfulness and slow walks enthusiast."
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, name, password_hash, avatar, bio, streak, total_minutes, joined_date, is_pro) VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)",
            (email_clean, name, hashed_password, default_avatar, default_bio, "June 2026", 1 if is_pro else 0)
        )
        conn.commit()
        # Retrieve created user
        cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
        user_row = cursor.fetchone()
        return serialize_user(user_row)
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def authenticate_user(email, password):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
    row = cursor.fetchone()
    conn.close()
    
    if row and check_password_hash(row["password_hash"], password):
        return serialize_user(row)
    return None

def get_user(email):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
    row = cursor.fetchone()
    conn.close()
    return serialize_user(row)

def update_user(email, name, avatar, bio, streak, total_minutes, is_pro):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET name = ?, avatar = ?, bio = ?, streak = ?, total_minutes = ?, is_pro = ? WHERE email = ?",
        (name, avatar, bio, streak, total_minutes, 1 if is_pro else 0, email_clean)
    )
    conn.commit()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
    row = cursor.fetchone()
    conn.close()
    return serialize_user(row)

def reset_user_progress(email):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Delete entries
        cursor.execute("DELETE FROM mood_entries WHERE user_email = ?", (email_clean,))
        cursor.execute("DELETE FROM journal_entries WHERE user_email = ?", (email_clean,))
        # Reset stats
        cursor.execute("UPDATE users SET streak = 1, total_minutes = 0 WHERE email = ?", (email_clean,))
        conn.commit()
        return True
    except:
        return False
    finally:
        conn.close()

# Mood Entries CRUD
def get_moods(email):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mood_entries WHERE user_email = ? ORDER BY timestamp DESC, id DESC", (email_clean,))
    rows = cursor.fetchall()
    conn.close()
    return [serialize_mood(r) for r in rows]

def add_mood(email, mood_id, date, value, name, note, factors, timestamp, analysis=None):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    stability_index = None
    primary_stressors_json = None
    sentiment_score = None
    advice = None
    
    if analysis:
        stability_index = analysis.get("stabilityIndex")
        primary_stressors_json = json.dumps(analysis.get("primaryStressors", []))
        sentiment_score = analysis.get("sentimentScore")
        advice = analysis.get("advice")
        
    factors_json = json.dumps(factors)
    
    cursor.execute(
        "INSERT INTO mood_entries (id, user_email, date, value, name, note, factors, timestamp, stability_index, primary_stressors, sentiment_score, advice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (mood_id, email_clean, date, value, name, note, factors_json, timestamp, stability_index, primary_stressors_json, sentiment_score, advice)
    )
    conn.commit()
    conn.close()
    return True

# Journal Entries CRUD
def get_journals(email):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM journal_entries WHERE user_email = ? ORDER BY timestamp DESC, id DESC", (email_clean,))
    rows = cursor.fetchall()
    conn.close()
    return [serialize_journal(r) for r in rows]

def add_journal(email, journal_id, date, title, content, mood_value, timestamp, analysis=None):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    emotional_tone = None
    underlying_themes_json = None
    coping_strategies_json = None
    psychological_insight = None
    
    if analysis:
        emotional_tone = analysis.get("emotionalTone")
        underlying_themes_json = json.dumps(analysis.get("underlyingThemes", []))
        coping_strategies_json = json.dumps(analysis.get("copingStrategies", []))
        psychological_insight = analysis.get("psychologicalInsight")
        
    cursor.execute(
        "INSERT INTO journal_entries (id, user_email, date, title, content, mood_value, timestamp, emotional_tone, underlying_themes, coping_strategies, psychological_insight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (journal_id, email_clean, date, title, content, mood_value, timestamp, emotional_tone, underlying_themes_json, coping_strategies_json, psychological_insight)
    )
    conn.commit()
    conn.close()
    return True

def delete_journal(email, journal_id):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM journal_entries WHERE user_email = ? AND id = ?", (email_clean, journal_id))
    conn.commit()
    conn.close()
    return True

# Helper to serialize emotion session
def serialize_emotion_session(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "userEmail": row["user_email"],
        "sessionDate": row["session_date"],
        "duration": row["duration"],
        "dominantEmotion": row["dominant_emotion"],
        "happyPercentage": row["happy_percentage"],
        "sadPercentage": row["sad_percentage"],
        "neutralPercentage": row["neutral_percentage"],
        "angryPercentage": row["angry_percentage"],
        "surprisePercentage": row["surprise_percentage"],
        "averageConfidence": row["average_confidence"],
        "expressionStability": row["expression_stability"],
        "timestamp": row["timestamp"]
    }

# Emotion Sessions CRUD
def get_emotion_sessions(email):
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emotion_sessions WHERE user_email = ? ORDER BY timestamp DESC, id DESC", (email_clean,))
    rows = cursor.fetchall()
    conn.close()
    return [serialize_emotion_session(r) for r in rows]

def add_emotion_session(email, session_data):
    import time
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    session_id = session_data.get("id", f"session_{int(time.time()*1000)}")
    session_date = session_data.get("sessionDate")
    duration = session_data.get("duration", 0)
    dominant_emotion = session_data.get("dominantEmotion", "Neutral")
    happy_percentage = session_data.get("happyPercentage", 0.0)
    sad_percentage = session_data.get("sadPercentage", 0.0)
    neutral_percentage = session_data.get("neutralPercentage", 0.0)
    angry_percentage = session_data.get("angryPercentage", 0.0)
    surprise_percentage = session_data.get("surprisePercentage", 0.0)
    average_confidence = session_data.get("averageConfidence", 0.0)
    expression_stability = session_data.get("expressionStability", 0.0)
    timestamp = session_data.get("timestamp")

    cursor.execute(
        """INSERT INTO emotion_sessions 
        (id, user_email, session_date, duration, dominant_emotion, happy_percentage, sad_percentage, neutral_percentage, angry_percentage, surprise_percentage, average_confidence, expression_stability, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (session_id, email_clean, session_date, duration, dominant_emotion, happy_percentage, sad_percentage, neutral_percentage, angry_percentage, surprise_percentage, average_confidence, expression_stability, timestamp)
    )
    conn.commit()
    conn.close()
    return True

# Run init DB if run directly
if __name__ == "__main__":
    init_db()
    print("SQLite database initialized successfully at:", DB_PATH)
