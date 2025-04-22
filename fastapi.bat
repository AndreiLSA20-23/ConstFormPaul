@echo off
cd /d C:\openserver\Openserver\domains\constForm\my_backend
call venv\Scripts\activate.bat
cd app
uvicorn main:app --reload
pause