'use client';
import type { VideoItem } from './VideoCard';

interface Props {
  video: VideoItem | null;
  lang: 'en' | 'hi';
  onClose: () => void;
}

export default function VideoModal({ video, lang, onClose }: Props) {
  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/20 max-w-4xl w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-xl font-bold">
            {lang === 'en' ? video.title : video.titleHi}
          </h3>
          <button
            onClick={onClose}
            className="text-3xl leading-none hover:text-red-400 transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="aspect-video">
          {/* FIX: allowFullScreen was missing — videos couldn't go fullscreen */}
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
