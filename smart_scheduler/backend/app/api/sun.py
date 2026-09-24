from fastapi import APIRouter

from app import crud, scheduler_engine
from app.config import DEFAULT_TIMEZONE

router = APIRouter(prefix="/api/sun", tags=["sun"])


@router.get("/today")
async def sun_today():
    """Gio moc troi HOM NAY tai vi tri HA - de ScheduleEditor xem truoc
    "~05:43" thay vi chi thay "Binh minh +0p" mo ho (muc 2026-09-23).
    Tra ve null neu chua lay duoc vi tri HA, khong crash."""
    tz_name = crud.get_settings().get("timezone") or DEFAULT_TIMEZONE
    return await scheduler_engine.get_today_sun_times(tz_name)
