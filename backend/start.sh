
#!/bin/bash

# Set environment variables for production
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# Check if FFmpeg is available
if command -v ffmpeg >/dev/null 2>&1; then
    echo "FFmpeg is available"
else
    echo "Warning: FFmpeg not found"
fi

# Start the application
exec python -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 --timeout-keep-alive 120
