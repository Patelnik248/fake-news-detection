#!/bin/bash
# =============================================================
# test_api.sh — Quick API smoke test using curl
# Usage: bash scripts/test_api.sh
# Make sure the API is running first: docker-compose up -d
# =============================================================

BASE_URL="${API_URL:-http://localhost}"

echo "=== Fake News API — Smoke Test ==="
echo "Target: $BASE_URL"
echo ""

# Health check
echo "[1] Health Check..."
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""

# Real news prediction
echo "[2] Real News Prediction..."
curl -s -X POST "$BASE_URL/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "The Federal Reserve raised interest rates by 25 basis points on Wednesday, citing continued progress in bringing inflation toward its 2% target, while signaling caution about future hikes."}' \
  | python3 -m json.tool
echo ""

# Fake news prediction
echo "[3] Fake News Prediction..."
curl -s -X POST "$BASE_URL/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "Breaking: Secret underground base discovered on the moon. Anonymous government whistleblower reveals aliens have been living there since 1969 and controlling world governments through 5G towers."}' \
  | python3 -m json.tool
echo ""

# Missing field error
echo "[4] Error Handling — Missing text field..."
curl -s -X POST "$BASE_URL/predict" \
  -H "Content-Type: application/json" \
  -d '{"wrong_key": "oops"}' \
  | python3 -m json.tool
echo ""

echo "=== Tests complete ==="
