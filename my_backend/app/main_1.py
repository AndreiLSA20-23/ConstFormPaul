from uvicorn import run
from my_backend.archivs.app import app
import logging

logger = logging.getLogger(__name__)
logger.info("Запуск приложения через uvicorn")

if __name__ == "__main__":
  run(app, host="0.0.0.0", port=8000)
