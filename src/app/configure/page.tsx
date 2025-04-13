import { OrganizationSetupForm } from "@/app/configure/components/OrganizationSetupForm";
import { dbService } from "@/lib/db/service";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { redirect } from "next/navigation";

export default async function ConfigurePage() {
  await dbService.connect();

  const isConfigured = await systemConfigService.get<boolean>(SystemConfigKey.SystemConfigured, false);
  console.log('is configured', isConfigured);

  if (isConfigured) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-4xl">
        <OrganizationSetupForm />
      </div>
    </div>
  );
}
