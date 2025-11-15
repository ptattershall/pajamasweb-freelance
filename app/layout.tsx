import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLdScript } from "@/components/JsonLdScript";
import { generateOrganizationSchema } from "@/lib/json-ld-schemas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PJais.ai - AI-Powered Web Design & Development",
  description: "Professional web design, development, and AI-powered services for your business",
  keywords: ["web design", "web development", "AI services", "digital strategy"],
  authors: [{ name: "PJais.ai" }],
  creator: "PJais.ai",
  openGraph: {
    title: "PJais.ai - AI-Powered Web Design & Development",
    description: "Professional web design, development, and AI-powered services for your business",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "PJais.ai",
    locale: "en_US",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/og`,
        width: 1200,
        height: 630,
        alt: "PJais.ai",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PJais.ai - AI-Powered Web Design & Development",
    description: "Professional web design, development, and AI-powered services for your business",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/og`],
    creator: "@pjaisai",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLdScript schema={organizationSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
