"use client";

import {useEffect, useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {Switch} from "@/components/ui/switch";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  FileText,
  Github,
  Loader2,
  Mail,
  MessageSquare,
  Slack,
  Trello
} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {IntegrationStatus, IntegrationType} from "@/lib/types/models/integration";
import {useTeam} from "@/components/providers/team-provider";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
  comingSoon?: boolean;
  type?: IntegrationType;
  configurable?: boolean;
}

interface RealIntegration {
  _id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: any;
  enabled: boolean;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function IntegrationsSettings() {
  const {team} = useTeam();
  const [getIntegrations, {data: loadedIntegrations, loading: isLoadingIntegrations}] = useApi(api.getTeamIntegrations);
  const integrations = loadedIntegrations ?? [];

  // Fetch real integrations once we have the team ID
  useEffect(() => {
    if (team._id) {
      getIntegrations(team._id as string);
    }
  }, [team._id, getIntegrations]);

  // Find Mailgun integration if it exists - memoize this to prevent unnecessary recalculations
  const mailgunIntegration = useMemo(() => {
    return integrations.find(i => i.type === IntegrationType.Mailgun);
  }, [integrations]);

  // Define integration items without initial connected state
  const [integrationItems, setIntegrationItems] = useState<IntegrationItem[]>([
    {
      id: "mailgun",
      name: "Mailgun",
      description: "Send and receive emails using Mailgun's email service.",
      icon: Mail,
      connected: false, // Will be updated in useEffect
      type: IntegrationType.Mailgun,
      configurable: true,
    },
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

  // Update integration items when real integrations change
  useEffect(() => {
    if (integrations.length > 0) {
      setIntegrationItems(prev =>
        prev.map(item => {
          if (item.type) {
            const realIntegration = integrations.find(ri => ri.type === item.type);
            return {...item, connected: !!realIntegration};
          }
          return item;
        })
      );
    }
  }, [integrations]);

  // Memoize the handleToggleIntegration function to prevent unnecessary recreations
  const handleToggleIntegration = useMemo(() => {
    return async (id: string) => {
      // Find the integration
      const integration = integrationItems.find((i) => i.id === id);

      if (integration?.comingSoon) {
        toast.info(`${integration.name} integration is coming soon!`);
        return;
      }

      // For Mailgun or other real integrations, we should handle this differently
      // by calling the API to enable/disable the integration
      if (integration?.type === IntegrationType.Mailgun) {
        // For now, just navigate to the configuration page
        if (team._id) {
          window.location.href = `/t/${team.slug}/settings/integrations/mailgun`;
        } else {
          toast.error('Could not determine team ID');
        }
        return;
      }

      // For other integrations, use the mock behavior
      setIntegrationItems(prev =>
        prev.map((item) =>
          item.id === id
            ? {...item, connected: !item.connected}
            : item
        )
      );

      // Show a toast message
      const isConnecting = !integration?.connected;
      toast.success(
        isConnecting
          ? `Connected to ${id} successfully!`
          : `Disconnected from ${id} successfully!`
      );
    };
  }, [integrationItems, team._id, team.slug]);

  // Memoize the handleConnectIntegration function to prevent unnecessary recreations
  const handleConnectIntegration = useMemo(() => {
    return (id: string) => {
      // Find the integration
      const integration = integrationItems.find((i) => i.id === id);

      if (integration?.comingSoon) {
        toast.info(`${integration.name} integration is coming soon!`);
        return;
      }

      // For Mailgun, navigate to the configuration page
      if (integration?.type === IntegrationType.Mailgun) {
        if (team._id) {
          window.location.href = `/t/${team.slug}/settings/integrations/mailgun`;
        } else {
          toast.error('Could not determine team ID');
        }
        return;
      }

      // Simulate a successful connection after a delay
      setTimeout(() => {
        setIntegrationItems(prev =>
          prev.map((item) =>
            item.id === id
              ? {...item, connected: true}
              : item
          )
        );
        toast.success(`Connected to ${id} successfully!`);
      }, 1500);
    };
  }, [integrationItems, team._id, team.slug]);

  // Memoize the handleConfigureIntegration function to prevent unnecessary recreations
  const handleConfigureIntegration = useMemo(() => {
    return (id: string) => {
      // Find the integration
      const integration = integrationItems.find((i) => i.id === id);

      if (integration?.type === IntegrationType.Mailgun) {
        window.location.href = `/t/${team.slug}/settings/integrations/mailgun`;
      } else {
        // For other integrations, just show a toast
        toast.info(`Opening ${id} configuration...`);
      }
    };
  }, [integrationItems, team.slug]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your team with third-party services
        </p>
      </div>

      <Separator/>

      {isLoadingIntegrations ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
        </div>
      ) : (
        <div className="space-y-8">
          {integrationItems.map((integration) => {
            // For Mailgun, get the real integration status if connected
            let status = null;
            let errorMessage = null;

            if (integration.type === IntegrationType.Mailgun && integration.connected) {
              const realIntegration = integrations.find(ri => ri.type === IntegrationType.Mailgun);
              if (realIntegration) {
                status = realIntegration.status;
                errorMessage = realIntegration.errorMessage;
              }
            }

            return (
              <div
                key={integration.id}
                className="flex items-start justify-between space-x-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                    <integration.icon className="h-5 w-5"/>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{integration.name}</h4>
                      {integration.comingSoon && (
                        <Badge variant="outline" className="ml-1">
                          Coming Soon
                        </Badge>
                      )}
                      {status === IntegrationStatus.Active && (
                        <Badge variant="success" className="ml-1">
                          Active
                        </Badge>
                      )}
                      {status === IntegrationStatus.Failed && (
                        <Badge variant="destructive" className="ml-1">
                          Failed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                    {status === IntegrationStatus.Failed && errorMessage && (
                      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3"/>
                        {errorMessage}
                      </p>
                    )}
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
                      {integration.configurable && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleConfigureIntegration(integration.id)}
                        >
                          Configure
                          <ExternalLink className="ml-1 h-3 w-3"/>
                        </Button>
                      )}
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
            );
          })}
        </div>
      )}
      {/* No dialog needed for separate pages */}
    </div>
  );
}
