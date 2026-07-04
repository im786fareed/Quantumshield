'use client';
import { useState, useEffect } from 'react';
import { Phone, Users, MessageCircle, MessageSquare, Info } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface TrustedContact {
  name: string;
  phone: string;
  relation: string;
}

/* ============================================================
   Emergency Contacts — honest by design.
   Nothing here is automatic: the app cannot listen to calls or
   detect scams in the background from a web page. What it CAN
   do is make asking for help one tap: prewritten alert messages
   to trusted family via WhatsApp/SMS, and direct helpline dials.
   Contacts are stored only on this device (localStorage).
============================================================ */

const CONTENT = {
  en: {
    title: '🚨 Emergency Contacts',
    subtitle: 'One tap to alert family and reach official helplines',

    quickAlert: 'Quick Family Alert',
    quickAlertDesc:
      'If a scam call is pressuring you right now, tap a contact below to send them a prewritten alert by WhatsApp or SMS. You stay in control — nothing is ever sent automatically.',
    noContactsYet: 'Add up to 3 trusted contacts to enable one-tap alerts.',
    honestyNote:
      'QuantumShield does not monitor your calls or send alerts by itself — a web app cannot do that honestly. This tool makes it fast for YOU to call for help.',

    maxContacts: 'You can add a maximum of 3 trusted contacts.',

    trustedContacts: 'Trusted Emergency Contacts',
    trustedContactsDesc: 'Add up to 3 family members you can alert in one tap. Saved only on this device.',
    addContact: 'Add Contact',
    contactName: 'Contact Name',
    contactPhone: 'Phone Number (with country code, e.g. 98765 43210)',
    contactRelation: 'Relation',
    relations: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'],
    saveContact: 'Save Contact',
    cancel: 'Cancel',
    remove: 'Remove',

    alertMessage:
      '🚨 EMERGENCY ALERT from QuantumShield\n\nI may be targeted by a scam call (possible digital arrest / fraud). Please call me RIGHT NOW and stay on the line with me.\n\nIf you cannot reach me: Police 100, Cybercrime helpline 1930.',

    nationalHelplines: 'National Emergency Helplines',
    callNow: 'Call Now',

    helplines: {
      cybercrime: {
        name: 'National Cybercrime Helpline',
        number: '1930',
        description: 'Report cyber frauds',
        available: '24/7',
      },
      police: {
        name: 'Police Emergency',
        number: '100',
        description: 'Immediate police help',
        available: '24/7',
      },
    },
  },

  hi: {
    title: '🚨 आपातकालीन संपर्क',
    subtitle: 'एक टैप में परिवार को अलर्ट और आधिकारिक हेल्पलाइन',

    quickAlert: 'त्वरित पारिवारिक अलर्ट',
    quickAlertDesc:
      'अगर अभी कोई स्कैम कॉल आप पर दबाव डाल रही है, तो नीचे किसी संपर्क पर टैप करके WhatsApp या SMS से पहले से लिखा अलर्ट भेजें। नियंत्रण आपके पास है — कुछ भी अपने आप नहीं भेजा जाता।',
    noContactsYet: 'एक-टैप अलर्ट के लिए 3 तक विश्वसनीय संपर्क जोड़ें।',
    honestyNote:
      'QuantumShield आपकी कॉल की निगरानी नहीं करता और न ही खुद अलर्ट भेजता है — वेब ऐप ईमानदारी से ऐसा नहीं कर सकता। यह टूल आपके लिए मदद मांगना तेज़ बनाता है।',

    maxContacts: 'आप केवल 3 विश्वसनीय संपर्क जोड़ सकते हैं।',

    trustedContacts: 'विश्वसनीय आपातकालीन संपर्क',
    trustedContactsDesc: '3 तक परिजन जोड़ें जिन्हें एक टैप में अलर्ट कर सकें। केवल इसी डिवाइस पर सहेजा जाता है।',
    addContact: 'संपर्क जोड़ें',
    contactName: 'नाम',
    contactPhone: 'फोन नंबर (कंट्री कोड सहित)',
    contactRelation: 'संबंध',
    relations: ['पति/पत्नी', 'माता-पिता', 'बच्चा', 'भाई-बहन', 'मित्र', 'अन्य'],
    saveContact: 'सहेजें',
    cancel: 'रद्द करें',
    remove: 'हटाएं',

    alertMessage:
      '🚨 आपातकालीन अलर्ट (QuantumShield)\n\nमुझ पर स्कैम कॉल (संभावित डिजिटल अरेस्ट/धोखाधड़ी) का दबाव हो सकता है। कृपया मुझे अभी कॉल करें और लाइन पर बने रहें।\n\nसंपर्क न हो तो: पुलिस 100, साइबर क्राइम 1930।',

    nationalHelplines: 'राष्ट्रीय हेल्पलाइन',
    callNow: 'कॉल करें',

    helplines: {
      cybercrime: {
        name: 'राष्ट्रीय साइबर अपराध हेल्पलाइन',
        number: '1930',
        description: 'साइबर अपराध रिपोर्ट करें',
        available: '24/7',
      },
      police: {
        name: 'पुलिस आपातकाल',
        number: '100',
        description: 'तत्काल सहायता',
        available: '24/7',
      },
    },
  },
};

