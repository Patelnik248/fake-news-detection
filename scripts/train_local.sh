#!/bin/bash
# =============================================================
# train_local.sh — Run training pipeline locally (no Docker)
# Usage: bash scripts/train_local.sh
# =============================================================

set -e   # exit on any error

echo "=== Fake News Detection — Local Training ==="

# 1. Install dependencies
echo "[1/3] Installing Python dependencies..."
pip install -q -r requirements.txt

# 2. Verify dataset files exist
if [ ! -f "data/True.csv" ] || [ ! -f "data/Fake.csv" ]; then
    echo "[ERROR] data/True.csv or data/Fake.csv not found."
    echo "        Download from: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset"
    exit 1
fi

# 3. Train the model
echo "[2/3] Starting model training..."
MLFLOW_TRACKING_URI=http://localhost:5000 python src/train.py

echo "[3/3] Training complete! Model saved to models/fake_news_model.pkl"
