'use client';
import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show after 5 seconds (don't interrupt user immediately)
      setTimeout(() => {
        const dismissed = localStorage.getItem('install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Cleanup
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show browser's install prompt
    deferredPrompt.prompt();
    
    // Wait for user's choice
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(outcome === 'accepted' ? '✅ User installed app' : '❌ User dismissed');
    
    // Reset
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal (so we don't annoy user every time)
    localStorage.setItem('install-dismissed', 'true');
  };

  // Don't show if not ready
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-emerald-600 to-emerald-600 rounded-xl p-4 shadow-2xl z-50 border border-white/20 animate-slide-up">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/70 hover:text-white transition"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg shrink-0">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">📱 Install AdamasVault</h3>
          <p className="text-sm text-white/90 mb-3">
            Get instant access during emergencies. Works offline. 100% safe—no APK download needed.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition text-sm"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}