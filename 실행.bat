@echo off
echo ==========================================
echo  website& server start at the same time
echo ==========================================

:: 1. 프론트엔드 실행 (새 창에서 실행)
:: /d 옵션은 혹시 모를 드라이브 변경 대응, cmd /k는 실행 후 창 유지
start "Frontend Server" cmd /k "cd /d %~dp0front && npm install && npm run dev"

:: 2. 백엔드 실행 (새 창에서 실행)
start "Backend Server" cmd /k "cd /d %~dp0bookserver && gradlew bootRun"

echo ==========================================
echo  complete!
echo ==========================================
pause