from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import json
import logging
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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
SSN_FILE = os.path.join(BASE_DIR, "ssn_checker.json")

os.makedirs(STORAGE_DIR, exist_ok=True)

# Создаём ssn_checker.json, если его нет
if not os.path.exists(SSN_FILE):
    with open(SSN_FILE, "w") as f:
        json.dump({}, f, indent=4)
    logger.info(f"Создан файл {SSN_FILE}")


# Модель данных для запроса проверки SSN
class UserData(BaseModel):
    ssn: str  # Социальный номер
    bday: str  # Дата рождения


def deep_merge(source: dict, overrides: dict) -> dict:

    for key, value in overrides.items():
        if key in source and isinstance(source[key], dict) and isinstance(value, dict):
            source[key] = deep_merge(source[key], value)
        else:
            source[key] = value
    return source


def normalize_yesno_like_fields(data):

    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, str):
                lower_val = value.lower()
                if lower_val in ("yes", "no"):
                    # Проверяем, содержит ли ключ одно из ключевых слов
                    key_lower = key.lower()
                    if any(word in key_lower for word in [
                        "license", "endorsement", "confirmation",
                        "agreement", "authorization", "permission",
                        "approval", "consent", "verification"
                    ]):
                        data[key] = {"value": lower_val}
            else:
                data[key] = normalize_yesno_like_fields(value)
        return data
    elif isinstance(data, list):
        return [normalize_yesno_like_fields(item) for item in data]
    else:
        return data


def prune_no_fields(data):

    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            # Обрабатываем вложенные значения
            processed_value = prune_no_fields(value)

            # Сохраняем только непустые значения
            if processed_value is not None and processed_value != {} and processed_value != []:
                # Для yes/no полей
                if isinstance(processed_value, dict) and "value" in processed_value:
                    if processed_value["value"] == "no":
                        result[key] = processed_value
                    elif processed_value["value"] == "yes":
                        # Для "yes" оставляем только value, если вложенные данные пустые
                        if all(v in (None, {}, []) for k, v in processed_value.items() if k != "value"):
                            result[key] = {"value": "yes"}
                        else:
                            result[key] = prune_no_fields(processed_value)
                else:
                    result[key] = processed_value
        return result  # Убрали проверку if result else None - всегда возвращаем dict
    elif isinstance(data, list):
        result = [prune_no_fields(item) for item in data if prune_no_fields(item) is not None]
        return result if result else []
    else:
        return data if data is not None and data != "" else None


