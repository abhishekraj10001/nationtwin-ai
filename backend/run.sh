#!/bin/bash
# Start FastAPI backend with virtual environment setup using uv

set -e

# Navigate to script directory
cd "$(dirname "$0")"

echo "Initializing NationTwin AI Backend Environment..."

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment using uv..."
    uv venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing Python requirements..."
uv pip install -r requirements.txt

echo "Starting Uvicorn server on http://localhost:8000..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
