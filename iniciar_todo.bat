@echo off
title EliteService CRM Launcher
echo ==========================================
echo   Iniciando Sistema EliteService CRM 🚀
echo ==========================================

echo.
echo [1/2] Arrancando Backend (Python/FastAPI)...
:: Abre una nueva ventana, activa el entorno virtual, entra a backend y corre el servidor
start "EliteService Backend" cmd /k "call .venv\Scripts\activate && cd backend && uvicorn main:app --reload"

echo [2/2] Arrancando Frontend (React)...
:: CAMBIO AQUI: Usamos 'npm run dev' en lugar de 'npm start'
start "EliteService Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo   ¡Listo! Los servidores estan corriendo.
echo   No cierres las ventanas negras nuevas.
echo ==========================================
pause