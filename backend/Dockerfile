FROM python:3.11-slim

WORKDIR /app

# Install dependencies required for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Command to run the application is specified in docker-compose.yml
# But we can also set a default
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
