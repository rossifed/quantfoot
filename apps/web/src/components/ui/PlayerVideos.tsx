import React from 'react';
import { Card } from './Card';
import { Video } from '@/types/player';

interface PlayerVideosProps {
  videos: Video[];
}

export const PlayerVideos: React.FC<PlayerVideosProps> = ({ videos }) => {
  return (
    <Card title="Video Highlights">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-lg mb-3 border border-dark-700 group-hover:border-primary/50 transition-all">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50">
                  <span className="text-3xl">▶️</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-dark-900/90 text-white px-2 py-1 rounded text-sm border border-dark-700">
                {video.duration}
              </div>
              <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-semibold">
                {video.type}
              </div>
            </div>
            <h4 className="font-medium text-white">{video.title}</h4>
          </div>
        ))}
      </div>
    </Card>
  );
};
