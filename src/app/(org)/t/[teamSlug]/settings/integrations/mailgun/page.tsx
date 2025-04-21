import {redirect} from "next/navigation";
import {MailgunIntegrationForm} from "@/components/integrations/mailgun-integration-form";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import withTeam from "@/lib/utils/withTeam";
import {dbService} from "@/lib/db/service";
import {IntegrationType} from "@/lib/types/models/integration";

interface MailgunIntegrationPageProps {
  params: Promise<{
    teamSlug: string;
  }>
}

export default async function MailgunIntegrationPage({params}: MailgunIntegrationPageProps) {
  const {team, membership} = await withTeam((await params));
  const teamId = team._id as string;
  const teamSlug = team.slug as string;

  const currentIntegration = await dbService.integration.findOne({
    team: teamId,
    type: IntegrationType.Mailgun,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Mailgun Integration</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/t/${teamSlug}/settings/integrations`}>
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Back to Integrations
          </Link>
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Configure Mailgun to send and receive emails for your team
      </div>

      <div className="rounded-md border p-6">
        <MailgunIntegrationForm
          initialData={JSON.parse(JSON.stringify(currentIntegration)) ?? null}
        />
      </div>
    </div>
  );
}
