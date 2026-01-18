# Stage 1: Build React Frontend
FROM node:20-alpine as build-frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# Since we flattened the structure, source files are in `src`
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install uvicorn

# Copy backend code
COPY app ./app

# Copy built frontend assets from Stage 1
COPY --from=build-frontend /app/dist ./dist

# Variables
ENV PORT=8080

# Run command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
