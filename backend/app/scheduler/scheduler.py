from apscheduler.schedulers.asyncio import AsyncIOScheduler
print("OK")

from app.scheduler.jobs import fetch_and_store_data

scheduler = AsyncIOScheduler()


def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            fetch_and_store_data,
            "interval",
            minutes=15,
            id="fetch_job",
            replace_existing=True,
        )
        scheduler.start()

    print("Scheduler Started")