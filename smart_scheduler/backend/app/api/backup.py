from fastapi import APIRouter

from app import crud

router = APIRouter(prefix="/api/backup", tags=["backup"])


@router.get("/export")
async def export_backup():
    return crud.export_all()


@router.post("/import")
async def import_backup(payload: dict):
    crud.import_all(payload)
    return {"ok": True}
