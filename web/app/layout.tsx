import type { Metadata } from "next";
import { PassengerAuthProvider } from "../context/PassengerAuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Lanka Railways - Online Seat Booking Portal",
  description: "Official online seat reservation portal for Sri Lanka Railways express trains.",
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
            position="bottom-left"
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
