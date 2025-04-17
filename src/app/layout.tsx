import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { dbService } from "@/lib/db/service";
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
dayjs.extend(relativeTime);
export async function generateMetadata(): Promise<Metadata> {
  await dbService.connect();
  const title = await systemConfigService.get<string>(
    SystemConfigKey.OrgName,
    "Pilot"
  );
  const description = await systemConfigService.get<string>(
    SystemConfigKey.OrgDesc
  );

  return {
    title,
    description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  await dbService.connect();
  const avatar = await systemConfigService.get<string>(
    SystemConfigKey.OrgAvatar
  );
  const title = await systemConfigService.get<string>(
    SystemConfigKey.OrgName,
    "Pilot"
  );
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <link rel="icon" href={avatar ?? "/favicon.ico"} sizes="any" />
      </head>
      <body className={`${interFont.variable} antialiased`}>
        <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
