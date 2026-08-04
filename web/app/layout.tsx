import type { Metadata } from "next";
import { PassengerAuthProvider } from "../context/PassengerAuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const siteName = "Sri Lanka Railways";
const siteDescription =
  "The official online platform for Sri Lanka Railways. Book train seats, view schedules, and manage e-tickets for travel across Sri Lanka.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Online Seat Booking Portal`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Sri Lanka Railways",
    "SLR",
    "train schedule Sri Lanka",
    "railway transport",
    "Sri Lanka travel",
    "train booking",
    "online seat reservation",
    "e-ticket Sri Lanka",
  ],
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "travel",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName,
    title: `${siteName} | Online Seat Booking Portal`,
    description: siteDescription,
    images: [
      {
        url: "/logo.png",
        width: 622,
        height: 401,
        alt: "Sri Lanka Railways logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Online Seat Booking Portal`,
    description: siteDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <PassengerAuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
              },
            }}
          />
          {children}
        </PassengerAuthProvider>
      </body>
    </html>
  );
}
