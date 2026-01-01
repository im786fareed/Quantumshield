import type { Metadata } from "next";
import ScamAwarenessCenter from "@/components/ScamAwarenessCenter";

export const metadata: Metadata = {
  title: "Scam Awareness | QuantumShield",
  description: "Latest scam alerts and awareness updates.",
};

export default function Page() {
  return <ScamAwarenessCenter lang="en" />;
}
