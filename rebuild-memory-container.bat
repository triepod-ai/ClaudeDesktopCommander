@echo off
echo This script will rebuild the mcp/memory Docker container with module compatibility fixes
echo.
echo WARNING: Make sure Claude Desktop is closed before proceeding!
echo.
pause

echo [1/5] Stopping any running memory containers...
docker stop $(docker ps -q --filter ancestor=mcp/memory) 2>nul
echo Done.

echo.
echo [2/5] Removing the old image...
docker rmi mcp/memory 2>nul
echo Done.

echo.
echo [3/5] Building new container with module compatibility fixes...
docker build -f Dockerfile.memory -t mcp/memory .
echo Done.

echo.
echo [4/5] Testing the new container...
echo - Creating test volume for memory container
docker volume create claude-memory-test
echo - Starting test container
docker run -d -v claude-memory-test:/app/dist --name memory-test mcp/memory
timeout /t 2 > nul
echo - Verifying container is running
set IS_RUNNING=0
for /f %%i in ('docker ps -q --filter name=memory-test') do set IS_RUNNING=1

if %IS_RUNNING%==1 (
  echo - Test successful! Container is running properly.
  echo - Stopping test container
  docker stop memory-test > nul
  docker rm memory-test > nul
) else (
  echo - Test failed! Container is not running.
  echo - Check Docker logs for errors
)

echo.
echo [5/5] Verifying rebuild...
docker images | findstr memory
echo.
echo Rebuild complete! The mcp/memory container has been updated with module compatibility fixes.
echo You can now restart Claude Desktop to use the updated container.
echo.
pause
