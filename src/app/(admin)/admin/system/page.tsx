import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { dbService } from "@/lib/db/service";
import { SystemConfigForm } from "@/components/admin/system-config-form";

export default async function SystemConfigPage() {
  await dbService.connect();
  
  // Fetch all system configuration settings
  const systemConfig = await systemConfigService.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground">
          Manage system-wide settings and configurations
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure global system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemConfigForm initialData={systemConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
