import type { Metadata } from "next";
import Education from "@/components/Education";

export const metadata: Metadata = {
  title: "Cyber Safety Education | QuantumShield",
  description:
    "Learn how to protect yourself from online scams, fraud, and cyber threats.",
  openGraph: {
    title: "Cyber Safety Education – QuantumShield",
    description: "Learn how scams work and how to stay safe online.",
    url: "https://quantumshield.in/education",
    siteName: "QuantumShield",
    type: "website",
  },
};

export default function Page() {
  return <Education lang="en" />;
}
