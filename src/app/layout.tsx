import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeagueFlow - Sports League Management",
  description: "Complete sports league management platform with real-time updates, automated scheduling, and fan engagement features.",
  keywords: ["sports", "league", "management", "scheduling", "teams", "matches"],
  authors: [{ name: "LeagueFlow Team" }],
  creator: "LeagueFlow",
  publisher: "LeagueFlow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "LeagueFlow - Sports League Management",
    description: "Complete sports league management platform with real-time updates, automated scheduling, and fan engagement features.",
    url: "/",
    siteName: "LeagueFlow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeagueFlow - Sports League Management",
    description: "Complete sports league management platform with real-time updates, automated scheduling, and fan engagement features.",
  },
  manifest: "/manifest.json",
  themeColor: "#0ea5e9",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
