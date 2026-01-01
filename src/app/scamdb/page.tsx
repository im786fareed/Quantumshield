import type { Metadata } from "next";
import ScamDatabase from "@/components/ScamDatabase";

export const metadata: Metadata = {
  title: "Scam Database | QuantumShield",
  description:
    "Browse known scams, fraud patterns, and reported cyber threats.",
  openGraph: {
    title: "Scam Database – QuantumShield",
    description: "Explore known scams and fraud patterns.",
    url: "https://quantumshield.in/scamdb",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <ScamDatabase lang="en" />;
}
