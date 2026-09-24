from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app import presence
from app.ws import manager

router = APIRouter(prefix="/api/presence", tags=["presence"])


class PresenceIn(BaseModel):
    enabled: Optional[bool] = None
    entity_ids: Optional[list[str]] = None
    days: Optional[list[int]] = None
    start: Optional[str] = None  # "HH:MM"
    end: Optional[str] = None
    on_min: Optional[int] = None  # phut
    on_max: Optional[int] = None
    gap_min: Optional[int] = None
    gap_max: Optional[int] = None
    max_concurrent: Optional[int] = None


@router.get("")
async def get_presence():
    return {"config": presence.get_config(), "status": presence.status()}


@router.put("")
async def update_presence(payload: PresenceIn):
    cfg = presence.save_config(payload.model_dump())
    await presence.tick()  # ap dung ngay (vd vua tat -> tat thiet bi dang bat)
    await manager.broadcast("presence_updated", presence.status())
    return {"config": cfg, "status": presence.status()}
