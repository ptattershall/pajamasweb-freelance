import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "PajamasWeb - Freelance Web Development & Design",
  description: "Professional freelance web development, UI/UX design, and consulting services",
  keywords: ["web design", "web development", "freelance developer", "UI/UX design", "web development services"],
  authors: [{ name: "PajamasWeb" }],
  creator: "PajamasWeb",
  openGraph: {
    title: "PajamasWeb - Freelance Web Development & Design",
    description: "Professional freelance web development, UI/UX design, and consulting services",
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
    description: "Professional freelance web development, UI/UX design, and consulting services",
    images: ["https://www.pajamasweb.com/thumbnail.png"],
    creator: "@pajamasweb",
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
        <a
          href="#main-content"
          className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:w-auto focus:h-auto focus:m-0 focus:overflow-visible focus:[clip:auto]"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
