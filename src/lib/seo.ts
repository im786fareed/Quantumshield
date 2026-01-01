import type { Metadata } from "next";

export function createMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const baseUrl = "https://quantumshield.in";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: "QuantumShield",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
