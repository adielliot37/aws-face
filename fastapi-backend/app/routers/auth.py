from fastapi import APIRouter, HTTPException, Depends
from ..schemas.models import OTPStartReq, OTPVerifyReq, TokenRes
from ..services import twilio_verify
from ..core.jwt import create_jwt
from ..db.mongo import db
from datetime import datetime

router = APIRouter()

@router.post("/start-otp")
async def start_otp(payload: OTPStartReq):
    # normalize phone to E.164 on frontend ideally; trust for now
    await twilio_verify.start_verify(payload.phone)
    return {"ok": True}

@router.post("/verify-otp", response_model=TokenRes)
async def verify_otp(payload: OTPVerifyReq):
    ok = await twilio_verify.check_verify(payload.phone, payload.code)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid code")
    # ensure user doc exists
    database = db()
    existing = await database.users.find_one({"phone": payload.phone})
    if not existing:
        await database.users.insert_one({
            "phone": payload.phone,
            "created_at": datetime.utcnow(),
            "last_seen": datetime.utcnow(),
            "access_count": 0,
        })
    token = create_jwt(sub=payload.phone)
    return TokenRes(access_token=token, expires_in=60*2*60)  # seconds