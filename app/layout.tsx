import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linkuni - 원하시는 서비스를 선택해주세요",
  description: "편리하고 저렴한 구독 서비스. YouTube Premium을 최저가로 이용하세요.",
  keywords: ["YouTube Premium", "유튜브 프리미엄", "구독", "최저가", "Linkuni"],
  authors: [{ name: "Linkuni" }],
  metadataBase: new URL("https://linkuni.site"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://linkuni.site",
    siteName: "Linkuni",
    title: "Linkuni - 원하시는 서비스를 선택해주세요",
    description: "편리하고 저렴한 구독 서비스. YouTube Premium을 최저가로 이용하세요.",
    images: [
      {
        url: "/logo.png",
        width: 819,
        height: 283,
        alt: "Linkuni Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkuni - 원하시는 서비스를 선택해주세요",
    description: "편리하고 저렴한 구독 서비스. YouTube Premium을 최저가로 이용하세요.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  );
}
