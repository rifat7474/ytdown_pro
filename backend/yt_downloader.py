
import yt_dlp
import asyncio
from io import BytesIO
from models import VideoInfo, VideoFormat
import re

class YTDownloader:
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }

    async def get_video_info(self, url: str) -> VideoInfo:
        loop = asyncio.get_event_loop()
        
        def extract_info():
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return info
        
        try:
            info = await loop.run_in_executor(None, extract_info)
            
            # Extract platform from URL
            platform = self._get_platform(url)
            
            # Process formats
            formats = []
            if 'formats' in info:
                seen_qualities = set()
                for fmt in info['formats']:
                    if fmt.get('height') and fmt.get('ext'):
                        quality = f"{fmt['height']}p"
                        if quality not in seen_qualities:
                            formats.append(VideoFormat(
                                quality=quality,
                                format=fmt['ext'].upper(),
                                size=self._format_filesize(fmt.get('filesize', 0)),
                                ext=fmt['ext']
                            ))
                            seen_qualities.add(quality)
            
            # Add audio-only option
            formats.append(VideoFormat(
                quality="Audio Only",
                format="MP3",
                size="~3MB",
                ext="mp3"
            ))
            
            return VideoInfo(
                title=info.get('title', 'Unknown Title'),
                thumbnail=info.get('thumbnail', ''),
                duration=self._format_duration(info.get('duration', 0)),
                platform=platform,
                author=info.get('uploader', 'Unknown'),
                views=self._format_views(info.get('view_count', 0)),
                formats=formats
            )
            
        except Exception as e:
            raise Exception(f"Failed to extract video info: {str(e)}")

    async def download_video(self, url: str, quality: str = "best"):
        loop = asyncio.get_event_loop()
        
        def download():
            output_buffer = BytesIO()
            
            opts = {
                'format': self._get_format_selector(quality),
                'outtmpl': '-',
                'quiet': True,
            }
            
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([url])
            
            return output_buffer
        
        try:
            buffer = await loop.run_in_executor(None, download)
            buffer.seek(0)
            return buffer
        except Exception as e:
            raise Exception(f"Failed to download video: {str(e)}")

    def _get_platform(self, url: str) -> str:
        if 'tiktok.com' in url:
            return 'TikTok'
        elif 'instagram.com' in url:
            return 'Instagram'
        elif 'youtube.com' in url or 'youtu.be' in url:
            return 'YouTube'
        elif 'twitter.com' in url or 'x.com' in url:
            return 'Twitter'
        elif 'facebook.com' in url:
            return 'Facebook'
        else:
            return 'Unknown'

    def _format_duration(self, seconds: int) -> str:
        if not seconds:
            return "0:00"
        minutes = seconds // 60
        seconds = seconds % 60
        return f"{minutes}:{seconds:02d}"

    def _format_views(self, views: int) -> str:
        if views >= 1000000:
            return f"{views/1000000:.1f}M views"
        elif views >= 1000:
            return f"{views/1000:.1f}K views"
        else:
            return f"{views} views"

    def _format_filesize(self, size: int) -> str:
        if not size:
            return "Unknown"
        if size >= 1024*1024*1024:
            return f"{size/(1024*1024*1024):.1f} GB"
        elif size >= 1024*1024:
            return f"{size/(1024*1024):.1f} MB"
        elif size >= 1024:
            return f"{size/1024:.1f} KB"
        else:
            return f"{size} B"

    def _get_format_selector(self, quality: str) -> str:
        if quality == "Audio Only":
            return "bestaudio/best"
        elif quality.endswith('p'):
            height = quality[:-1]
            return f"best[height<={height}]"
        else:
            return "best"
