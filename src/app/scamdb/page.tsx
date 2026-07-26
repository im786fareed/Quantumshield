import type { Metadata } from "next";
import ScamDatabase from "@/components/ScamDatabase";

export const metadata: Metadata = {
  title: "Scam Database | AdamasVault",
  description:
    "Browse known scams, fraud patterns, and reported cyber threats.",
  openGraph: {
    title: "Scam Database – AdamasVault",
    description: "Explore known scams and fraud patterns.",
    url: "https://AdamasVault.in/scamdb",
    siteName: "AdamasVault",
    type: "website",
  },
};

export default function Page() {
  return <ScamDatabase lang="en" />;
}
