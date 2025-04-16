import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { dbService } from "@/lib/db/service";
import { Building, Users, Database, Server } from "lucide-react";

export default async function AdminDashboardPage() {
  await dbService.connect();
  
  // Fetch organization info
  const orgName = await systemConfigService.get<string>(SystemConfigKey.OrgName, "Organization");
  const orgDesc = await systemConfigService.get<string>(SystemConfigKey.OrgDesc, "");
  
  // Count users
  const userCount = await dbService.user.count({});
  
  // Count teams
  const teamCount = await dbService.team.count({});
  
  // Count projects
  const projectCount = await dbService.project.count({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your organization settings and system configuration
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered users in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teams
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamCount}</div>
            <p className="text-xs text-muted-foreground">
              Active teams in the organization
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">
              Projects across all teams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Status
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              System is running normally
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Name</h3>
                <p className="text-sm text-muted-foreground">{orgName}</p>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{orgDesc || "No description provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                • <a href="/admin/users" className="text-primary hover:underline">Manage Users</a>
              </p>
              <p className="text-sm">
                • <a href="/admin/organization" className="text-primary hover:underline">Update Organization Settings</a>
              </p>
              <p className="text-sm">
                • <a href="/admin/system" className="text-primary hover:underline">System Configuration</a>
              </p>
              <p className="text-sm">
                • <a href="/admin/settings" className="text-primary hover:underline">Admin Preferences</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
