
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models import VideoRequest, VideoInfo
from yt_downloader import YTDownloader
import uvicorn

app = FastAPI(title="Social Media Downloader API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

downloader = YTDownloader()

@app.get("/")
async def root():
    return {"message": "Social Media Downloader API"}

@app.post("/api/video-info", response_model=VideoInfo)
async def get_video_info(request: VideoRequest):
    try:
        video_info = await downloader.get_video_info(request.url)
        return video_info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/download")
async def download_video(request: VideoRequest):
    try:
        file_stream = await downloader.download_video(request.url, request.quality)
        return StreamingResponse(
            file_stream,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename=video.mp4"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
