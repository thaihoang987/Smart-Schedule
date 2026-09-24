"""Ket noi WebSocket toi frontend (khac han ket noi toi HA o homeassistant.py).
Broadcast cac event: schedule_updated, schedule_deleted, schedule_executed,
scheduler_status (muc 57/31 SPEC.md)."""
import asyncio
import json
import logging

from fastapi import WebSocket

log = logging.getLogger("ha_smart_scheduler.ws")


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._connections.add(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(ws)

    async def broadcast(self, event: str, payload: dict) -> None:
        message = json.dumps({"event": event, "data": payload})
        dead = []
        async with self._lock:
            targets = list(self._connections)
        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._connections.discard(ws)


manager = ConnectionManager()
