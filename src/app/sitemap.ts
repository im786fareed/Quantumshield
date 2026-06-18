import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://quantumshield.in";

  const routes = [
    "",
    "/scanner",
    "/apk",
    "/sms",
    "/downloads",
    "/url",
    "/file",
    "/encryption",
    "/breach",
    "/ransomware",
    "/device",
    "/news",
    "/education",
    "/legal-rights",
    "/aboutai",
    "/scamdb",
    "/aianalyzer",
    "/emergency",
    "/simprotection",
    "/devicescan",
    "/whatsapp",
    "/awareness",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
