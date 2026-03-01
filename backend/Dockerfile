# ── Production Dockerfile ─────────────────────────────────────────────────
# Pin the exact image for reproducible builds
FROM python:3.11-slim-bookworm

# Sensible Python defaults
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# ── System dependencies ────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ────────────────────────────────────────────────────
# Copy requirements first so Docker caches this layer — only re-runs if
# requirements.txt changes, keeping rebuilds fast.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn

# ── Application code ───────────────────────────────────────────────────────
COPY . .

# ── Security: drop root privileges ────────────────────────────────────────
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# ── Port & health check ────────────────────────────────────────────────────
EXPOSE 8000

# Azure App Service / Docker probes use this to determine container readiness
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# ── Entrypoint ─────────────────────────────────────────────────────────────
# Gunicorn manages workers; uvicorn.workers.UvicornWorker handles async FastAPI.
# --workers 2 suits Azure B1 (1 vCPU). Scale up by rule: (2 * CPUs) + 1
CMD ["gunicorn", "main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--workers", "2", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
