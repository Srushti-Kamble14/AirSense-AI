# AirSenseAI Backend

FastAPI backend foundation for the AirSenseAI smart city air quality platform. This setup includes application configuration, CORS, environment loading, SQLAlchemy database connectivity, reusable sessions, logging, and a sample health check endpoint.

## Create a Virtual Environment

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Configure Environment Variables

Create a local `.env` file from `.env.example` and fill in the required values:

```bash
DATABASE_URL=
OPENAQ_API_KEY=
OPENWEATHER_API_KEY=
SECRET_KEY=
```

## Run the Backend

```bash
uvicorn app.main:app --reload
```

## Health Check

Open this endpoint after the server starts:

```text
GET http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "success",
  "message": "AirSenseAI Backend Running"
}
```

## Swagger Docs

FastAPI automatically exposes interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```
