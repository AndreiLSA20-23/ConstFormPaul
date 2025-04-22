import os
import json
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Определяем базовый каталог приложения (например, текущий каталог файла app.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Папка storage теперь внутри каталога app
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
SSN_FILE = os.path.join(STORAGE_DIR, "ssn_checker.json")

os.makedirs(STORAGE_DIR, exist_ok=True)

if not os.path.exists(SSN_FILE):
  with open(SSN_FILE, "w") as f:
    json.dump({}, f, indent=4)
  logger.info(f"Создан файл {SSN_FILE}")

app.state.STORAGE_DIR = STORAGE_DIR
app.state.SSN_FILE = SSN_FILE

# Импортируем маршруты
from routes.routes import router

app.include_router(router)
