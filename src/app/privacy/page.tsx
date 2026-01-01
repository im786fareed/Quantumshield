import type { Metadata } from "next";
import PrivacyShield from "@/components/PrivacyShield";

export const metadata: Metadata = {
  title: "Privacy Policy | QuantumShield",
  description:
    "Understand how QuantumShield protects your data and privacy.",
  openGraph: {
    title: "Privacy Policy – QuantumShield",
    description: "Your privacy and data protection explained clearly.",
    url: "https://quantumshield.in/privacy",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <PrivacyShield lang="en" />;
}
