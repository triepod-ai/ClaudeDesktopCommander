@echo off
echo Installing dependencies for enhanced code analyzer...
npm install --save @qdrant/js-client-rest node-fetch fs-extra crypto
npm install --save-dev @types/fs-extra @types/glob

echo Rebuilding the application...
npm run build

echo.
echo Enhanced code analyzer installation complete!
echo.
echo Prerequisites:
echo 1. Qdrant vector database must be running at http://127.0.0.1:6333
echo 2. Tensor LLM service must be running at http://localhost:8020
echo.
echo See CODE_ANALYZER_SETUP.md for detailed setup instructions.

pause
