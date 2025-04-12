"use client";

import {Card} from "@/components/ui/card";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({children}: SettingsLayoutProps) {
  return (
    <div className="container py-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Team Settings</h1>
          <p className="text-muted-foreground">
            Manage your team settings and preferences
          </p>
        </div>
        <Card className="p-6">{children}</Card>
      </div>
    </div>
  );
}
