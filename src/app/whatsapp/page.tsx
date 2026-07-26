import type { Metadata } from "next";
import WhatsAppGhostPairing from "@/components/WhatsAppGhostPairing";

export const metadata: Metadata = {
  title: "WhatsApp Safety Scanner | AdamasVault",
  description:
    "Detect WhatsApp scams, fake links, and ghost pairing threats.",
  openGraph: {
    title: "WhatsApp Safety – AdamasVault",
    description: "Protect your WhatsApp from scams and hijacking.",
    url: "https://AdamasVault.in/whatsapp",
    siteName: "AdamasVault",
    type: "website",
  },
};

export default function Page() {
  return <WhatsAppGhostPairing lang="en" />;
}
