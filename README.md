
# Social Media Downloader

A full-stack social media video downloader built with React frontend and FastAPI backend.

## Project Structure

```
social-media-downloader/
│
├── frontend/                    # React/Next.js app (Vercel)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Pages
│   │   ├── styles/              # CSS/Tailwind config
│   │   └── utils/
│   │       └── api.js           # API calls to backend
│   ├── .env.local               # Environment variables
│   ├── next.config.js           # Next.js configuration
│   └── package.json
│
├── backend/                     # FastAPI backend (Render)
│   ├── main.py                  # FastAPI app and routes
│   ├── yt_downloader.py         # yt-dlp integration
│   ├── models.py                # Pydantic models
│   ├── requirements.txt         # Python dependencies
│   ├── start.sh                 # Render start script
│   └── render.yaml              # Render deploy config
│
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Deployment

### Backend (Render)
- Connect your GitHub repository to Render
- Use the `render.yaml` configuration for automatic deployment
- Set environment variables as needed

### Frontend (Vercel)
- Connect your GitHub repository to Vercel
- Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend URL
- Deploy automatically on push to main branch

## Features

- Support for multiple platforms (TikTok, Instagram, YouTube, Twitter, Facebook)
- Multiple video quality options
- Audio-only downloads
- Real-time download progress
- Modern, responsive UI
- Fast API backend with yt-dlp integration

## API Endpoints

- `POST /api/video-info` - Get video information
- `POST /api/download` - Download video in specified quality

## Technologies Used

**Frontend:**
- React/Next.js
- Tailwind CSS
- shadcn/ui components

**Backend:**
- FastAPI
- yt-dlp
- Pydantic
- Uvicorn
