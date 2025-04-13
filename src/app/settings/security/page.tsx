"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {ArrowRight, Fingerprint, KeyRound, Shield} from "lucide-react";
import {ChangePasswordForm} from "./components/change-password-form";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Security Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your security settings to protect your account.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <SecurityCard
          icon={<Shield className="h-5 w-5 text-primary"/>}
          title="Password"
          description="Change your password to keep your account secure."
        >
          <ChangePasswordForm/>
        </SecurityCard>

        <SecurityCard
          icon={<Fingerprint className="h-5 w-5 text-primary"/>}
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account."
        >
          <Button className="w-fit mt-4">Enable 2FA</Button>
        </SecurityCard>

        <SecurityCard
          icon={<KeyRound className="h-5 w-5 text-primary"/>}
          title="Active Sessions"
          description="Manage your active sessions and devices."
        >
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="font-medium">1 active session</p>
              <p className="text-sm text-muted-foreground">Last active now</p>
            </div>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </div>
        </SecurityCard>
      </div>
    </div>
  );
}

function SecurityCard({
                        icon,
                        title,
                        description,
                        children,
                      }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col justify-between shadow-none py-0">
      <CardHeader className="pb-3 space-y-1">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
