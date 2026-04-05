# Fake News Detection — MLOps Project

A fully automated, production-ready machine learning system that classifies news articles as **Real** or **Fake**. This project demonstrates a complete MLOps pipeline featuring CI/CD via Jenkins, experiment tracking via MLflow, and system monitoring via Prometheus and Grafana.

---

## Architecture Overview

The system is deployed using a **Docker-out-of-Docker (DooD)** architecture managed by Docker Compose. 

| Service | Technology | Purpose |
|---------|---------|---------|
| **API** | Flask + Waitress | Serves the ML model inferences on port 5001. |
| **Proxy** | NGINX | Reverse proxy directing traffic to the Flask API. |
| **Tracker** | MLflow | Logs model parameters, metrics, and manages artifacts. |
| **CI/CD** | Jenkins | Automates the pipeline: tests code, builds images, and deploys. |
| **Metrics** | Prometheus | Scrapes business and system metrics from the Flask API. |
| **Dashboard**| Grafana | Visualizes API latency, request volume, and traffic over time. |

---

## Project Structure

```text
fake-news-detection/
├── app/
│   ├── app.py                ← Flask REST API serving inferences
│   └── static/               ← Static HTML/CSS assets for UI
├── data/
│   ├── Fake.csv              ← Dataset (Requires manual download)
│   ├── True.csv              ← Dataset (Requires manual download)
│   └── README.md             ← Data instructions
├── mlflow/
│   └── mlflow_setup.py       ← MLflow utilities
├── models/
│   └── fake_news_model.pkl   ← Pre-trained ML model artifact
├── monitoring/
│   ├── Dockerfile            ← Custom Prometheus image configuration
│   ├── prometheus.yml        ← Scrape config
│   └── grafana/
│       ├── Dockerfile        ← Custom Grafana image configuration
│       ├── datasource.yml    ← Auto-provision Prometheus data source
│       └── dashboards/       ← Auto-loads JSON dashboards
├── nginx/
│   ├── Dockerfile            ← Custom NGINX image configuration
│   └── nginx.conf            ← Reverse proxy config
├── scripts/
│   ├── train_local.sh        ← Train locally script
│   └── test_api.sh           ← curl smoke tests script
├── src/
│   ├── preprocess.py         ← Text cleaning and feature engineering
│   ├── model.py              ← Logistic Regression + TF-IDF logic
│   └── train.py              ← Model training & evaluation 
├── tests/
│   └── test_api.py           ← Pytest suite for the Flask API
├── docker-compose.yml        ← Composes the 6-service ecosystem
├── Dockerfile                ← Builds the Flask API image
├── Dockerfile.jenkins        ← Builds Jenkins with Docker runtime access
└── Jenkinsfile               ← CI/CD pipeline definition
```

---

## Quickstart

### Step 1: Prepare the Dataset
Download `True.csv` and `Fake.csv` from Kaggle and place them in the `data/` directory:
[Fake and Real News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)

### Step 2: Spin Up the Stack
Ensure Docker is running and launch the entire stack:
```bash
docker-compose up -d --build
```

### Step 3: Access the Services
*   **Web Interface (Prediction):** `http://localhost`
*   **Jenkins (CI/CD):** `http://localhost:8080` (admin / 7e09ed458ae047cd95da059d46edaa52)
*   **Grafana (Monitoring):** `http://localhost:3000` (admin / admin123)
*   **MLflow (Experiment Tracking):** `http://localhost:5000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serves the Web Frontend (HTML UI) |
| `GET` | `/health` | Health check endpoint for Docker compose/Jenkins validation |
| `GET` | `/api/info` | General service schema info |
| `POST` | `/predict` | Receives JSON payload with news text and returns classification |
| `GET` | `/metrics` | Exposed endpoint for Prometheus tracking |

**Prediction Usage Example:**
```bash
curl -X POST http://localhost/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "The stock market rose sharply on Friday following better-than-expected jobs data."}'
```

---

## Machine Learning Pipeline

1. **Preprocessing:** Combines real and fake datasets, cleans text (removes URLs, punctuation, and extra whitespace), and lowers casing.
2. **Feature Extraction:** Uses `TfidfVectorizer` (top 50k features, unigrams+bigrams).
3. **Training:** Trains a `LogisticRegression` binary classifier.
4. **Tracking:** Logs accuracy, precision, recall, and F1 scores directly to the MLflow dashboard.
5. **Storage:** The model is serialized (`models/fake_news_model.pkl`) and committed to Git, enabling seamless containerization without localized volume sharing.

---

## CI/CD Pipeline (Jenkins)

The pipeline is fully automated and triggered directly from GitHub:
1. **Checkout:** Pulls the latest main branch from the remote repository.
2. **Test:** Spins up a lightweight python environment to run `pytest`. Mock ML inferences assure logic works cleanly without needing model dependencies.
3. **Train:** (Optional stage) Can execute `train.py` dynamically if data or internal logic signatures change.
4. **Build Docker Image:** Packages the latest Flask API backend securely with the finalized model.
5. **Deploy:** Leverages `docker compose` to gracefully swap the `flask-api` and `nginx` configurations without tearing the system down.
6. **Health Check:** Submits HTTP pings to assure Waitress successfully bonded to the port.

*(Note: Jenkins uses a DooD architecture, meaning `docker build` maps directly back to the host machine's resources).*
