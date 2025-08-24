from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    phone: str
    uid: Optional[str] = None           # our external face uid if registered
    rekognition_face_id: Optional[str] = None
    s3_key: Optional[str] = None
    liveness_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    access_count: int = 0

class OTPStartReq(BaseModel):
    phone: str

class OTPVerifyReq(BaseModel):
    phone: str
    code: str

class TokenRes(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class CreateSessionRes(BaseModel):
    sessionId: str

class ProcessResultsReq(BaseModel):
    sessionId: str

class LivenessProcessRes(BaseModel):
    success: bool
    isNewFace: bool | None = None
    uid: Optional[str] = None
    confidence: Optional[float] = None
    livenessScore: Optional[float] = None