@app.get("/api/form-data/{component_name}/{ssn}")
async def get_form_data(component_name: str, ssn: str):
    """
    Возвращает данные для указанной компоненты (component_name) из additional_data для SSN.
    Поддерживает компоненты с типом list, dict и вложенными items.
    """
    file_path = os.path.join(STORAGE_DIR, f"{ssn}.json")
    logger.info(f"Запрос данных для компоненты '{component_name}' и SSN: {ssn}")

    if not os.path.exists(file_path):
        logger.warning(f"Файл для SSN {ssn} не найден")
        raise HTTPException(status_code=404, detail="Данные не найдены")

    try:
        with open(file_path, "r") as file:
            data = json.load(file)

        additional_data = data.get("additional_data", {}) or {}

        # Важно: НЕ подставляем {} по умолчанию, иначе массив превращается в dict
        component_data = additional_data.get(component_name)

        # Унифицированный ответ: верни как есть, если компонент существует
        return {
            "ssn": data.get("ssn"),
            "bday": data.get("bday"),
            "data": component_data if component_data is not None else {}
        }

    except Exception as e:
        logger.error(f"Ошибка при обработке файла {file_path}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():

    logger.info("Получен запрос на главную страницу API")
    return {
        "message": (
            "API is working. Используйте эндпоинты: "
            "/api/check-ssn, /api/create-or-update-json, /api/history, "
            "/api/history/{ssn}, /api/form-data/{component_name}/{ssn}."
        )
    }


@app.post("/api/check-ssn")
async def check_ssn(data: UserData):
   
    logger.info(f"Начало проверки SSN: {data.ssn}, дата рождения: {data.bday}")
    try:
        with open(SSN_FILE, "r") as f:
            ssn_data = json.load(f)
    except Exception as e:
        logger.error(f"Ошибка чтения файла {SSN_FILE}: {e}")
        raise HTTPException(status_code=500, detail="Ошибка чтения файла данных.")

    if data.ssn in ssn_data:
        if ssn_data[data.ssn] != data.bday:
            logger.warning(
                f"Неверная дата рождения для SSN {data.ssn}. "
                f"Ожидалось: {ssn_data[data.ssn]}, получено: {data.bday}"
            )
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


@app.post("/api/create-or-update-json")
async def create_or_update_json(data: dict):

    ssn = data.get("ssn")
    bday = data.get("bday")
    if not ssn or not bday:
        raise HTTPException(status_code=400, detail="Missing required fields: ssn and bday")

    file_path = os.path.join(STORAGE_DIR, f"{ssn}.json")

    # Собираем новые дополнительные данные
    new_additional = {}
    if "additional_data" in data and isinstance(data["additional_data"], dict):
        merged_data = deep_merge({}, data["additional_data"])
        merged_data = normalize_yesno_like_fields(merged_data)
        new_additional = deep_merge(new_additional, merged_data)

    for key, value in data.items():
        if key not in ("ssn", "bday", "additional_data"):
            new_additional[key] = value

    if os.path.exists(file_path):
        logger.info(f"Файл {file_path} существует. Начинается процесс обновления.")
        try:
            with open(file_path, "r") as file:
                existing_data = json.load(file)
        except Exception as e:
            logger.error(f"Ошибка чтения файла {file_path}: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка чтения файла: {e}")

        existing_additional = existing_data.get("additional_data", {})
        updated_additional = deep_merge(existing_additional, new_additional)
        # Применяем динамическую очистку
        updated_additional = prune_no_fields(updated_additional)

        updated_data = {
            "ssn": ssn,
            "bday": bday,
            "created": False,
            "additional_data": updated_additional
        }

        try:
            with open(file_path, "w") as file:
                json.dump(updated_data, file, indent=4)
            logger.info(f"Файл {file_path} успешно обновлен.")
            return {
                "message": "Файл успешно обновлен",
                "file_name": f"{ssn}.json",
                "data": updated_data
            }
        except Exception as e:
            logger.error(f"Ошибка записи файла {file_path}: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка записи файла: {e}")

    else:
        logger.info(f"Файл для SSN {ssn} не найден. Начинается создание нового файла.")
        new_additional = normalize_yesno_like_fields(new_additional)
        new_additional = prune_no_fields(new_additional)
        new_data = {
            "ssn": ssn,
            "bday": bday,
            "created": True,
            "additional_data": new_additional
        }
        try:
            with open(file_path, "w") as file:
                json.dump(new_data, file, indent=4)
            logger.info(f"Новый файл {file_path} успешно создан.")
            return {
                "message": "Файл успешно создан",
                "file_name": f"{ssn}.json",
                "data": new_data
            }
        except Exception as e:
            logger.error(f"Ошибка создания файла {file_path}: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка создания файла: {e}")

@app.get("/api/history/{ssn}")
async def get_history_by_ssn(ssn: str):

    file_path = os.path.join(STORAGE_DIR, f"{ssn}.json")
    logger.info(f"Запрос данных для SSN: {ssn}")
    if os.path.exists(file_path):
        try:
            with open(file_path, "r") as file:
                data = json.load(file)
            logger.info(f"Данные для SSN {ssn} успешно загружены")
            return {"file_name": f"{ssn}.json", "data": data}
        except Exception as e:
            logger.error(f"Ошибка чтения файла {file_path}: {e}")
            raise HTTPException(status_code=500, detail="Ошибка при чтении файла данных")
    else:
        logger.warning(f"Файл для SSN {ssn} не найден")
        raise HTTPException(status_code=404, detail="Данные не найдены")

if __name__ == "__main__":

    logger.info("Запуск приложения через uvicorn")
    uvicorn.run(app, host="0.0.0.0", port=8000)