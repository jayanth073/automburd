import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "AtomQuest | Goal Setting & Tracking Portal",
  description: "Internal performance management portal for Atomberg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-surface-50 text-surface-900 selection:bg-brand-500/30 selection:text-brand-700">
        <ToastProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
