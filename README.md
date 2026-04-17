# 🧠 AI Meal Planner (Nouriva)

> An intelligent AI-powered nutrition assistant that generates personalized meal plans and provides real-time dietary guidance.

---

## 🚀 Features

✨ Generate personalized **5–7 day meal plans**
✨ Custom macros (Protein / Carbs / Fat)
✨ AI-powered nutrition chatbot ("Nouri")
✨ Clean JSON-based structured output
✨ Fast backend using Flask
✨ Powered by Groq LLM API

---

## 🏗️ Tech Stack

* **Backend:** Flask (Python)
* **AI Model:** Groq (LLaMA 3)
* **Frontend:** HTML, CSS, JavaScript
* **API:** REST

---

## 📂 Project Structure

```
.
├── main.py            # Flask backend
├── config.py          # API keys & settings (ignored)
├── templates/
│   └── index.html     # Frontend UI
├── static/            # CSS/JS assets
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repo

```bash
git clone https://github.com/your-username/ai-meal-planner.git
cd ai-meal-planner
```

### 2️⃣ Create virtual environment

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Add your API key

Create `config.py`:

```python
GROQ_API_KEY = "your_api_key_here"
MODEL = "llama3-8b-8192"
MAX_TOKENS = 2000
```

---

## ▶️ Run the App

```bash
python main.py
```

Open in browser:

```
http://127.0.0.1:5000
```

---

## 📡 API Endpoints

### 🔹 Generate Meal Plan

`POST /api/plan`

**Request:**

```json
{
  "age": 22,
  "weight": 70,
  "height": 170,
  "goal": "muscle gain"
}
```

**Response:**

```json
{
  "success": true,
  "result": [ ...meal plan... ]
}
```

---

### 🔹 Chat with AI

`POST /api/chat`

```json
{
  "message": "What should I eat after workout?"
}
```

---

## 🧠 How It Works

1. User inputs health + diet preferences
2. Backend constructs prompt
3. Groq LLM generates structured JSON
4. Response is cleaned & validated
5. UI displays meal plan

---

## ⚠️ Known Issues

* Large responses may get truncated (token limits)
* AI may sometimes return invalid JSON

---

## 🔧 Improvements (Future)

* Streaming responses
* Auto JSON correction
* User authentication
* Save meal plans
* Mobile app version

---

## 🤝 Contributing

Pull requests are welcome! Feel free to fork and improve.

---

## 📜 License

MIT License

---

## 💡 Author

Built with ❤️ by YOU

---

## ⭐ If you like this project

Give it a ⭐ on GitHub — it helps a lot!
