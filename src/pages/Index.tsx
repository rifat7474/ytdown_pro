import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { VideoCard } from '@/components/VideoCard';
import { DownloadOptions } from '@/components/DownloadOptions';
import { Loader } from '@/components/Loader';
import { toast } from '@/hooks/use-toast';
import { api } from '@/utils/api';

const Index = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid social media URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setDownloadStatus('processing');
    
    try {
      const videoInfo = await api.getVideoInfo(url);
      setVideoData(videoInfo);
      setDownloadStatus('idle');
      toast({
        title: "Video Info Retrieved",
        description: "Video information loaded successfully",
      });
    } catch (error) {
      console.error('Error getting video info:', error);
      setDownloadStatus('error');
      toast({
        title: "Error",
        description: error.message || "Failed to get video information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloadStatus('downloading');
    
    try {
      await api.downloadVideo(url, format.quality);
      setDownloadStatus('completed');
      toast({
        title: "Download Complete!",
        description: `Video downloaded in ${format.quality} quality`,
      });
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download video",
        variant: "destructive"
      });
    }
  };

  const resetDownload = () => {
    setVideoData(null);
    setUrl('');
    setDownloadStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Download className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Social Media Downloader
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download videos from TikTok, Instagram, YouTube, Twitter and more. 
            Fast, free, and easy to use.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* URL Input Form */}
          <Card className="p-8 mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium text-gray-700">
                  Paste your video URL here
                </label>
                <div className="flex gap-3">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://www.tiktok.com/@username/video/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !url.trim()}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Get Video
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Supported Platforms */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Supported platforms:</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Facebook'].map((platform) => (
                    <span key={platform} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </form>
          </Card>

          {/* Status Indicator */}
          {downloadStatus !== 'idle' && (
            <Card className="p-6 mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-center">
                {downloadStatus === 'processing' && <Loader message="Processing video..." />}
                {downloadStatus === 'downloading' && <Loader message="Downloading..." />}
                {downloadStatus === 'completed' && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Download completed!</span>
                  </div>
                )}
                {downloadStatus === 'error' && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">An error occurred. Please try again.</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Video Preview and Download Options */}
          {videoData && (
            <div className="grid lg:grid-cols-2 gap-8">
              <VideoCard data={videoData} />
              <DownloadOptions 
                formats={videoData.formats} 
                onDownload={handleDownload}
                downloadStatus={downloadStatus}
              />
            </div>
          )}

          {/* Reset Button */}
          {videoData && downloadStatus === 'completed' && (
            <div className="text-center mt-8">
              <Button 
                onClick={resetDownload}
                variant="outline"
                className="px-8 py-3"
              >
                Download Another Video
              </Button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Our Downloader?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Downloads</h3>
              <p className="text-gray-600">Lightning-fast processing and download speeds for all supported platforms.</p>
            </Card>
            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">High Quality</h3>
              <p className="text-gray-600">Download videos in original quality up to 4K resolution.</p>
            </Card>
            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multiple Formats</h3>
              <p className="text-gray-600">Choose from various formats including MP4, MP3, and different qualities.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
