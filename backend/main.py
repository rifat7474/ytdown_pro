from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from models import VideoRequest, VideoInfo
from yt_downloader import YTDownloader
import uvicorn
import io
import os
import re
import logging
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Social Media Downloader API", version="1.0.0")

# Add rate limiting error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS with specific origins for production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.lovable.app",
    "https://*.render.com",
    "https://*.vercel.app",
    "https://vercel.app"
]

if os.getenv("RENDER"):
    # Add production domains
    allowed_origins.extend([
        "https://social-media-downloader.lovable.app",
        "https://social-media-downloader.vercel.app",
        # Add your custom domain here when deployed
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.render.com", "*.lovable.app", "*.vercel.app"]
)

downloader = YTDownloader()

def validate_url(url: str) -> bool:
    """Validate and sanitize URL input"""
    try:
        # Basic URL validation
        parsed = urlparse(url)
        if not all([parsed.scheme, parsed.netloc]):
            return False
        
        # Check for supported domains
        supported_domains = [
            'tiktok.com', 'instagram.com', 'youtube.com', 'youtu.be',
            'twitter.com', 'x.com', 'facebook.com', 'fb.watch',
            'snapchat.com', 'linkedin.com', 'reddit.com', 'pinterest.com',
            'dailymotion.com', 'vimeo.com'
        ]
        
        domain = parsed.netloc.lower()
        return any(supported in domain for supported in supported_domains)
    except Exception:
        return False

@app.get("/")
async def root():
    return {
        "message": "Social Media Downloader API - Supporting TikTok, Instagram, YouTube, Twitter and more!",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Enhanced health check endpoint for deployment monitoring"""
    try:
        # Check if FFmpeg is available
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, timeout=5)
        ffmpeg_available = result.returncode == 0
        
        return {
            "status": "healthy",
            "ffmpeg_available": ffmpeg_available,
            "environment": "render" if os.getenv("RENDER") else "local",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "degraded",
            "error": str(e),
            "ffmpeg_available": False
        }

@app.post("/api/video-info", response_model=VideoInfo)
@limiter.limit("10/minute")
async def get_video_info(request: Request, video_request: VideoRequest):
    try:
        url = str(video_request.url).strip()
        
        # Enhanced input validation
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        if not validate_url(url):
            raise HTTPException(
                status_code=400, 
                detail="Invalid or unsupported URL. Please provide a valid social media URL."
            )
        
        logger.info(f"Processing video info request for: {url}")
        video_info = await downloader.get_video_info(url)
        logger.info(f"Successfully retrieved video info for: {video_info.title}")
        return video_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting video info: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve video information: {str(e)}"
        )

@app.post("/api/download")
@limiter.limit("5/minute")
async def download_video(request: Request, video_request: VideoRequest):
    try:
        url = str(video_request.url).strip()
        quality = video_request.quality or "best"
        
        # Enhanced input validation
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        if not validate_url(url):
            raise HTTPException(
                status_code=400, 
                detail="Invalid or unsupported URL. Please provide a valid social media URL."
            )
        
        # Validate quality parameter
        allowed_qualities = [
            "best", "worst", "4K", "1080p", "720p", "480p", "360p", 
            "High Quality Audio", "Audio Only"
        ]
        if quality not in allowed_qualities:
            quality = "best"
        
        logger.info(f"Starting download: {url} - Quality: {quality}")
        content, extension = await downloader.download_video(url, quality)
        
        # Create a safe filename
        filename = f"video.{extension}"
        if "Audio" in quality:
            filename = f"audio.{extension}"
        
        logger.info(f"Download completed: {filename} ({len(content)} bytes)")
        
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(content)),
                "Cache-Control": "no-cache"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to download video: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    workers = int(os.getenv("MAX_WORKERS", 1))
    uvicorn.run(app, host="0.0.0.0", port=port, workers=workers)
