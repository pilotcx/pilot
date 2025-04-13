"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Calendar, MessageSquare, FileText, Settings } from "lucide-react";

interface IntroduceFeaturesStepProps {
  onComplete: () => void;
}

export function IntroduceFeaturesStep({ onComplete }: IntroduceFeaturesStepProps) {
  const features = [
    {
      icon: Users,
      title: "Team Management",
      description: "Create and manage teams, assign roles, and control permissions.",
    },
    {
      icon: Calendar,
      title: "Task Tracking",
      description: "Organize tasks, set deadlines, and track progress across your organization.",
    },
    {
      icon: MessageSquare,
      title: "Team Communication",
      description: "Communicate with team members through posts, comments, and reactions.",
    },
    {
      icon: FileText,
      title: "Document Sharing",
      description: "Share and collaborate on documents within your teams.",
    },
    {
      icon: Settings,
      title: "Customizable Workflows",
      description: "Create custom workflows that match your organization's processes.",
    },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to Your New Workspace</CardTitle>
        <CardDescription>
          Your organization is now set up! Here are some key features to get you started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
              <feature.icon className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-muted p-4 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Next Steps</h3>
              <ul className="space-y-2 text-sm">
                <li>Invite team members to join your organization</li>
                <li>Create your first team and assign members</li>
                <li>Set up your profile and preferences</li>
                <li>Explore the dashboard and available features</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button size="lg" onClick={onComplete}>
            Get Started
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
