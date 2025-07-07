import type { Metadata } from "next";
import "./globals.css";
import ClientOnly from "./ClientOnly";
import Providers from "./providers";
import Header from "./header/Header";
import StoreClient from "./StoreClient";
import Footer from "./footer/Footer";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "로츠고 : 로스트아크 숙제 및 정보, 일정 관리",
  description: "로스트아크 숙제 체크와 골드 수급을 한눈에! 캐릭터별 숙제, 레이드, 큐브 등 일일/주간 콘텐츠와 개인, 길드 일정을 편리하게 관리하세요.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:title" content="로츠고 - 로스트아크 숙제 및 일정 관리" />
        <meta property="og:description" content="로스트아크 유저를 위한 숙제 체크, 길드 일정, 전투 정보 확인 기능까지 제공하는 종합 관리 도구입니다." />
        <meta property="og:image" content="https://lotsgo.kr/thumbnail.jpg" />
        <meta property="og:url" content="https://lotsgo.kr" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="로츠고 - 로스트아크 숙제 관리 도구" />
        <meta name="twitter:description" content="숙제 체크와 전투 정보 확인, 길드 일정까지 한번에!" />
        <meta name="twitter:image" content="https://lotsgo.kr/thumbnail.jpg" />
      </head>
      <body>
        <ClientOnly>
          <StoreClient>
            <Providers>
              <Header/>
              {children}
              <Footer/>
            </Providers>
          </StoreClient>
        </ClientOnly>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1236449818258742"
          crossOrigin="anonymous"
        />
        <Analytics />
      </body>
    </html>
  );
}
