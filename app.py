# Import required libraries
from flask import Flask, request, jsonify, render_template
from config import GROQ_API_KEY, MODEL, MAX_TOKENS
import requests
import json
import re

# Create the Flask app
app = Flask(__name__)

# API endpoint for Groq (LLM provider)
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def call_groq(system_prompt, user_prompt):
    """
    Sends a request to the Groq API and returns the generated AI response.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ]
    }

    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)

        print("STATUS:", response.status_code)
        print("RESPONSE:", response.text)  # 👈 ADD THIS

        response.raise_for_status()

        return response.json()["choices"][0]["message"]["content"]

    except requests.exceptions.HTTPError:
        print("🔥 FULL ERROR:", response.text)  # 👈 KEY LINE
        raise


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/plan", methods=["POST"])
def generate_plan():
    """
    Generates a 7-day meal plan as a structured JSON array.
    """
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON"}), 400

    age         = data.get("age", 25)
    weight      = data.get("weight", 70)
    height      = data.get("height", 170)
    sex         = data.get("sex", "male")
    activity    = data.get("activity", "moderate")
    diet        = data.get("diet", "balanced")
    cuisine     = data.get("cuisine", "any")
    goal        = data.get("goal", "maintain")
    target_cals = data.get("targetCals", 2000)
    protein     = data.get("protein", 150)
    carbs       = data.get("carbs", 200)
    fat         = data.get("fat", 65)

    system = (
        "You are a certified nutritionist. "
        "Always respond with valid JSON only — no markdown, no explanation, just the JSON array."
    )

    user = f"""Create a 5-day meal plan for:
- Age: {age}, Weight: {weight}kg, Height: {height}cm, Sex: {sex}
- Activity level: {activity}, Goal: {goal}
- Dietary preference: {diet}, Cuisine preference: {cuisine}
- Daily calories: {target_cals} kcal
- Macros: Protein {protein}g, Carbs {carbs}g, Fat {fat}g

Respond ONLY with a JSON array of 7 objects with this exact shape:
[
  {{
    "day": "Monday",
    "kcal": {target_cals},
    "meals": [
      {{"type": "Breakfast", "name": "Meal name", "kcal": 500, "protein": 30, "carbs": 60, "fat": 15}},
      {{"type": "Lunch",     "name": "Meal name", "kcal": 600, "protein": 40, "carbs": 70, "fat": 18}},
      {{"type": "Dinner",    "name": "Meal name", "kcal": 650, "protein": 45, "carbs": 75, "fat": 20}},
      {{"type": "Snack",     "name": "Meal name", "kcal": 250, "protein": 10, "carbs": 30, "fat": 8}}
    ]
  }}
]"""

    try:
        raw = call_groq(system, user)

        # Strip markdown fences if present
        clean = re.sub(r'```json|```', '', raw).strip()
        days = json.loads(clean)

        return jsonify({"success": True, "result": days})

    except json.JSONDecodeError:
        return jsonify({"success": False, "error": "AI returned invalid JSON. Please try again."}), 502

    except requests.exceptions.Timeout:
        return jsonify({"success": False, "error": "Request timed out. Please try again."}), 504

    except requests.exceptions.HTTPError as e:
        return jsonify({"success": False, "error": str(e)}), 502

    except Exception as e:
        return jsonify({"success": False, "error": "Something went wrong."}), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Chat endpoint — Nouri AI nutrition assistant.
    """
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON"}), 400

    message = data.get("message", "")
    if not message:
        return jsonify({"success": False, "error": "No message provided."}), 400

    system = (
        "You are Nouri, a friendly and knowledgeable AI nutritionist. "
        "Give concise, warm, actionable nutrition advice. "
        "Keep responses under 250 words unless a detailed breakdown is requested."
    )

    try:
        result = call_groq(system, message)
        return jsonify({"success": True, "result": result})

    except requests.exceptions.Timeout:
        return jsonify({"success": False, "error": "Request timed out. Please try again."}), 504

    except requests.exceptions.HTTPError as e:
        return jsonify({"success": False, "error": str(e)}), 502

    except Exception as e:
        return jsonify({"success": False, "error": "Something went wrong."}), 500


if __name__ == "__main__":
    app.run(debug=True)