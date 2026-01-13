'use client';
import { MessageCircle } from 'lucide-react';

export default function SOSButton() {
  const triggerWhatsAppSOS = () => {
    // 1. Get GPS Location using the browser's native API
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      
      // Creating a clean Google Maps link
      const staticMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
      
      // CHANGE THIS: Put your family's actual WhatsApp number here
      // Format: Country Code + Number (No '+' and No '0' at the start)
      const familyNumber = "91XXXXXXXXXX"; 
      
      const message = 
        `🚨 *QUANTUM SHIELD SOS* 🚨\n\n` +
        `I am being targeted by a scam and need help.\n\n` +
        `📍 *My Location:* ${staticMapsLink}\n\n` +
        `Please call me or track my movement!`;

      // 2. Open WhatsApp natively
      const encodedMsg = encodeURIComponent(message);
      window.open(`https://wa.me/${familyNumber}?text=${encodedMsg}`, '_blank');
    });
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={triggerWhatsAppSOS}
        className="w-full bg-[#25D366] hover:bg-[#20ba56] py-8 rounded-[3rem] font-black uppercase tracking-[0.2em] text-white shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
      >
        <MessageCircle className="w-6 h-6" /> 
        Trigger WhatsApp SOS
      </button>
      <p className="text-[9px] text-slate-500 text-center uppercase font-mono px-6">
        No server fees. Message sent directly from your WhatsApp.
      </p>
    </div>
  );
}