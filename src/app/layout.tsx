import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { dbService } from "@/lib/db/service";
import { Toaster } from "sonner";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  await dbService.connect();
  const title = await systemConfigService.get<string>(SystemConfigKey.OrgName, "Tower");
  const description = await systemConfigService.get<string>(
    SystemConfigKey.OrgDesc
  );

  return {
    title,
    description,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await dbService.connect();
  const avatar = await systemConfigService.get<string>(SystemConfigKey.OrgAvatar);
  const title = await systemConfigService.get<string>(SystemConfigKey.OrgName, "Tower");
  return (
    <html lang="en">
    <head>
      <title>{title}</title>
      <link rel="icon" href={avatar ?? "/favicon.ico"} sizes="any" />
    </head>
    <body className={`${interFont.variable} antialiased`}>
    {children}
    <Toaster position="top-right" />
    </body>
    </html>
  );
}
