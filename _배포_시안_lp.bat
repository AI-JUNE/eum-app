@echo off
chcp 65001 >nul
cd /d "C:\Users\sukju\OneDrive\Desktop\Dev\1. 이음\1. 소스\eum-app-live"
echo ===============================================
echo   이음 랜딩 시안(/lp) 배포
echo ===============================================
echo.

rem 남은 잠금 파일 제거(있으면)
if exist ".git\index.lock" del /f /q ".git\index.lock"

echo [1/4] 변경 추가...
git add public/lp

echo [2/4] 커밋...
git commit -m "docs: 이음 랜딩 시안 프리뷰 (/lp)" 2>nul
if errorlevel 1 echo   (커밋할 새 변경 없음 - 계속 진행)

echo [3/4] 원격 동기화(rebase)...
git pull --rebase origin main
if errorlevel 1 (
  echo.
  echo   [!] 원격 동기화 실패 - 충돌일 수 있습니다. 메시지를 코워크에 붙여주세요.
  pause
  exit /b 1
)

echo [4/4] 배포(push)...
git push origin main
if errorlevel 1 (
  echo.
  echo   [!] push 실패 - GitHub 로그인 창이 뜨면 로그인 후 다시 실행하세요.
  pause
  exit /b 1
)

echo.
echo ===============================================
echo   배포 요청 완료!  1~2분 뒤 아래 주소 확인:
echo   https://eum-app.vercel.app/lp/
echo ===============================================
pause
