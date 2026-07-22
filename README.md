# 🌍 AirSenseAI – AI-Powered Air Quality Prediction & Health Advisory Platform

AirSenseAI is an intelligent environmental monitoring platform that combines **real-time weather data, live air quality measurements, and Machine Learning** to predict future Air Quality Index (AQI) and provide personalized health recommendations.

Unlike traditional AQI dashboards that only display current pollution levels, AirSenseAI helps users **anticipate future air quality**, understand environmental conditions, and take preventive actions.

---

## 🚀 Live Demo

🌐 **Live Application:** https://air-sense-ai.vercel.app/

---

## 📽️ Demo Video

https://drive.google.com/drive/folders/18tMpmVVdhssCbzzd5inqZzshSMKX5k9n

---
# 🎯 Problem Statement

Traditional AQI platforms only display current pollution levels. AirSenseAI goes one step further by combining **Artificial Intelligence, real-time environmental monitoring, and predictive analytics** to forecast future AQI and generate meaningful health recommendations.

## ✨ Features

- 🔍 Search any city, locality, or landmark
- 🌤️ Live Weather Information
- 🌫️ Real-time Air Quality Monitoring
- 🤖 AI-based AQI Prediction using XGBoost
- ❤️ Personalized Health Advisory
- 🗺️ Interactive Map with Monitoring Stations
- 💬 AI Assistant for Environmental Insights
- ⚡ Fast REST APIs using FastAPI
- ☁️ Cloud Deployment with Railway & Vercel

---

# 🖥️ Screenshots
### Dashboard
<p align="center">
  <img src="https://github.com/user-attachments/assets/5495cab0-c7e0-4a90-b673-17f2a3c46927" width="90%" alt="Dashboard">
</p>

### Prediction
<p align="center">
  <img src="https://github.com/user-attachments/assets/58791043-2332-4099-be28-f72c4ab1b415" width="90%" alt="Prediction">
</p>

### Analytics
<p align="center">
  <img src="https://github.com/user-attachments/assets/5609efd3-c3de-443e-b2fe-8f9a1f1923bd" width="90%" alt="Analytics">
</p>

# 🏗️ System Architecture

```
                User
                  │
                  ▼
        Next.js Frontend
                  │
          REST API Requests
                  │
                  ▼
          FastAPI Backend
                  │
      ┌───────────┴───────────┐
      │                       │
      ▼                       ▼
 OpenWeather API         OpenAQ API
      │                       │
      └───────────┬───────────┘
                  │
          Data Preprocessing
                  │
                  ▼
          PostgreSQL Database
                  │
                  ▼
        XGBoost ML Prediction
                  │
                  ▼
        Health Advisory Engine
                  │
                  ▼
        Interactive Dashboard
```


# ⚙️ Tech Stack

## Frontend

- Next.js
- React.js
- Leaflet
- CSS

## Backend

- FastAPI
- Python
- SQLAlchemy
- APScheduler

## Machine Learning

- XGBoost
- Scikit-learn
- Pandas
- NumPy

## Database

- PostgreSQL

## APIs

- OpenWeatherMap API
- OpenAQ API

## Deployment

- Frontend → Vercel
- Backend → Railway

---

# 🤖 Machine Learning

AirSenseAI uses an **XGBoost Regression Model** to predict future AQI.
| Feature Importance | Actual vs Predicted AQI | Residual Plot |
|:------------------:|:-----------------------:|:-------------:|
| <img src="https://github.com/user-attachments/assets/f4ddb2a1-d149-45d1-bad9-34e5a5dfae81" alt="Feature Importance" width="100%"> | <img src="https://github.com/user-attachments/assets/c1961f59-cc7b-4ba1-8c70-8fc3ffe9e959" alt="Actual vs Predicted AQI" width="100%"> | <img src="https://github.com/user-attachments/assets/ddf408a7-20b1-4b17-b00b-067de7986e87" alt="Residual Plot" width="100%"> |

# 🛠️ Workflow

- Data Collection
- Data Cleaning
- Feature Engineering
- Model Training
- Model Evaluation
- AQI Prediction
- Health Recommendation
<img width="967" height="458" alt="image" src="https://github.com/user-attachments/assets/1455f580-ddf3-4510-ad0b-068605e54bcf" />

---

# 📊 Features Used

- PM2.5
- PM10
- CO
- NO₂
- SO₂
- O₃
- Temperature
- Humidity
- Pressure
- Wind Speed
- Visibility

---

# 📂 Project Structure

```
AIRSENSE-AI/
├── backend/
│   ├── app/
│   │   ├── __pycache__/
│   │   ├── config/
│   │   │   └── settings.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── crud/
│   │   │   └── crud_aqi.py
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── aqi.py
│   │   │   ├── location.py
│   │   │   ├── user.py
│   │   │   └── weather.py
│   │   ├── routes/
│   │   │   ├── advisory.py
│   │   │   ├── auth.py
│   │   │   ├── predict.py
│   │   │   └── weather.py
│   │   ├── scheduler/
│   │   │   └── jobs.py
│   │   ├── schemas/
│   │   │   ├── aqi.py
│   │   │   └── location.py
│   │   ├── services/
│   │   │   ├── openaq_service.py
│   │   │   └── openweather_service.py
│   │   ├── utils/
│   │   │   └── geocoding.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── ml/
│   │   ├── __pycache__/
│   │   ├── models/
│   │   │   └── model.pkl
│   │   ├── __init__.py
│   │   ├── .gitkeep
│   │   ├── evaluate.py
│   │   ├── predict.py
│   │   ├── preprocess.py
│   │   └── train_model.py
│   ├── tests/
│   │   └── .gitkeep
│   ├── venv/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   └── requirements.txt

│
└── frontend/
    ├── .next/
    ├── app/
    │   ├── api/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.jsx
    │   └── page.jsx
    ├── components/
    │   ├── ai/
    │   │   └── AIAssistant.jsx
    │   ├── boot/
    │   ├── cards/
    │   │   ├── CurrentAQICard.jsx
    │   │   ├── CurrentWeatherCard.jsx
    │   │   └── PredictionCard.jsx
    │   ├── charts/
    │   │   └── AQIChart.jsx
    │   ├── dashboard/
    │   │   └── DashboardLayout.jsx
    │   ├── effects/
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   ├── map/
    │   │   └── InteractiveMap.jsx
    │   ├── particles/
    │   ├── prediction/
    │   │   └── HealthAdvisory.jsx
    │   ├── quotes/
    │   ├── search/
    │   │   └── SuperSearch.jsx
    │   ├── sky/
    │   ├── ui/
    │   └── weather/
    ├── constants/
    ├── data/
    ├── hooks/
    ├── lib/
    │   └── utils.js
    ├── node_modules/
    ├── services/
    │   └── api.js
    ├── .env.local
    ├── .gitignore
    ├── jsconfig.json
    ├── next.config.mjs
    └── package-lock.json 
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/<username>/AirSenseAI.git

cd AirSenseAI
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Backend

```
DATABASE_URL=

OPENWEATHER_API_KEY=

OPENAQ_API_KEY=

SECRET_KEY=
```

Frontend

```
NEXT_PUBLIC_API_BASE_URL=
```

---

# 📌 Future Scope

- IoT Sensor Integration
- Mobile Application
- Push Notifications
- Satellite Data Integration
- Personalized Health Profiles
- Smart City Integration

---

# 📜 License

This project is developed for educational and hackathon purposes.

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub!
