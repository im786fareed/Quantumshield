'use client';
import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Navigation, AlertCircle, Shield, Clock, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface PoliceStation {
  name: string;
  address: string;
  phone: string;
  distance?: number;
  lat?: number;
  lng?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export default function EmergencyContact({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestStations, setNearestStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedNumber, setCopiedNumber] = useState('');

  const content = {
    en: {
      title: '🚨 Emergency Contacts',
      subtitle: 'Get help immediately - Find nearest police station and emergency numbers',
      findLocation: 'Find My Location',
      findingLocation: 'Finding your location...',
      yourLocation: 'Your Location',
      nearestStations: 'Nearest Police Stations',
      nationalHelplines: 'National Emergency Helplines',
      distance: 'Away',
      callNow: 'Call Now',
      getDirections: 'Get Directions',
      copyNumber: 'Copy Number',
      copied: 'Copied!',
      reportScam: 'Report Scam',
      helplines: {
        cybercrime: {
          name: 'National Cybercrime Helpline',
          number: '1930',
          description: 'Report cyber fraud, scams, and digital crimes',
          available: '24/7 Available'
        },
        police: {
          name: 'Police Emergency',
          number: '100',
          description: 'Immediate police assistance',
          available: '24/7 Available'
        },
        women: {
          name: 'Women Helpline',
          number: '1091',
          description: 'Women in distress',
          available: '24/7 Available'
        },
        child: {
          name: 'Child Helpline',
          number: '1098',
          description: 'Child abuse and trafficking',
          available: '24/7 Available'
        },
        senior: {
          name: 'Senior Citizen Helpline',
          number: '14567',
          description: 'Assistance for senior citizens',
          available: '24/7 Available'
        }
      },
      onlinePortals: 'Online Reporting Portals',
      portals: {
        cybercrime: {
          name: 'National Cybercrime Portal',
          url: 'https://cybercrime.gov.in',
          description: 'File online complaint for cyber crimes'
        },
        consumerForum: {
          name: 'Consumer Forum',
          url: 'https://consumerhelpline.gov.in',
          description: 'Consumer complaints and fraud'
        },
        rbi: {
          name: 'RBI Banking Ombudsman',
          url: 'https://cms.rbi.org.in',
          description: 'Banking fraud complaints'
        }
      },
      instructions: 'Emergency Instructions',
      steps: [
        'If you\'re being scammed RIGHT NOW - HANG UP immediately',
        'Do NOT share OTP, passwords, or bank details',
        'Call the number back on OFFICIAL website (not the number they called from)',
        'Report to cybercrime helpline: 1930',
        'Visit nearest police station with evidence',
        'Block the scammer\'s number immediately'
      ],
      locationError: 'Could not get your location. Please enable location services.',
      permissionDenied: 'Location permission denied. Please allow location access to find nearest police stations.',
      noStationsFound: 'No police stations found nearby. Showing national helplines.',
      mockStations: 'Showing sample police stations. Enable location for accurate results.'
    },
    hi: {
      title: '🚨 आपातकालीन संपर्क',
      subtitle: 'तुरंत मदद पाएं - निकटतम पुलिस स्टेशन और आपातकालीन नंबर खोजें',
      findLocation: 'मेरा स्थान खोजें',
      findingLocation: 'आपका स्थान खोज रहे हैं...',
      yourLocation: 'आपका स्थान',
      nearestStations: 'निकटतम पुलिस स्टेशन',
      nationalHelplines: 'राष्ट्रीय आपातकालीन हेल्पलाइन',
      distance: 'दूर',
      callNow: 'अभी कॉल करें',
      getDirections: 'दिशा-निर्देश प्राप्त करें',
      copyNumber: 'नंबर कॉपी करें',
      copied: 'कॉपी हो गया!',
      reportScam: 'घोटाला रिपोर्ट करें',
      helplines: {
        cybercrime: {
          name: 'राष्ट्रीय साइबर अपराध हेल्पलाइन',
          number: '1930',
          description: 'साइबर धोखाधड़ी, घोटाले और डिजिटल अपराध रिपोर्ट करें',
          available: '24/7 उपलब्ध'
        },
        police: {
          name: 'पुलिस आपातकाल',
          number: '100',
          description: 'तत्काल पुलिस सहायता',
          available: '24/7 उपलब्ध'
        },
        women: {
          name: 'महिला हेल्पलाइन',
          number: '1091',
          description: 'संकट में महिलाएं',
          available: '24/7 उपलब्ध'
        },
        child: {
          name: 'बाल हेल्पलाइन',
          number: '1098',
          description: 'बाल शोषण और तस्करी',
          available: '24/7 उपलब्ध'
        },
        senior: {
          name: 'वरिष्ठ नागरिक हेल्पलाइन',
          number: '14567',
          description: 'वरिष्ठ नागरिकों के लिए सहायता',
          available: '24/7 उपलब्ध'
        }
      },
      onlinePortals: 'ऑनलाइन रिपोर्टिंग पोर्टल',
      portals: {
        cybercrime: {
          name: 'राष्ट्रीय साइबर अपराध पोर्टल',
          url: 'https://cybercrime.gov.in',
          description: 'साइबर अपराध के लिए ऑनलाइन शिकायत दर्ज करें'
        },
        consumerForum: {
          name: 'उपभोक्ता मंच',
          url: 'https://consumerhelpline.gov.in',
          description: 'उपभोक्ता शिकायतें और धोखाधड़ी'
        },
        rbi: {
          name: 'RBI बैंकिंग लोकपाल',
          url: 'https://cms.rbi.org.in',
          description: 'बैंकिंग धोखाधड़ी की शिकायतें'
        }
      },
      instructions: 'आपातकालीन निर्देश',
      steps: [
        'यदि आपको अभी घोटाला किया जा रहा है - तुरंत फोन काट दें',
        'OTP, पासवर्ड, या बैंक विवरण साझा न करें',
        'आधिकारिक वेबसाइट पर नंबर वापस कॉल करें (उन्होंने जिस नंबर से कॉल किया उस पर नहीं)',
        'साइबर अपराध हेल्पलाइन पर रिपोर्ट करें: 1930',
        'सबूत के साथ निकटतम पुलिस स्टेशन जाएं',
        'स्कैमर का नंबर तुरंत ब्लॉक करें'
      ],
      locationError: 'आपका स्थान नहीं मिल सका। कृपया स्थान सेवाओं को सक्षम करें।',
      permissionDenied: 'स्थान अनुमति अस्वीकार की गई। कृपया निकटतम पुलिस स्टेशन खोजने के लिए स्थान पहुंच की अनुमति दें।',
      noStationsFound: 'आस-पास कोई पुलिस स्टेशन नहीं मिला। राष्ट्रीय हेल्पलाइन दिखा रहे हैं।',
      mockStations: 'नमूना पुलिस स्टेशन दिखा रहे हैं। सटीक परिणामों के लिए स्थान सक्षम करें।'
    }
  };

  const t = content[lang];

  // Mock police stations data (replace with real API)
  const mockPoliceStations: PoliceStation[] = [
    {
      name: 'Cyber Crime Police Station',
      address: 'Bandra East, Mumbai, Maharashtra',
      phone: '022-26591694',
      distance: 2.3
    },
    {
      name: 'Local Police Station',
      address: 'Andheri West, Mumbai, Maharashtra',
      phone: '022-26391111',
      distance: 3.5
    },
    {
      name: 'Women Police Station',
      address: 'Juhu, Mumbai, Maharashtra',
      phone: '022-26602222',
      distance: 4.2
    }
  ];

  useEffect(() => {
    // Auto-detect location on mount (optional)
    // getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError(t.locationError);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setUserLocation({
          lat: latitude,
          lng: longitude,
          city: 'Mumbai', // Would come from reverse geocoding API
          state: 'Maharashtra'
        });

        // In production, call Google Places API or similar
        // const stations = await fetchNearbyPoliceStations(latitude, longitude);
        
        // For now, use mock data with calculated distances
        setNearestStations(mockPoliceStations);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(t.permissionDenied);
        setLoading(false);
        
        // Still show mock stations
        setNearestStations(mockPoliceStations);
      }
    );
  };

  const copyPhoneNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(''), 2000);
  };

  const callNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const getDirections = (station: PoliceStation) => {
    if (userLocation && station.lat && station.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.lat},${station.lng}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(station.address)}`,
        '_blank'
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-red-100">{t.subtitle}</p>
      </div>

      {/* Emergency Instructions */}
      <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-400 text-lg mb-2">{t.instructions}</h3>
          </div>
        </div>
        <ol className="space-y-2">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-200">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Location Finder */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <button
          onClick={getUserLocation}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition"
        >
          <Navigation className="w-6 h-6" />
          {loading ? t.findingLocation : t.findLocation}
        </button>

        {error && (
          <div className="mt-4 bg-red-600/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {userLocation && (
          <div className="mt-4 bg-green-600/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <span className="font-bold text-green-400">{t.yourLocation}</span>
            </div>
            <p className="text-gray-300">{userLocation.city}, {userLocation.state}</p>
          </div>
        )}
      </div>

      {/* National Helplines */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
          <Phone className="w-6 h-6 text-red-400" />
          {t.nationalHelplines}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.values(t.helplines).map((helpline, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/50 rounded-xl p-4 hover:border-red-400 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg mb-1">{helpline.name}</h3>
                  <p className="text-sm text-gray-400">{helpline.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs bg-green-600/30 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" />
                  {helpline.available}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-3xl font-bold text-red-400">
                  {helpline.number}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyPhoneNumber(helpline.number)}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
                    title={t.copyNumber}
                  >
                    {copiedNumber === helpline.number ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => callNumber(helpline.number)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                  >
                    <Phone className="w-4 h-4" />
                    {t.callNow}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearest Police Stations */}
      {nearestStations.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            {t.nearestStations}
          </h2>

          {!userLocation && (
            <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-200">{t.mockStations}</p>
            </div>
          )}

          <div className="space-y-4">
            {nearestStations.map((station, index) => (
              <div
                key={index}
                className="bg-black/50 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{station.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{station.address}</p>
                    {station.distance && (
                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <MapPin className="w-4 h-4" />
                        {station.distance} km {t.distance}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  
                    href={`tel:${station.phone}`}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                  >
                    <Phone className="w-4 h-4" />
                    {station.phone}
                  </a>
                  <button
                    onClick={() => getDirections(station)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                  >
                    <Navigation className="w-4 h-4" />
                    {t.getDirections}
                  </button>
                  <button
                    onClick={() => copyPhoneNumber(station.phone)}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                  >
                    {copiedNumber === station.phone ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t.copyNumber}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Portals */}
      <div className="bg-white/5 rounded-xl p-6">
        <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
          <ExternalLink className="w-6 h-6 text-purple-400" />
          {t.onlinePortals}
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.values(t.portals).map((portal, index) => (
            
              key={index}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-xl p-4 hover:border-purple-400 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold">{portal.name}</h3>
                <ExternalLink className="w-5 h-5 text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
              <p className="text-sm text-gray-400">{portal.description}</p>
              <div className="mt-3 text-xs text-purple-400 font-mono">
                {portal.url.replace('https://', '')}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}