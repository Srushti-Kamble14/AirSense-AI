from app.database.database import get_engine
from sqlalchemy import text

try:
    engine = get_engine()

    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Database Connected Successfully!")

except Exception as e:
    print("Connection Failed")
    print(e)