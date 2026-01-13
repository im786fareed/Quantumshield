'use client';
import { PlayCircle } from 'lucide-react';

export default function EducationPage() {
  const videos = [
    {
      id: '1',
      title: 'Digital Arrest Scam - Expert Debate',
      videoId: 'GWLkfkMnU70',
      description: 'Comprehensive discussion on digital arrest scams',
      duration: '45:30'
    },
    {
      id: '2',
      title: 'Financial Safety Training - NCERT & I4C',
      videoId: '7at69Ttn4jc',
      description: 'Official government training on financial fraud prevention',
      duration: '32:15'
    },
    {
      id: '3',
      title: 'Scam Trends 2026 - Rising Fraud Cases',
      videoId: '3VgukEZ24mY',
      description: 'Latest scam patterns emerging in India',
      duration: '28:45'
    },
    {
      id: '4',
      title: 'How to Spot Digital Arrest Scams',
      videoId: 'dQw4w9WgXcQ', // Replace with real video
      description: 'Learn the warning signs',
      duration: '12:30'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">📚 Cyber Safety Education</h1>
        <p className="text-blue-100">Learn how to protect yourself from cyber fraud</p>
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition">
            {/* Embedded YouTube Player */}
            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                className="w-full h-full"
                allowFullScreen
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                loading="lazy"
              />
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{video.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{video.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Duration: {video.duration}</span>
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Watch on YouTube →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Tips */}
      <div className="mt-8 bg-white/5 rounded-xl p-6">
        <h2 className="font-bold text-xl mb-4">🎯 Key Takeaways</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            <p className="text-sm text-gray-300">Police/CBI never arrest people over phone calls</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            <p className="text-sm text-gray-300">Never share OTP, CVV, passwords with anyone</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            <p className="text-sm text-gray-300">Verify caller identity by calling official numbers</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
            <p className="text-sm text-gray-300">Report suspicious calls to 1930 immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
}