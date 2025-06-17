import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, CheckCircle, AlertCircle, Play, Sparkles, Shield, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Download className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            StreamSaver
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-4 font-light">
            Download videos from any social platform with lightning speed
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Free, fast, and secure. No registration required. Works with TikTok, Instagram, YouTube, Twitter and more.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          {/* Enhanced URL Input Form */}
          <Card className="p-8 md:p-12 mb-12 bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10 rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label htmlFor="url" className="block text-lg font-semibold text-gray-800 text-center">
                  Paste your video URL here
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://www.tiktok.com/@username/video/... or any social media URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-2xl pl-6 pr-6 group-hover:shadow-lg bg-white/90 backdrop-blur-sm"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !url.trim()}
                    className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5" />
                        Get Video
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Enhanced Supported Platforms */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4 font-medium">Supported platforms:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Facebook', 'Snapchat', 'LinkedIn', 'Reddit'].map((platform) => (
                    <span key={platform} className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm font-medium hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-200 cursor-default">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </form>
          </Card>

          {/* Enhanced Status Indicator */}
          {downloadStatus !== 'idle' && (
            <Card className="p-8 mb-12 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
              <div className="flex items-center justify-center">
                {downloadStatus === 'processing' && <Loader message="Analyzing video..." />}
                {downloadStatus === 'downloading' && <Loader message="Downloading your video..." />}
                {downloadStatus === 'completed' && (
                  <div className="flex items-center gap-4 text-green-600">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-semibold">Download completed successfully!</span>
                  </div>
                )}
                {downloadStatus === 'error' && (
                  <div className="flex items-center gap-4 text-red-600">
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-semibold">Something went wrong. Please try again.</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Video Preview and Download Options */}
          {videoData && (
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
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
            <div className="text-center mb-16">
              <Button 
                onClick={resetDownload}
                variant="outline"
                className="px-12 py-4 text-lg rounded-2xl border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300"
              >
                Download Another Video
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Features Section */}
        <div className="max-w-7xl mx-auto mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose StreamSaver?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the fastest, most reliable video downloading service with premium features
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Lightning Fast</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Download videos in seconds with our optimized servers and cutting-edge technology.</p>
            </Card>
            <Card className="p-8 text-center bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Premium Quality</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Download videos in original quality up to 4K resolution with crystal clear audio.</p>
            </Card>
            <Card className="p-8 text-center bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Secure & Private</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Your privacy is our priority. No data collection, no registration, completely anonymous.</p>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>
          <p className="text-gray-600 text-lg">
            Made with ❤️ for video enthusiasts worldwide
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
