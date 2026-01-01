import type { Metadata } from "next";
import APKGuardian from "@/components/APKGuardian";

export const metadata: Metadata = {
  title: "AI Scam APK Scanner | QuantumShield",
  description:
    "Scan APK files using AI to detect malware, spyware, and scam-based Android applications.",
  openGraph: {
    title: "AI Scam APK Scanner – QuantumShield",
    description:
      "Detect malicious APKs and Android scams using AI-powered analysis.",
    url: "https://quantumshield.in/apk",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <APKGuardian lang="en" />;
}
