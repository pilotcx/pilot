"use client";

import { Card } from "@/components/ui/card";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsMeLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container py-6">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
