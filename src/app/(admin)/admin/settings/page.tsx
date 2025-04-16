import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { withAuthPage } from "@/lib/utils/withAuthPage";
import { UserRole } from "@/lib/types/models/user";
import { dbService } from "@/lib/db/service";

export default async function AdminSettingsPage() {
  // Ensure the user is authenticated and has admin role
  const user = await withAuthPage({
    roles: [UserRole.Admin],
    redirectTo: '/login',
    forbiddenPath: '/'
  });
  
  // Fetch the user's profile
  await dbService.connect();
  const userProfile = await dbService.user.findById(user.id);
  
  if (!userProfile) {
    throw new Error("User not found");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your administrator account settings
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminSettingsForm initialData={JSON.parse(JSON.stringify(userProfile))} />
        </CardContent>
      </Card>
    </div>
  );
}
