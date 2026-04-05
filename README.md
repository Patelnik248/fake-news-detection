# Fake News Detection — MLOps Project

A production-ready machine learning system that classifies news articles as **Real** or **Fake**, deployed with a full MLOps pipeline including CI/CD, monitoring, and experiment tracking.

---

## Team Responsibilities

| Member | Area | Files |
|--------|------|-------|
| Member 1 | Data preprocessing + model training + MLflow | `src/preprocess.py`, `src/model.py`, `src/train.py`, `mlflow/mlflow_setup.py` |
| Member 2 | Flask API + model integration + logging | `app/app.py` |
| Member 3 | Docker + NGINX + system architecture | `Dockerfile`, `docker-compose.yml`, `nginx/nginx.conf` |
| Member 4 | Jenkins CI/CD + Prometheus + Grafana | `Jenkinsfile`, `monitoring/prometheus.yml`, `monitoring/grafana/` |

---

## Project Structure

```
fake-news-detection/
├── data/
│   ├── True.csv              ← Download from Kaggle
│   ├── Fake.csv              ← Download from Kaggle
│   └── README.md             ← Download instructions
├── src/
│   ├── preprocess.py         ← Data loading and cleaning
│   ├── model.py              ← TF-IDF + Logistic Regression pipeline
│   └── train.py              ← Training + MLflow tracking
├── app/
│   └── app.py                ← Flask REST API (served by Waitress)
├── mlflow/
│   └── mlflow_setup.py       ← MLflow utilities and run comparison
├── monitoring/
│   ├── prometheus.yml        ← Prometheus scrape config
│   └── grafana/
│       ├── datasource.yml    ← Auto-provision Prometheus data source
│       ├── dashboard.json    ← Pre-built Grafana dashboard
│       └── dashboards/
│           └── provider.yml  ← Dashboard auto-load config
├── nginx/
│   └── nginx.conf            ← Reverse proxy config
├── tests/
│   └── test_api.py           ← pytest API tests
├── scripts/
│   ├── train_local.sh        ← Train locally (no Docker)
│   └── test_api.sh           ← curl smoke tests
├── models/                   ← Saved model output (auto-created)
├── logs/                     ← App logs (auto-created)
├── Dockerfile                ← Flask API container
├── docker-compose.yml        ← All 6 services
├── Jenkinsfile               ← CI/CD pipeline definition
├── requirements.txt          ← Python dependencies
└── .gitignore
```

---

## Quickstart

### Step 1 — Get the dataset

Download `True.csv` and `Fake.csv` from Kaggle and place them in `data/`:

```
https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset
```

### Step 2 — Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 3 — Start all Docker services

```bash
docker-compose up -d --build
```

This starts 6 containers:

| Container | URL | Purpose |
|-----------|-----|---------|
| `nginx` | http://localhost | Reverse proxy (entry point) |
| `flask-api` | http://localhost:5001 | Prediction API |
| `mlflow` | http://localhost:5000 | Experiment tracking UI |
| `jenkins` | http://localhost:8080 | CI/CD server |
| `prometheus` | http://localhost:9090 | Metrics collection |
| `grafana` | http://localhost:3000 | Dashboards (admin/admin123) |

### Step 4 — Train the model

```bash
# Inside Docker (recommended)
docker exec flask-api python src/train.py

# Or locally
bash scripts/train_local.sh
```

### Step 5 — Make predictions

**Using curl:**
```bash
curl -X POST http://localhost/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Your news article text goes here..."}'
```

**Expected response:**
```json
{
  "label": "Real",
  "confidence": 0.9421,
  "is_fake": false
}
```

**Using the smoke test script:**
```bash
bash scripts/test_api.sh
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Service info |
| `GET` | `/health` | Health check — returns `{"status":"ok"}` |
| `POST` | `/predict` | Classify a news article |
| `GET` | `/metrics` | Prometheus metrics scrape endpoint |

### POST /predict — Request body

```json
{ "text": "Full article text here (minimum 10 characters)" }
```

### POST /predict — Response

```json
{
  "label": "Real",        // or "Fake"
  "confidence": 0.94,     // probability of the predicted class
  "is_fake": false        // boolean convenience field
}
```

---

## ML Pipeline

```
True.csv + Fake.csv
       ↓
  load_data()           — concat + label (1=Real, 0=Fake)
       ↓
  clean_text()          — lowercase, remove URLs/HTML/punctuation
       ↓
  train_test_split()    — 80% train / 20% test
       ↓
  TfidfVectorizer       — top 50k features, unigrams + bigrams
       ↓
  LogisticRegression    — binary classifier
       ↓
  evaluate()            — accuracy, precision, recall, F1
       ↓
  MLflow.log_*()        — track params, metrics, model artifact
       ↓
  save_model()          — pickle to models/fake_news_model.pkl
```

---

## MLflow — Experiment Tracking

Open the MLflow UI at **http://localhost:5000**

- View all training runs
- Compare metrics (accuracy, F1, precision, recall)
- Download saved model artifacts
- Register models in the model registry

**From code:**
```bash
python mlflow/mlflow_setup.py    # list all runs
```

---

## Monitoring

### Prometheus — http://localhost:9090

Metrics collected from the Flask API:

| Metric | Type | Description |
|--------|------|-------------|
| `api_request_count_total` | Counter | Requests by endpoint + status code |
| `api_request_latency_seconds` | Histogram | Response time (p50, p95, p99) |
| `api_prediction_count_total` | Counter | Predictions split by real/fake |

### Grafana — http://localhost:3000

Login: `admin` / `admin123`

The dashboard auto-loads and shows:
- API request rate over time
- p50/p95 latency
- Prediction volume (real vs fake)
- Error rate (5xx responses)

---

## Jenkins CI/CD — http://localhost:8080

### First-time setup
1. Open Jenkins at http://localhost:8080
2. Get the initial admin password:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Install suggested plugins
4. Create a new **Pipeline** job pointing to your GitHub repo
5. Jenkins uses `Jenkinsfile` from the root of the repo

### Pipeline stages

```
Checkout → Test → Train Model (if changed) → Build Image → Deploy → Health Check
```

---

## Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=app --cov=src
```

---

## Postman Collection

Import this into Postman for quick testing:

**Health Check**
- `GET http://localhost/health`

**Predict — Real news**
- `POST http://localhost/predict`
- Body (JSON): `{"text": "The stock market rose sharply on Friday following better-than-expected jobs data from the Labor Department."}`

**Predict — Fake news**
- `POST http://localhost/predict`  
- Body (JSON): `{"text": "NASA confirms flat earth theory after secret documents leaked by anonymous whistleblower reveal decades-long cover-up."}`

---

## Stopping All Services

```bash
docker-compose down          # stop containers
docker-compose down -v       # stop + remove volumes (full reset)
```
