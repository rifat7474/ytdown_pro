
import { Card } from '@/components/ui/card';
import { Play, User, Eye, Clock } from 'lucide-react';

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
  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Video Preview</h3>
      
      {/* Thumbnail */}
      <div className="relative mb-4 rounded-lg overflow-hidden group">
        <img 
          src={data.thumbnail} 
          alt={data.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-800 ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {data.duration}
        </div>
      </div>

      {/* Video Info */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 line-clamp-2">{data.title}</h4>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{data.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
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
