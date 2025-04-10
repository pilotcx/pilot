import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ReactNode} from "react";

const interFont = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tower",
  description: "Team Collaboration",
};

export default function RootLayout({children}: { children: ReactNode }) {
  return (
    <html lang="en">
    <body
      className={`${interFont.variable} antialiased`}
    >
    {children}
    </body>
    </html>
  );
}
