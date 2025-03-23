FROM python:3.10-slim

WORKDIR /app

# Copy the application code
COPY server.py .

# Install dependencies
RUN pip install fastapi uvicorn requests

# Expose the API port
EXPOSE 8020

# Run the server
CMD ["python", "server.py"]
