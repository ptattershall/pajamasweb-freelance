import type { Metadata } from "next";
import { JsonLdScript } from "@/components/JsonLdScript";
import { generateOrganizationSchema } from "@/lib/json-ld-schemas";
import { HomePageClient } from "../components/HomePageClient";

export const metadata: Metadata = {
  title: "PajamasWeb - Freelance Web Development & Design",
  description: "Professional freelance web development, UI/UX design, and consulting services. Let's build something amazing together.",
  keywords: ["web development", "web design", "UI/UX design", "freelance developer", "consulting", "web applications"],
  authors: [{ name: "PajamasWeb" }],
  creator: "PajamasWeb",
  openGraph: {
    title: "PajamasWeb - Freelance Web Development & Design",
    description: "Professional freelance web development, UI/UX design, and consulting services. Let's build something amazing together.",
    type: "website",
    url: "https://www.pajamasweb.com",
    siteName: "PajamasWeb",
    locale: "en_US",
    images: [
      {
        url: "https://www.pajamasweb.com/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "PajamasWeb - Freelance Web Development & Design",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PajamasWeb - Freelance Web Development & Design",
    description: "Professional freelance web development, UI/UX design, and consulting services.",
    images: ["https://www.pajamasweb.com/thumbnail.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.pajamasweb.com",
  },
};

export default function Home() {
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      <JsonLdScript schema={organizationSchema} />
      <HomePageClient />
    </>
  );
}
