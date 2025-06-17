
from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class VideoRequest(BaseModel):
    url: HttpUrl
    quality: Optional[str] = "best"

class VideoFormat(BaseModel):
    quality: str
    format: str
    size: str
    ext: str
    format_id: Optional[str] = ""
    is_premium: Optional[bool] = False

class VideoInfo(BaseModel):
    title: str
    thumbnail: str
    duration: str
    platform: str
    author: str
    views: str
    likes: Optional[str] = "0"
    formats: List[VideoFormat]
