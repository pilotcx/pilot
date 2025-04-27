import { ReactNode } from "react";
import { dbService } from "@/lib/db/service";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { redirect } from "next/navigation";

export default async function ConfigureLayout({
  children,
}: {
  children: ReactNode;
}) {
  await dbService.connect();

  const isConfigured = await systemConfigService.get<boolean>(
    SystemConfigKey.SystemConfigured,
    false,
    true
  );

  if (isConfigured) {
    redirect("/");
  }

  return children;
}
