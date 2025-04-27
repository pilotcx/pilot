import { dbService } from "@/lib/db/service";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { redirect } from "next/navigation";

export default async function ConfigurePage() {
  await dbService.connect();

  // Always use skipCache=true to ensure we're getting the latest values from the database
  const isConfigured = await systemConfigService.get<boolean>(SystemConfigKey.SystemConfigured, false, true);

  if (isConfigured) {
    redirect('/');
  }

  
  const adminCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepAdminCompleted, false, true);
  const orgCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepOrgCompleted, false, true);
  const featuresCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepFeaturesCompleted, false, true);

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
    // Clear cache to ensure all components get the updated state
    systemConfigService.clearCache();
    redirect('/');
  }
}
