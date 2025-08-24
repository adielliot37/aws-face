from fastapi import APIRouter, Depends, HTTPException, Header, Response
from ..db.mongo import db
from ..core.jwt import decode_jwt, maybe_issue_rolling_token

router = APIRouter()

def get_current_phone(
    response: Response,
    authorization: str | None = Header(default=None),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split()[1]
    try:
        payload = decode_jwt(token)
        sub = payload["sub"]
        # Rolling token: if due, mint and return via header
        new_token = maybe_issue_rolling_token(sub, payload)
        if new_token:
            response.headers["X-New-Access-Token"] = new_token
        return sub
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/me")
async def me(phone: str = Depends(get_current_phone)):
    user = await db().users.find_one({"phone": phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user