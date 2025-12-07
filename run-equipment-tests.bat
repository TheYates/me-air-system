@echo off
echo ================================================
echo Equipment Add Methods - Playwright E2E Tests
echo ================================================
echo.

REM Check if Playwright is installed
echo [1/3] Checking Playwright installation...
bunx playwright --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Playwright not found!
    echo Please run: bunx playwright install chromium
    pause
    exit /b 1
)
echo ✓ Playwright is installed
echo.

REM Check if dev server is running
echo [2/3] Checking if dev server is running...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ERROR: Dev server is not running!
    echo Please start it in another terminal: bun run dev
    pause
    exit /b 1
)
echo ✓ Dev server is running on http://localhost:3000
echo.

REM Run tests
echo [3/3] Running Equipment Add Tests...
echo.
bunx playwright test tests/e2e/equipment-add-methods.spec.ts --reporter=list

echo.
echo ================================================
echo Tests completed!
echo To view detailed report: bunx playwright show-report
echo ================================================
pause
