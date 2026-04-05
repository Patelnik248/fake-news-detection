# Dataset Setup

Download the Fake News dataset from Kaggle:
https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset

After downloading, place both CSV files in this folder:
  data/True.csv
  data/Fake.csv

Column structure expected:
  - title  : headline of the news article
  - text   : body of the news article
  - subject: topic category (optional)
  - date   : publication date (optional)

Quick download via Kaggle CLI:
  kaggle datasets download -d clmentbisaillon/fake-and-real-news-dataset
  unzip fake-and-real-news-dataset.zip -d data/
