FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml .
COPY README.md .
COPY quantfoot/ quantfoot/

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Back to app directory for dbt commands
WORKDIR /app

# Create directories for Dagster
RUN mkdir -p /opt/dagster/dagster_home

# Set environment variables
ENV DAGSTER_HOME=/opt/dagster/dagster_home

# Expose Dagster webserver port
EXPOSE 3000

# Generate dbt manifest on startup
CMD ["sh", "-c", "cd /app/dbt_project && dbt deps --profiles-dir . && dbt parse --profiles-dir . && cd /app && dagster dev -h 0.0.0.0 -p 3000"]
