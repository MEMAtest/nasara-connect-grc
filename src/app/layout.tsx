import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { OrganizationProvider } from "@/components/organization-provider";
import { SiteStructuredData } from "@/components/seo/SiteStructuredData";
import { ToastProvider } from "@/components/toast-provider";
import { ProgressProvider } from "@/components/progress-provider";
import { EnvironmentBanner } from "@/components/environment-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nasaraconnect.com"),
  title: {
    default: "Governance, Risk & Compliance Platform for FCA-Regulated Firms",
    template: "%s | Nasara Connect",
  },
  description:
    "Unify governance, risk, and compliance with workflows for SM&CR, policies, monitoring, and evidence. Stay audit-ready with Nasara Connect.",
  applicationName: "Nasara Connect",
  openGraph: {
    type: "website",
    siteName: "Nasara Connect",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <EnvironmentBanner />
        <SiteStructuredData />
        <SessionProvider>
          <OrganizationProvider>
            <Suspense fallback={null}>
              <ProgressProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ProgressProvider>
            </Suspense>
          </OrganizationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
