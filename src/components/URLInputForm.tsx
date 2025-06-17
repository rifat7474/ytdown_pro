
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';

interface URLInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const URLInputForm = ({ url, setUrl, onSubmit, isLoading }: URLInputFormProps) => {
  const supportedPlatforms = [
    'TikTok', 'Instagram', 'YouTube', 'Twitter', 'Facebook', 
    'Snapchat', 'LinkedIn', 'Reddit', 'Pinterest', 'Dailymotion'
  ];

  return (
    <Card className="p-8 md:p-12 mb-12 bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10 rounded-3xl">
      <form onSubmit={onSubmit} className="space-y-8">
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
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4 font-medium">Supported platforms:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {supportedPlatforms.map((platform) => (
              <span 
                key={platform} 
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm font-medium hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-200 cursor-default"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </form>
    </Card>
  );
};
