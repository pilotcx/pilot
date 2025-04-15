"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Step } from "@/hooks/use-multi-step-form";
import { FormProgress } from "./FormProgress";

export const CONFIG_STEPS: Step[] = [
  {
    id: "admin-account",
    title: "Admin Account",
  },
  {
    id: "organization-info",
    title: "Organization Info",
  },
  {
    id: "features",
    title: "Features",
  },
];

interface ConfigurationStepLayoutProps {
  children: ReactNode;
  currentStepIndex: number;
  title?: string;
  description?: string;
}

export function ConfigurationStepLayout({
  children,
  currentStepIndex,
  title = "Organization Setup",
  description = "Complete the form to set up your organization",
}: ConfigurationStepLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-md">
          <CardContent className="p-6 sm:p-8">
            <h1 className="mb-1 text-center text-2xl font-semibold">
              {title}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {description}
            </p>

            <FormProgress
              steps={CONFIG_STEPS}
              currentStepIndex={currentStepIndex}
            />

            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
