
import os
import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

SYSTEM_INSTRUCTION = (
    "You are StudyBuddy, a friendly and helpful AI assistant. "
    "Explain concepts clearly and simply. Be polite, accurate, "
    "and concise. If you are unsure, say so."
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/chat", methods=["POST"])
def chat():

    if not GEMINI_API_KEY:
        return jsonify({
            "error": "Chatbot is not configured. Please add your Gemini API key."
        }), 503

    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])

    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "Please enter a message."}), 400

    contents = []

    for item in messages[-20:]:

        if not isinstance(item, dict):
            continue

        role = item.get("role")
        content = item.get("content")

        if role not in ("user", "model"):
            continue

        if not isinstance(content, str):
            continue

        content = content.strip()[:6000]

        if content:
            contents.append({
                "role": role,
                "parts": [{"text": content}]
            })

    if not contents or contents[-1]["role"] != "user":
        return jsonify({"error": "Please send a valid message."}), 400

    payload = {
        "systemInstruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }

    try:
        response = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=45
        )

        if response.status_code != 200:
            try:
                detail = response.json().get(
                    "error", {}
                ).get("message", "AI service request failed.")
            except ValueError:
                detail = "AI service request failed."

            return jsonify({"error": detail}), 502

        result = response.json()

        answer = (
            result.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
            .strip()
        )

        if not answer:
            return jsonify({
                "error": "The AI did not return a response."
            }), 502

        return jsonify({"reply": answer})

    except requests.Timeout:
        return jsonify({
            "error": "AI service took too long. Please try again."
        }), 504

    except requests.RequestException:
        return jsonify({
            "error": "Could not connect to the AI service."
        }), 502


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
