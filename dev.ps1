Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot\ai'; .\.venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000 --host 0.0.0.0"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot\web'; npm run dev"
