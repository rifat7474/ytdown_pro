
import { Card } from '@/components/ui/card';
import { Play, User, Eye, Clock, Heart } from 'lucide-react';
import { VideoInfo } from '@/types';

interface VideoCardProps {
  data: VideoInfo;
}

export const VideoCard = ({ data }: VideoCardProps) => {
  return (
    <Card className="p-8 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h3 className="text-2xl font-bold text-gray-800">Video Preview</h3>
      </div>
      
      {/* Enhanced Thumbnail */}
      <div className="relative mb-6 rounded-2xl overflow-hidden group/thumb shadow-lg">
        <img 
          src={data.thumbnail} 
          alt={data.title}
          className="w-full h-56 object-cover transition-all duration-500 group-hover/thumb:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-all duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all duration-300">
          <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xl transform scale-90 group-hover/thumb:scale-100 transition-transform duration-300">
            <Play className="w-10 h-10 text-gray-800 ml-1" aria-label="Play video preview" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-2 rounded-xl text-sm flex items-center gap-2 backdrop-blur-sm">
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span aria-label={`Duration: ${data.duration}`}>{data.duration}</span>
        </div>
        <div className="absolute top-3 left-3 bg-white/90 text-gray-800 px-3 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm">
          {data.platform}
        </div>
      </div>

      {/* Enhanced Video Info */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-800 text-lg line-clamp-2 leading-relaxed" title={data.title}>
          {data.title}
        </h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-medium" title={`Author: ${data.author}`}>{data.author}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1" title={`Views: ${data.views}`}>
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span>{data.views}</span>
            </div>
            <div className="flex items-center gap-1" title={`Likes: ${data.likes || 'N/A'}`}>
              <Heart className="w-4 h-4" aria-hidden="true" />
              <span>{data.likes || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true"></div>
            Ready to download
          </div>
        </div>
      </div>
    </Card>
  );
};
