"use client";

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Integration, IntegrationStatus, MailgunConfig} from "@/lib/types/models/integration";
import {AlertCircle, CheckCircle2, Copy, ExternalLink, GlobeIcon, Info, Loader2, RefreshCw} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Separator} from "@/components/ui/separator";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTeam} from "@/components/providers/team-provider";

// Define the form schema
const mailgunFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  apiKey: z.string().min(1, "API key is required"),
  webhookSigningKey: z.string().min(1, "Webhook signing key is required"),
  inboundEnabled: z.boolean().default(false).optional(),
  outboundEnabled: z.boolean().default(true).optional(),
});

type MailgunFormValues = z.infer<typeof mailgunFormSchema>;

interface MailgunIntegrationFormProps {
  initialData: Integration | null;
}

export function MailgunIntegrationForm({initialData}: MailgunIntegrationFormProps) {
  const {team} = useTeam();
  const [createOrUpdateMailgun, {loading: isSubmitting}] = useApi(api.createOrUpdateMailgunIntegration);
  const [verifyApiKey, {loading: isVerifying}] = useApi(api.verifyMailgunApiKey);
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    // Generate webhook URL based on team ID
    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : '';
    return `${baseUrl}/api/webhooks/mailgun/${team._id}`;
  });
  const router = useRouter();

  // State for domains
  const [domains, setDomains] = useState<any[]>([]);
  const [apiKeyVerified, setApiKeyVerified] = useState<boolean>(false);
  const [apiKeyValue, setApiKeyValue] = useState<string>("");
  const [isVerifyingManually, setIsVerifyingManually] = useState<boolean>(false);

  // Initialize the form with default values or existing integration data
  const form = useForm<MailgunFormValues>({
    resolver: zodResolver(mailgunFormSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        ...(initialData.config as MailgunConfig),
      }
      : {
        name: "Mailgun Email",
        apiKey: "",
        webhookSigningKey: "",
        inboundEnabled: false,
        outboundEnabled: true,
      },
  });

  // Verify the API key if it exists in the initial data
  useEffect(() => {
    if (initialData?.config?.apiKey) {
      const apiKey = initialData.config.apiKey as string;
      setApiKeyValue(apiKey);
      handleVerifyApiKey(apiKey);
    }
  }, [initialData]);

  // Function to verify API key and fetch domains
  const handleVerifyApiKey = async (apiKey: string) => {
    if (!apiKey) {
      toast.error("Please enter an API key");
      return;
    }

    setIsVerifyingManually(true);
    setApiKeyValue(apiKey);

    try {
      const {data} = await verifyApiKey(apiKey);

      if (!data.valid) {
        toast.error("Invalid Mailgun API key");
        setApiKeyVerified(false);
        setDomains([]);
        return;
      }

      setApiKeyVerified(true);
      setDomains(data.domains || []);
      toast.success("API key verified successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to verify API key");
      setApiKeyVerified(false);
      setDomains([]);
    } finally {
      setIsVerifyingManually(false);
    }
  };

  async function onSubmit(values: MailgunFormValues) {
    // Don't allow submission if API key is not verified
    if (!apiKeyVerified) {
      toast.error("Please verify your Mailgun API key first");
      return;
    }

    try {
      const {data} = await createOrUpdateMailgun(team._id!.toString(), values);
      toast.success("Mailgun integration saved successfully");
      router.replace(`/t/${team.slug}/settings/integrations`)
    } catch (error: any) {
      toast.error(error.message || "Failed to save Mailgun integration");
    }
  }

  // Function to copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {initialData && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Status:</h2>
            {initialData.status === IntegrationStatus.Active ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3"/>
                Active
              </Badge>
            ) : initialData.status === IntegrationStatus.Failed ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3"/>
                Failed
              </Badge>
            ) : (
              <Badge variant="outline">{initialData.status}</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(initialData.updatedAt as string).toLocaleString()}
          </div>
        </div>
      )}

      {initialData && initialData.status === IntegrationStatus.Failed && initialData.errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4"/>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{initialData.errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Integration Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a name for this integration" {...field} />
                      </FormControl>
                      <FormDescription>
                        A friendly name to identify this integration
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <Separator/>

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <div className="flex gap-2">
                        <FormControl className="flex-1">
                          <Input
                            type="password"
                            placeholder="Enter your Mailgun API key"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleVerifyApiKey(field.value)}
                          disabled={isVerifying || isVerifyingManually}
                        >
                          {isVerifying || isVerifyingManually ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                          ) : (
                            <RefreshCw className="h-4 w-4"/>
                          )}
                          Verify
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {apiKeyVerified ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3"/>
                            Verified
                          </Badge>
                        ) : field.value ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3"/>
                            Not Verified
                          </Badge>
                        ) : null}
                      </div>
                      <FormDescription>
                        Your Mailgun private API key
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhookSigningKey"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Webhook Signing Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your Mailgun webhook signing key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Mailgun webhook signing key for verifying webhook requests
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <Separator/>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="outboundEnabled"
                    render={({field}) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Outbound Email</FormLabel>
                          <FormDescription>
                            Allow sending emails through Mailgun
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inboundEnabled"
                    render={({field}) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Inbound Email</FormLabel>
                          <FormDescription>
                            Allow receiving emails through Mailgun webhooks
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Integration"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4 pt-4">
          {domains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {apiKeyVerified ? (
                <>
                  <GlobeIcon className="h-12 w-12 text-muted-foreground mb-4"/>
                  <h3 className="text-lg font-medium">No domains found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No domains are available in your Mailgun account.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    asChild
                  >
                    <Link href="https://app.mailgun.com/mg/domains/new" target="_blank" rel="noopener noreferrer">
                      Add Domain in Mailgun
                      <ExternalLink className="ml-2 h-4 w-4"/>
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4"/>
                  <h3 className="text-lg font-medium">API Key Not Verified</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please enter and verify your Mailgun API key to see available domains.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain: any) => (
                    <TableRow key={domain.id}>
                      <TableCell className="font-medium">{domain.name}</TableCell>
                      <TableCell>
                        {domain.state === 'active' ? (
                          <Badge variant="success" className="capitalize">{domain.state}</Badge>
                        ) : (
                          <Badge variant="outline" className="capitalize">{domain.state}</Badge>
                        )}
                        {domain.is_disabled && (
                          <Badge variant="destructive" className="ml-2">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(domain.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Domains are managed in your Mailgun account
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerifyApiKey(form.getValues('apiKey'))}
              disabled={isVerifying || isVerifyingManually}
            >
              {isVerifying || isVerifyingManually ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              ) : (
                <RefreshCw className="mr-2 h-4 w-4"/>
              )}
              Refresh Domains
            </Button>
          </div>

        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4 pt-4">
          <Alert>
            <Info className="h-4 w-4"/>
            <AlertTitle>Setup Instructions</AlertTitle>
            <AlertDescription>
              To receive emails, you need to configure a webhook in your Mailgun dashboard.
              Copy the URL below and add it as a webhook endpoint in Mailgun.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="font-medium">Webhook URL</div>
            <div className="flex items-center gap-2">
              <Input value={webhookUrl} readOnly/>
              <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                <Copy className="h-4 w-4"/>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Use this URL in your Mailgun dashboard to configure inbound email routing
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Mailgun Dashboard</div>
            <Button variant="outline" asChild>
              <Link href="https://app.mailgun.com/mg/receiving/routes" target="_blank" rel="noopener noreferrer">
                Open Mailgun Dashboard
                <ExternalLink className="ml-2 h-4 w-4"/>
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Go to Receiving &gt; Create Route in your Mailgun dashboard
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Configuration Steps</div>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to your Mailgun dashboard</li>
              <li>Navigate to Receiving &gt; Create Route</li>
              <li>Set up a filter expression (e.g., <code>match_recipient(".*@yourdomain.com")</code>)</li>
              <li>Add an action: "Forward" and paste the webhook URL</li>
              <li>Save the route</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
