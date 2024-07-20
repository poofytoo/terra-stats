import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameDataProvider } from "@/hooks/GameDataProvider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terra Stats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameDataProvider>
          {children}
        </GameDataProvider>
      </body>
    </html>
  );
}
