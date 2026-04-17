import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set. Add it to your .env file.")

# Groq model — llama3 is fast and free-tier friendly
MODEL = "llama-3.1-8b-instant"

# Max tokens per response
MAX_TOKENS = 3000