"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SystemConfigFormProps {
  initialData: Record<string, any>;
}

export function SystemConfigForm({ initialData }: SystemConfigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState({
    [SystemConfigKey.OrgAllowRegistration]: initialData[SystemConfigKey.OrgAllowRegistration] || false,
    [SystemConfigKey.SystemConfigured]: initialData[SystemConfigKey.SystemConfigured] || false,
  });

  const handleToggle = (key: string, value: boolean) => {
    setConfig({
      ...config,
      [key]: value,
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update system configuration');
      }
      
      toast.success("System configuration updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update system configuration");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Changing system configuration settings can affect the entire application. 
          Make changes carefully.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Registration Settings</CardTitle>
          <CardDescription>
            Configure user registration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="allow-registration">Allow Public Registration</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, users can register accounts without an invitation
              </p>
            </div>
            <Switch
              id="allow-registration"
              checked={config[SystemConfigKey.OrgAllowRegistration]}
              onCheckedChange={(value) => handleToggle(SystemConfigKey.OrgAllowRegistration, value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Manage system operational status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="system-configured">System Configured</Label>
              <p className="text-sm text-muted-foreground">
                Indicates whether the system has completed initial configuration
              </p>
            </div>
            <Switch
              id="system-configured"
              checked={config[SystemConfigKey.SystemConfigured]}
              onCheckedChange={(value) => handleToggle(SystemConfigKey.SystemConfigured, value)}
            />
          </div>
          
          <div className="pt-4">
            <div className="flex items-start gap-2 rounded-md border p-3 bg-muted/50">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">System Configuration Status</p>
                <p className="text-muted-foreground">
                  Changing the system configured status may trigger the setup wizard for users.
                  Only change this if you want to reset the system configuration process.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Separator />
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
