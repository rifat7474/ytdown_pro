
import { Card } from '@/components/ui/card';
import { Play, User, Eye, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface VideoPreviewProps {
  data: {
    title: string;
    thumbnail: string;
    duration: string;
    platform: string;
    author: string;
    views: string;
  };
}

export const VideoPreview = ({ data }: VideoPreviewProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Video Preview</h3>
      
      {/* Enhanced Thumbnail with Error Handling */}
      <div className="relative mb-4 rounded-lg overflow-hidden group">
        {imageLoading && !imageError && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p className="text-sm">Image not available</p>
          </div>
        ) : (
          <img 
            src={data.thumbnail} 
            alt={data.title}
            className={`w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        )}
        
        {!imageError && (
          <>
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-800 ml-1" aria-label="Play video preview" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span aria-label={`Duration: ${data.duration}`}>{data.duration}</span>
            </div>
          </>
        )}
      </div>

      {/* Enhanced Video Info */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 line-clamp-2" title={data.title}>
          {data.title}
        </h4>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1" title={`Author: ${data.author}`}>
            <User className="w-4 h-4" aria-hidden="true" />
            <span>{data.author}</span>
          </div>
          <div className="flex items-center gap-1" title={`Views: ${data.views}`}>
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>{data.views}</span>
          </div>
        </div>

        <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm">
          {data.platform}
        </div>
      </div>
    </Card>
  );
};
