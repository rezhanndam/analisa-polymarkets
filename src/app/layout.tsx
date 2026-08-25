import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeatherBot | Auto Trader",
  description: "AI-driven Polymarket weather prediction auto-trader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full h-full bg-[#0e172a] text-slate-200">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
