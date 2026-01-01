import type { Metadata } from "next";
import AICallAnalyzer from "@/components/AICallAnalyzer";

export const metadata: Metadata = {
  title: "AI Call Analyzer | QuantumShield",
  description:
    "Detect scam calls using AI-powered voice and behavior analysis.",
  openGraph: {
    title: "AI Call Analyzer – QuantumShield",
    description: "Detect scam calls using AI intelligence.",
    url: "https://quantumshield.in/aianalyzer",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <AICallAnalyzer lang="en" />;
}
