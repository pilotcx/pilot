import {Inter} from "next/font/google";
import "./globals.css";
import {ReactNode} from "react";
import {Toaster} from "sonner";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default async function RootLayout({children}: { children: ReactNode }) {
  return (
    <html lang="en">
    <body className={`${interFont.variable} antialiased`}>
    {children}
    <Toaster position="top-right"/>
    </body>
    </html>
  );
}
