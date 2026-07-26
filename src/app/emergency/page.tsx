import type { Metadata } from "next";
import EmergencyContact from "@/components/EmergencyContact";

export const metadata: Metadata = {
  title: "Emergency Protection & Helpline | AdamasVault",
  description:
    "Get instant emergency help, scam alerts, and trusted contact protection.",
  openGraph: {
    title: "Emergency Protection – AdamasVault",
    description:
      "Immediate help during scams, fraud, and cyber emergencies.",
    url: "https://AdamasVault.in/emergency",
    siteName: "AdamasVault",
    type: "website",
  },
};

export default function Page() {
  return <EmergencyContact lang="en" />;
}
