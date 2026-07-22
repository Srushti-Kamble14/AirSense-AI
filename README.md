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

|----------|-----------|
| <img width="1911" height="902" alt="image" src="https://github.com/user-attachments/assets/5495cab0-c7e0-4a90-b673-17f2a3c46927" />
<img width="1901" height="897" alt="image" src="https://github.com/user-attachments/assets/58791043-2332-4099-be28-f72c4ab1b415" />
<img width="1911" height="906" alt="image" src="https://github.com/user-attachments/assets/5609efd3-c3de-443e-b2fe-8f9a1f1923bd" />


---

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

---

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

### Workflow

- Data Collection
- Data Cleaning
- Feature Engineering
- Model Training
- Model Evaluation
- AQI Prediction
- Health Recommendation

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
AirSenseAI
│
├── backend
│   ├── app
│   ├── ml
│   ├── models
│   ├── routes
│   ├── services
│   └── scheduler
│
├── frontend
│   ├── app
│   ├── components
│   ├── public
│   └── styles
│
└── README.md
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

# 🎯 Problem Statement

Traditional AQI platforms only display current pollution levels. AirSenseAI goes one step further by combining **Artificial Intelligence, real-time environmental monitoring, and predictive analytics** to forecast future AQI and generate meaningful health recommendations.

---

# 💡 Key Highlights

✅ AI-powered AQI Prediction

✅ Real-time Weather & Pollution Monitoring

✅ Interactive Map

✅ Health Advisory System

✅ XGBoost Machine Learning

✅ PostgreSQL Database

✅ FastAPI Backend

✅ Next.js Frontend

---

# 📜 License

This project is developed for educational and hackathon purposes.

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub!
