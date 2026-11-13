import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]

ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE)


DATABASE_URL = os.getenv("DATABASE_URL")


if not DATABASE_URL:
    raise RuntimeError(
        f"DATABASE_URL environment variable is not configured. "
        f"Expected .env file at: {ENV_FILE}"
    )