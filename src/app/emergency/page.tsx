import type { Metadata } from "next";
import EmergencyContact from "@/components/EmergencyContact";

export const metadata: Metadata = {
  title: "Emergency Protection & Helpline | QuantumShield",
  description:
    "Get instant emergency help, scam alerts, and trusted contact protection.",
  openGraph: {
    title: "Emergency Protection – QuantumShield",
    description:
      "Immediate help during scams, fraud, and cyber emergencies.",
    url: "https://quantumshield.in/emergency",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <EmergencyContact lang="en" />;
}
