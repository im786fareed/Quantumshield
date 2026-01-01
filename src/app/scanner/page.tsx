import type { Metadata } from "next";
import Scanner from "@/components/Scanner";

export const metadata: Metadata = {
  title: "AI Scam Scanner | QuantumShield",
  description:
    "Scan messages, links, and content using AI to detect scams, phishing, and fraud instantly.",
  openGraph: {
    title: "AI Scam Scanner – QuantumShield",
    description:
      "Detect scams, phishing, and fraud using AI-powered analysis.",
    url: "https://quantumshield.in/scanner",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <Scanner lang="en" />;
}
