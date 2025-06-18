
import yt_dlp
import asyncio
from io import BytesIO
from models import VideoInfo, VideoFormat
import re
import tempfile
import os
import shutil
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YTDownloader:
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'socket_timeout': 30,
            'retries': 3,
        }
        
        # Check if running on Render
        self.is_render = os.getenv("RENDER", "false").lower() == "true"
        if self.is_render:
            logger.info("Running on Render deployment environment")

    async def get_video_info(self, url: str) -> VideoInfo:
        loop = asyncio.get_event_loop()
        
        def extract_info():
            try:
                with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    return info
            except Exception as e:
                logger.error(f"Error extracting info: {str(e)}")
                raise
        
        try:
            info = await asyncio.wait_for(
                loop.run_in_executor(None, extract_info), 
                timeout=60.0
            )
            
            # Extract platform from URL
            platform = self._get_platform(url)
            
            # Process formats with better quality detection
            formats = []
            seen_qualities = set()
            
            if 'formats' in info:
                # Sort formats by quality (height) descending
                sorted_formats = sorted(
                    [f for f in info['formats'] if f.get('height')], 
                    key=lambda x: x.get('height', 0), 
                    reverse=True
                )
                
                for fmt in sorted_formats[:10]:  # Limit to top 10 formats
                    if fmt.get('height') and fmt.get('ext'):
                        quality = f"{fmt['height']}p"
                        if quality not in seen_qualities and fmt.get('vcodec') != 'none':
                            # Determine if it's a premium quality
                            is_premium = fmt['height'] >= 1080
                            formats.append(VideoFormat(
                                quality=quality,
                                format=fmt['ext'].upper(),
                                size=self._format_filesize(fmt.get('filesize', 0)),
                                ext=fmt['ext'],
                                format_id=fmt.get('format_id', ''),
                                is_premium=is_premium
                            ))
                            seen_qualities.add(quality)
            
            # Add standard video qualities if not present
            standard_qualities = ['1080p', '720p', '480p', '360p']
            for quality in standard_qualities:
                if quality not in seen_qualities:
                    formats.append(VideoFormat(
                        quality=quality,
                        format="MP4",
                        size="~10MB",
                        ext="mp4",
                        format_id=f"best[height<={quality[:-1]}]",
                        is_premium=quality in ['1080p', '4K']
                    ))
            
            # Add audio-only options
            formats.extend([
                VideoFormat(
                    quality="High Quality Audio",
                    format="MP3",
                    size="~5MB",
                    ext="mp3",
                    format_id="bestaudio[ext=m4a]/bestaudio",
                    is_premium=False
                ),
                VideoFormat(
                    quality="Audio Only",
                    format="MP3",
                    size="~3MB", 
                    ext="mp3",
                    format_id="bestaudio/best",
                    is_premium=False
                )
            ])
            
            return VideoInfo(
                title=info.get('title', 'Unknown Title'),
                thumbnail=info.get('thumbnail', ''),
                duration=self._format_duration(info.get('duration', 0)),
                platform=platform,
                author=info.get('uploader', 'Unknown'),
                views=self._format_views(info.get('view_count', 0)),
                likes=self._format_views(info.get('like_count', 0)),
                formats=formats
            )
            
        except asyncio.TimeoutError:
            raise Exception("Request timeout - video info extraction took too long")
        except Exception as e:
            logger.error(f"Failed to extract video info: {str(e)}")
            raise Exception(f"Failed to extract video info: {str(e)}")

    async def download_video(self, url: str, quality: str = "best"):
        loop = asyncio.get_event_loop()
        temp_dir = None
        
        def download():
            nonlocal temp_dir
            try:
                # Create a temporary directory for this download
                temp_dir = tempfile.mkdtemp(prefix="yt_download_")
                temp_file = os.path.join(temp_dir, "download")
                
                # Configure download options based on quality
                format_selector = self._get_format_selector(quality)
                
                opts = {
                    'format': format_selector,
                    'outtmpl': temp_file + '.%(ext)s',
                    'quiet': True,
                    'no_warnings': True,
                    'socket_timeout': 30,
                    'retries': 2,
                }
                
                # Add specific options for audio downloads
                if 'Audio' in quality:
                    opts.update({
                        'format': 'bestaudio/best',
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': 'mp3',
                            'preferredquality': '192',
                        }],
                    })
                
                logger.info(f"Starting download with format: {format_selector}")
                
                with yt_dlp.YoutubeDL(opts) as ydl:
                    ydl.download([url])
                
                # Find the downloaded file
                downloaded_file = None
                for ext in ['mp4', 'webm', 'mkv', 'mp3', 'm4a']:
                    test_path = f"{temp_file}.{ext}"
                    if os.path.exists(test_path):
                        downloaded_file = test_path
                        break
                
                if not downloaded_file:
                    raise Exception("Downloaded file not found after processing")
                
                # Read file content
                with open(downloaded_file, 'rb') as f:
                    content = f.read()
                
                logger.info(f"Successfully downloaded {len(content)} bytes")
                return content, self._get_file_extension(quality)
                
            except Exception as e:
                logger.error(f"Download error: {str(e)}")
                raise e
            finally:
                # Clean up temporary directory
                if temp_dir and os.path.exists(temp_dir):
                    try:
                        shutil.rmtree(temp_dir)
                    except Exception as cleanup_error:
                        logger.warning(f"Failed to cleanup temp dir: {cleanup_error}")
        
        try:
            content, extension = await asyncio.wait_for(
                loop.run_in_executor(None, download), 
                timeout=300.0  # 5 minute timeout
            )
            return content, extension
        except asyncio.TimeoutError:
            raise Exception("Download timeout - the video took too long to process")
        except Exception as e:
            raise Exception(f"Failed to download video: {str(e)}")

    # ... keep existing code (helper methods _get_platform, _format_duration, _format_views, _format_filesize, _get_format_selector, _get_file_extension)

    def _get_platform(self, url: str) -> str:
        if 'tiktok.com' in url:
            return 'TikTok'
        elif 'instagram.com' in url:
            return 'Instagram'
        elif 'youtube.com' in url or 'youtu.be' in url:
            return 'YouTube'
        elif 'twitter.com' in url or 'x.com' in url:
            return 'Twitter'
        elif 'facebook.com' in url or 'fb.watch' in url:
            return 'Facebook'
        elif 'snapchat.com' in url:
            return 'Snapchat'
        elif 'linkedin.com' in url:
            return 'LinkedIn'
        elif 'reddit.com' in url:
            return 'Reddit'
        else:
            return 'Other'

    def _format_duration(self, seconds: int) -> str:
        if not seconds:
            return "0:00"
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = seconds % 60
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes}:{seconds:02d}"

    def _format_views(self, views: int) -> str:
        if not views:
            return "0"
        if views >= 1000000000:
            return f"{views/1000000000:.1f}B"
        elif views >= 1000000:
            return f"{views/1000000:.1f}M"
        elif views >= 1000:
            return f"{views/1000:.1f}K"
        else:
            return str(views)

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
        if "Audio" in quality:
            return "bestaudio/best"
        elif quality == "4K":
            return "best[height<=2160]"
        elif quality.endswith('p'):
            height = quality[:-1]
            return f"best[height<={height}]"
        else:
            return "best"

    def _get_file_extension(self, quality: str) -> str:
        if "Audio" in quality:
            return "mp3"
        else:
            return "mp4"
