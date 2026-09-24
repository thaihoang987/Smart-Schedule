"""Gia lap co nguoi o nha (che do di vang, v0.5.32) - trong khung gio cai
dat, bat LAN LUOT ngau nhien tung thiet bi da chon, moi lan sang trong 1
khoang ngau nhien [on_min, on_max] phut, nghi ngau nhien [gap_min, gap_max]
phut roi toi thiet bi khac - nhin tu ngoai vao giong co nguoi di lai trong
nha. KHONG phai Schedule: cau hinh luu 1 ban duy nhat trong bang settings
(key "presence"), trang thai dang chay (thiet bi nao dang bat toi luc nao)
luu key "presence_runtime" de sau khi Add-on restart van tat dung thiet bi
do bat. Khong bi anh huong boi "Tam dung tat ca lich" (2 tinh nang thuong
dung CHUNG luc di vang).
"""
import asyncio
import logging
import random
from datetime import datetime, time as time_cls, timedelta

from app import crud, homeassistant
from app.config import DEFAULT_TIMEZONE
from app.ws import manager
from app.i18n import tr
from zoneinfo import ZoneInfo

log = logging.getLogger("ha_smart_scheduler.presence")

TICK_SECONDS = 5

DEFAULT_CONFIG: dict = {
    "enabled": False,
    "entity_ids": [],
    "days": [0, 1, 2, 3, 4, 5, 6],
    "start": "18:00",
    "end": "23:00",
    "on_min": 10,
    "on_max": 40,
    "gap_min": 2,
    "gap_max": 10,
    "max_concurrent": 1,
}

# entity_id -> thoi diem tu tat (aware datetime). Chi chua thiet bi DO
# TINH NANG NAY bat - khong bao gio tat thiet bi nguoi dung tu bat.
_on: dict[str, datetime] = {}
_next_start_at: datetime | None = None
_last_entity: str | None = None


def get_config() -> dict:
    stored = crud.get_settings().get("presence") or {}
    return {**DEFAULT_CONFIG, **stored}


def save_config(data: dict) -> dict:
    cfg = {**get_config(), **{k: v for k, v in data.items() if k in DEFAULT_CONFIG and v is not None}}
    cfg["on_min"], cfg["on_max"] = sorted((max(1, int(cfg["on_min"])), max(1, int(cfg["on_max"]))))
    cfg["gap_min"], cfg["gap_max"] = sorted((max(0, int(cfg["gap_min"])), max(0, int(cfg["gap_max"]))))
    cfg["max_concurrent"] = max(1, int(cfg["max_concurrent"]))
    crud.update_settings({"presence": cfg})
    return cfg


def _tz() -> ZoneInfo:
    return ZoneInfo(crud.get_settings().get("timezone") or DEFAULT_TIMEZONE)


def _parse_hm(value: str) -> time_cls:
    hour, minute = (int(x) for x in (value or "00:00").split(":")[:2])
    return time_cls(hour, minute)


def window_end(cfg: dict, now: datetime) -> datetime | None:
    """Moc ket thuc cua khung gio DANG dien ra (None neu ngoai khung). Ho
    tro khung qua dem (vd 20:00 -> 01:00): ngay trong tuan tinh theo ngay
    BAT DAU khung."""
    start_t, end_t = _parse_hm(cfg["start"]), _parse_hm(cfg["end"])
    days = set(cfg.get("days") or [])
    for day_offset in (0, -1):
        day = (now + timedelta(days=day_offset)).date()
        start = datetime.combine(day, start_t, now.tzinfo)
        end = datetime.combine(day, end_t, now.tzinfo)
        if end <= start:
            end += timedelta(days=1)
        if day.weekday() in days and start <= now < end:
            return end
    return None


def status() -> dict:
    return {
        "on": [{"entity_id": eid, "off_at": off.isoformat()} for eid, off in _on.items()],
        "next_start_at": _next_start_at.isoformat() if _next_start_at and not _on else None,
        "active": bool(_on) or _next_start_at is not None,
    }


def _persist() -> None:
    crud.update_settings({"presence_runtime": {eid: off.isoformat() for eid, off in _on.items()}})


def _gap(cfg: dict) -> timedelta:
    return timedelta(minutes=random.uniform(cfg["gap_min"], cfg["gap_max"]))


async def _turn(service: str, entity_id: str) -> bool:
    try:
        await homeassistant.call_service("homeassistant", service, [entity_id], {})
        return True
    except Exception as exc:  # noqa: BLE001 - 1 lan loi khong duoc lam chet vong lap
        log.warning("Gia lap co nguoi: %s %s that bai: %s", service, entity_id, exc)
        return False


async def tick(now: datetime | None = None) -> None:
    """1 buoc cua vong lap - tach rieng (nhan `now`) de test duoc."""
    global _next_start_at, _last_entity
    now = now or datetime.now(_tz())
    cfg = get_config()
    entity_ids = [e for e in cfg.get("entity_ids") or [] if e]
    end = window_end(cfg, now) if cfg.get("enabled") and entity_ids else None
    changed = False

    # 1. Tat thiet bi het luot (hoac tat het khi het khung/tat tinh nang).
    for eid, off_at in list(_on.items()):
        if end is None or now >= off_at or eid not in entity_ids:
            if await _turn("turn_off", eid):
                _on.pop(eid, None)
                changed = True
                if end is not None:
                    _next_start_at = now + _gap(cfg)

    if end is None:
        if _next_start_at is not None:
            _next_start_at = None
            changed = True
    else:
        if _next_start_at is None and not _on:
            # Vua vao khung: bat dau sau 1 khoang nghi ngau nhien, khong dung
            # dung phut dau khung (tranh lap lai giong het moi ngay).
            _next_start_at = now + _gap(cfg)
            changed = True
        limit = min(cfg["max_concurrent"], len(entity_ids))
        if len(_on) < limit and _next_start_at is not None and now >= _next_start_at:
            choices = [e for e in entity_ids if e not in _on]
            if len(choices) > 1 and _last_entity in choices:
                choices.remove(_last_entity)  # khong bat lai ngay thiet bi vua tat
            eid = random.choice(choices)
            minutes = random.uniform(cfg["on_min"], cfg["on_max"])
            off_at = min(now + timedelta(minutes=minutes), end)
            if await _turn("turn_on", eid):
                _on[eid] = off_at
                _last_entity = eid
                crud.add_history(None, tr("Giả lập có người", "Presence simulation"), None, "success",
                                 tr(f"Bật {eid} đến {off_at.strftime('%H:%M')}", f"Turned on {eid} until {off_at.strftime('%H:%M')}"), manual=True)
            # Luot tiep theo (chi co tac dung khi max_concurrent > 1; voi 1
            # thiet bi cung luc, luot moi duoc hen lai ngay khi thiet bi nay tat).
            _next_start_at = now + _gap(cfg)
            changed = True

    if changed:
        _persist()
        await manager.broadcast("presence_updated", status())


async def restore() -> None:
    """Sau restart: nap lai thiet bi dang do tinh nang nay bat (tick dau
    tien se tu tat neu da het luot/het khung)."""
    runtime = crud.get_settings().get("presence_runtime") or {}
    for eid, raw in runtime.items():
        try:
            _on[eid] = datetime.fromisoformat(raw)
        except (TypeError, ValueError):
            continue


async def presence_loop() -> None:
    await restore()
    while True:
        try:
            await tick()
        except Exception:  # noqa: BLE001
            log.exception("Loi trong vong lap gia lap co nguoi")
        await asyncio.sleep(TICK_SECONDS)
