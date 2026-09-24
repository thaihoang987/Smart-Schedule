"""Runtime language for backend-generated user-facing messages."""


def tr(vietnamese: str, english: str) -> str:
    from app import crud

    return vietnamese if crud.get_settings().get("language") == "vi" else english
