from fastapi import APIRouter, HTTPException

from app import crud
from app.models import GroupIn, GroupOut, GroupReorder
from app.ws import manager

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.get("", response_model=list[GroupOut])
async def list_groups():
    return crud.list_groups()


@router.post("", response_model=GroupOut)
async def create_group(payload: GroupIn):
    created = crud.create_group(payload.name)
    await manager.broadcast("groups_updated", {})
    return created


@router.put("/{group_id}", response_model=GroupOut)
async def rename_group(group_id: str, payload: GroupIn):
    updated = crud.rename_group(group_id, payload.name)
    if not updated:
        raise HTTPException(404, "Group not found")
    await manager.broadcast("groups_updated", {})
    return updated


@router.delete("/{group_id}")
async def delete_group(group_id: str):
    if not crud.delete_group(group_id):
        raise HTTPException(404, "Group not found")
    await manager.broadcast("groups_updated", {})
    return {"ok": True}


@router.post("/reorder")
async def reorder(payload: GroupReorder):
    crud.reorder_groups(payload.ordered_ids)
    await manager.broadcast("groups_updated", {})
    return {"ok": True}
