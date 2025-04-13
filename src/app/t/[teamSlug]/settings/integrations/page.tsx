"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Github, 
  Slack, 
  Trello, 
  FileText, 
  Calendar, 
  MessageSquare,
  ExternalLink
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
  comingSoon?: boolean;
}

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "github",
      name: "GitHub",
      description: "Connect your GitHub repositories to sync issues and pull requests.",
      icon: Github,
      connected: false,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications and updates directly in your Slack channels.",
      icon: Slack,
      connected: false,
    },
    {
      id: "trello",
      name: "Trello",
      description: "Sync your Trello boards and cards with your team projects.",
      icon: Trello,
      connected: false,
    },
    {
      id: "google-docs",
      name: "Google Docs",
      description: "Collaborate on documents and spreadsheets within your team.",
      icon: FileText,
      connected: false,
      comingSoon: true,
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync team events and deadlines with your Google Calendar.",
      icon: Calendar,
      connected: false,
      comingSoon: true,
    },
    {
      id: "discord",
      name: "Discord",
      description: "Connect your Discord server for team communication.",
      icon: MessageSquare,
      connected: false,
      comingSoon: true,
    },
  ]);

  const handleToggleIntegration = (id: string) => {
    // Find the integration
    const integration = integrations.find((i) => i.id === id);
    
    if (integration?.comingSoon) {
      toast.info(`${integration.name} integration is coming soon!`);
      return;
    }
    
    // Toggle the connected state
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
    
    // Show a toast message
    const isConnecting = !integrations.find((i) => i.id === id)?.connected;
    toast.success(
      isConnecting
        ? `Connected to ${id} successfully!`
        : `Disconnected from ${id} successfully!`
    );
  };

  const handleConnectIntegration = (id: string) => {
    // Find the integration
    const integration = integrations.find((i) => i.id === id);
    
    if (integration?.comingSoon) {
      toast.info(`${integration.name} integration is coming soon!`);
      return;
    }
    
    // In a real app, this would open an OAuth flow or similar
    toast.info(`Opening ${id} authorization...`);
    
    // Simulate a successful connection after a delay
    setTimeout(() => {
      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? { ...integration, connected: true }
            : integration
        )
      );
      toast.success(`Connected to ${id} successfully!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your team with third-party services
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-8">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-start justify-between space-x-4"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                <integration.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{integration.name}</h4>
                  {integration.comingSoon && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integration.connected ? (
                <>
                  <Switch
                    checked={integration.connected}
                    onCheckedChange={() => handleToggleIntegration(integration.id)}
                    disabled={integration.comingSoon}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => window.open("#", "_blank")}
                  >
                    Configure
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectIntegration(integration.id)}
                  disabled={integration.comingSoon}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
