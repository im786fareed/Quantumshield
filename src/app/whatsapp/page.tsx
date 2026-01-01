import type { Metadata } from "next";
import WhatsAppGhostPairing from "@/components/WhatsAppGhostPairing";

export const metadata: Metadata = {
  title: "WhatsApp Safety Scanner | QuantumShield",
  description:
    "Detect WhatsApp scams, fake links, and ghost pairing threats.",
  openGraph: {
    title: "WhatsApp Safety – QuantumShield",
    description: "Protect your WhatsApp from scams and hijacking.",
    url: "https://quantumshield.in/whatsapp",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <WhatsAppGhostPairing lang="en" />;
}