/** Digits only; assume India (91) when a bare 10-digit number is given. */
function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export default function EmergencyContact(_props?: { lang?: 'en' | 'hi' }) {
  const { lang } = useLanguage();
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState<TrustedContact>({
    name: '',
    phone: '',
    relation: '',
  });

  const t = CONTENT[lang];

  useEffect(() => {
    const saved = localStorage.getItem('quantumshield_trusted_contacts');
    if (saved) {
      try { setTrustedContacts(JSON.parse(saved)); } catch { /* corrupt entry — start fresh */ }
    }
  }, []);

  const addTrustedContact = () => {
    if (trustedContacts.length >= 3) {
      alert(t.maxContacts);
      return;
    }
    if (!newContact.name || !newContact.phone || !newContact.relation) return;

    const updated = [...trustedContacts, newContact];
    setTrustedContacts(updated);
    localStorage.setItem('quantumshield_trusted_contacts', JSON.stringify(updated));

    setNewContact({ name: '', phone: '', relation: '' });
    setShowAddContact(false);
  };

  const removeTrustedContact = (index: number) => {
    const updated = trustedContacts.filter((_, i) => i !== index);
    setTrustedContacts(updated);
    localStorage.setItem('quantumshield_trusted_contacts', JSON.stringify(updated));
  };

  const encodedAlert = encodeURIComponent(t.alertMessage);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      {/* Quick Family Alert — real one-tap messages, user-initiated */}
      <div className="bg-black/40 border border-purple-500/40 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <MessageCircle className="w-6 h-6 text-purple-400" />
          {t.quickAlert}
        </h2>
        <p className="text-sm text-gray-300 mb-4">{t.quickAlertDesc}</p>

        {trustedContacts.length === 0 ? (
          <p className="text-sm text-gray-500">{t.noContactsYet}</p>
        ) : (
          <div className="space-y-2">
            {trustedContacts.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 bg-black/30 p-3 rounded-lg">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-400">{c.relation} • {c.phone}</div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${waNumber(c.phone)}?text=${encodedAlert}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-bold transition"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <a
                    href={`sms:${c.phone}?body=${encodedAlert}`}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm font-bold transition"
                  >
                    <MessageSquare className="w-4 h-4" /> SMS
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 leading-snug">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{t.honestyNote}</p>
        </div>
      </div>

      {/* Trusted Contacts */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          {t.trustedContacts}
        </h3>
        <p className="text-sm text-gray-400 mb-3">{t.trustedContactsDesc}</p>

        {trustedContacts.map((c, i) => (
          <div key={i} className="flex justify-between bg-black/30 p-3 rounded mb-2">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-400">{c.relation} • {c.phone}</div>
            </div>
            <button onClick={() => removeTrustedContact(i)} className="text-red-400">
              {t.remove}
            </button>
          </div>
        ))}

        {trustedContacts.length < 3 && (
          <button
            onClick={() => setShowAddContact(true)}
            className="mt-3 bg-blue-600 px-4 py-2 rounded"
          >
            + {t.addContact}
          </button>
        )}

        {showAddContact && (
          <div className="mt-4 bg-black/40 p-4 rounded">
            <input
              className="w-full mb-2 p-2 rounded bg-black/50"
              placeholder={t.contactName}
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
            <input
              className="w-full mb-2 p-2 rounded bg-black/50"
              placeholder={t.contactPhone}
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            />
            <select
              className="w-full mb-2 p-2 rounded bg-black/50"
              value={newContact.relation}
              onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
            >
              <option value="">{t.contactRelation}</option>
              {t.relations.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={addTrustedContact} className="bg-green-600 px-4 py-2 rounded">
                {t.saveContact}
              </button>
              <button onClick={() => setShowAddContact(false)} className="bg-gray-600 px-4 py-2 rounded">
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helplines */}
      <div className="bg-white/5 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-400" />
          {t.nationalHelplines}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.values(t.helplines).map((h, i) => (
            <div key={i} className="bg-red-600/20 border border-red-500/40 rounded-lg p-4">
              <h3 className="font-bold">{h.name}</h3>
              <p className="text-sm text-gray-300">{h.description}</p>
              <a
                href={`tel:${h.number}`}
                className="inline-block mt-2 bg-red-600 px-4 py-2 rounded"
              >
                {t.callNow}: {h.number}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
