import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { dbService } from "@/lib/db/service";
import { OrganizationForm } from "@/components/admin/organization-form";

export default async function OrganizationSettingsPage() {
  await dbService.connect();
  
  // Fetch all organization settings
  const orgSettings = await systemConfigService.getMultiple([
    SystemConfigKey.OrgName,
    SystemConfigKey.OrgDesc,
    SystemConfigKey.OrgIndustry,
    SystemConfigKey.OrgSize,
    SystemConfigKey.OrgStructure,
    SystemConfigKey.OrgAllowRegistration,
    SystemConfigKey.OrgTeamCreationPermission,
    SystemConfigKey.OrgEmail,
    SystemConfigKey.OrgPhone,
    SystemConfigKey.OrgWebsite,
    SystemConfigKey.OrgAddress,
    SystemConfigKey.OrgState,
    SystemConfigKey.OrgPostalCode,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization information and preferences
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            Update your organization details and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm initialData={orgSettings} />
        </CardContent>
      </Card>
    </div>
  );
}
