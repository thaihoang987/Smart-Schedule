from typing import Optional

from fastapi import APIRouter

from app import crud

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
async def list_history(limit: int = 200, schedule_id: Optional[str] = None):
    return crud.list_history(limit=limit, schedule_id=schedule_id)
