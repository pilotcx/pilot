import type {Metadata} from "next";
import {ReactNode} from "react";
import {systemConfigService} from "@/lib/services/system-config";
import {SystemConfigKey} from "@/lib/types/models/system-config";
import {dbService} from "@/lib/db/service";
import {redirect} from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  await dbService.connect();
  const title = await systemConfigService.get<string>(SystemConfigKey.OrgName, 'Pilot');
  const description = await systemConfigService.get<string>(
    SystemConfigKey.OrgDesc
  );

  return {
    title,
    description,
  };
}

export default async function OrgLayout({children}: { children: ReactNode }) {
  await dbService.connect();
  const configured = await systemConfigService.get<string>(SystemConfigKey.SystemConfigured);
  if (!configured) return redirect('/configure');
  return children;
}
