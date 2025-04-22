from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class UserData(BaseModel):
  ssn: str
  bday: str



def get_storage_paths(request: Request):
  return request.app.state.STORAGE_DIR, request.app.state.SSN_FILE

@router.get("/")
async def root():
  logger.info("Получен запрос на главную страницу API")
  return {"message": "API is working. Use /api/check-ssn, /api/create-or-update-json, /api/history/{ssn}, or /api/form-data/{component_name}/{ssn}."}

@router.post("/api/check-ssn")
async def check_ssn(data: UserData, request: Request):
  logger.info(f"Начало проверки SSN: {data.ssn}, дата рождения: {data.bday}")
  _, SSN_FILE = get_storage_paths(request)
  try:
    with open(SSN_FILE, "r") as f:
      ssn_data = json.load(f)
    logger.debug(f"Текущее содержимое файла SSN: {ssn_data}")
  except Exception as e:
    logger.error(f"Ошибка чтения файла {SSN_FILE}: {e}")
    raise HTTPException(status_code=500, detail="Ошибка чтения файла данных.")

  if data.ssn in ssn_data:
    if ssn_data[data.ssn] != data.bday:
      logger.warning(f"Неверная дата рождения для SSN {data.ssn}. Ожидалось: {ssn_data[data.ssn]}, получено: {data.bday}")
      raise HTTPException(status_code=403, detail="Ошибка данных: Неверная дата рождения.")
    logger.info(f"SSN {data.ssn} найден, данные верны. (Повторная авторизация)")
    return {"message": "Доступ разрешён"}

  ssn_data[data.ssn] = data.bday
  try:
    with open(SSN_FILE, "w") as f:
      json.dump(ssn_data, f, indent=4)
    logger.info(f"Новый SSN {data.ssn} добавлен. Доступ разрешён.")
  except Exception as e:
    logger.error(f"Ошибка записи файла {SSN_FILE}: {e}")
    raise HTTPException(status_code=500, detail="Ошибка записи файла данных.")

  return {"message": "Новый SSN добавлен, доступ разрешён"}

# Здесь можно добавить остальные эндпоинты (create-or-update-json, get_history, get_form-data и т.д.)
# код будет аналогичен тому, что у вас уже написан, с поправкой путей через get_storage_paths.
