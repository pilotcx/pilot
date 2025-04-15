import { dbService } from "@/lib/db/service";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { redirect } from "next/navigation";

export default async function ConfigurePage() {
  await dbService.connect();

  const isConfigured = await systemConfigService.get<boolean>(SystemConfigKey.SystemConfigured, false);

  if (isConfigured) {
    redirect('/');
  }

  // Check which configuration steps have been completed
  const adminCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepAdminCompleted, false);
  const orgCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepOrgCompleted, false);
  const featuresCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepFeaturesCompleted, false);

  // Redirect to the appropriate step
  if (!adminCompleted) {
    redirect('/configure/admin');
  } else if (!orgCompleted) {
    redirect('/configure/organization');
  } else if (!featuresCompleted) {
    redirect('/configure/features');
  } else {
    // If all steps are completed but SystemConfigured is false, set it to true
    await systemConfigService.set(SystemConfigKey.SystemConfigured, true);
    redirect('/');
  }
}
