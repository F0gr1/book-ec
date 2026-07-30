import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { NextAuthProvider } from "./lib/nexr-auth/provider";
import { Suspense } from "react";
import Loading from "./loging";

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Book EC",
  description: "購入者だけが本文を読める電子書籍ストア",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>
        <NextAuthProvider>
          <Header />
          <Suspense fallback={<Loading/>}>{children}</Suspense>
        </NextAuthProvider>
      </body>
    </html>
  );
}
