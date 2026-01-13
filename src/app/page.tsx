import Link from 'next/link';
// Import your icons here (Mic, Activity, etc.)

export default function Home() {
  // 1. Move your data array INSIDE the function
  const terminalTabs = [
    { title: "AI Call Analyzer", icon: "🎙️", link: "/aianalyzer" },
    { title: "Device Scanner", icon: "🔍", link: "/scanner" },
    { title: "Evidence Vault", icon: "📦", link: "/vault" },
    { title: "Privacy Shield", icon: "🛡️", link: "/privacy" },
    { title: "Police Reporter", icon: "📜", link: "/report" },
    { title: "File Encryption", icon: "🔐", link: "/encryption" },
    { title: "Threat Learning", icon: "🎬", link: "/education" },
  ];

  // 2. The return statement MUST be inside the function
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10">
      {terminalTabs.map((tab, i) => (
        <Link 
          href={tab.link} 
          key={i} 
          className="p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] hover:bg-white/5 transition-all"
        >
          <div className="mb-4 text-2xl">{tab.icon}</div>
          <h3 className="font-bold uppercase italic">{tab.title}</h3>
        </Link>
      ))}
    </div>
  );
}