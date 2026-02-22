'use client';
import { Phone, Mail, Link2, Play } from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  titleHi: string;
  youtubeId: string;
  category: 'phone' | 'message' | 'browsing';
  isNew?: boolean;
}

interface Props {
  video: VideoItem;
  lang: 'en' | 'hi';
  onPlay: (video: VideoItem) => void;
  watchNow: string;
  newBadge: string;
}

function getCategoryIcon(category: string) {
  if (category === 'phone') return Phone;
  if (category === 'message') return Mail;
  return Link2;
}

export default function VideoCard({ video, lang, onPlay, watchNow, newBadge }: Props) {
  const CategoryIcon = getCategoryIcon(video.category);

  return (
    <div
      className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-400/50 transition-all group cursor-pointer relative"
      onClick={() => onPlay(video)}
    >
      {video.isNew && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
          {newBadge}
        </div>
      )}

      <div className="relative aspect-video bg-black">
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={lang === 'en' ? video.title : video.titleHi}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <CategoryIcon className="w-5 h-5 text-cyan-400" />
          <span className="text-xs text-cyan-400 uppercase font-bold">{video.category}</span>
        </div>
        <h4 className="text-lg font-bold mb-4">
          {lang === 'en' ? video.title : video.titleHi}
        </h4>
        <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2">
          <Play className="w-4 h-4" />
          {watchNow}
        </button>
      </div>
    </div>
  );
}
