"""Moi test dung 1 file SQLite rieng (SCHEDULER_DB_PATH) va HA gia lap -
khong can Home Assistant that. Chay: `pip install -r requirements.txt pytest`
roi `pytest` trong thu muc backend/."""
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture(autouse=True)
def fresh_db(tmp_path, monkeypatch):
    from app import db

    monkeypatch.setattr(db, "DB_PATH", str(tmp_path / "test.db"))
    conn = getattr(db._local, "conn", None)
    if conn is not None:
        conn.close()
        db._local.conn = None
    db.init_db()
    yield
    conn = getattr(db._local, "conn", None)
    if conn is not None:
        conn.close()
        db._local.conn = None


class FakeHA:
    def __init__(self):
        self.calls: list[tuple] = []
        self.states: list[dict] = []

    async def call_service(self, domain, service, entity_ids, data):
        self.calls.append((domain, service, list(entity_ids)))

    async def get_states(self):
        return self.states


@pytest.fixture
def fake_ha(monkeypatch):
    from app import homeassistant

    fake = FakeHA()
    monkeypatch.setattr(homeassistant, "call_service", fake.call_service)
    monkeypatch.setattr(homeassistant, "get_states", fake.get_states)
    return fake


@pytest.fixture(autouse=True)
def silent_ws(monkeypatch):
    from app.ws import manager

    async def broadcast(*_args, **_kwargs):
        return None

    monkeypatch.setattr(manager, "broadcast", broadcast)
