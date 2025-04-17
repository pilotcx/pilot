import MailingProvider from "@/components/providers/mailing-provider";
import {ReactNode} from "react";
import withTeam from "@/lib/utils/withTeam";
import {emailAddressService} from "@/lib/services/email-address";
import {EmailAddress} from "@/lib/types/models/email-address";

export default async function MailingLayout({children, params}: {
  children: ReactNode,
  params: Promise<{ teamSlug: string }>
}) {
  const {team, membership} = await withTeam(await params);
  const addresses = await emailAddressService.getTeamMemberEmailAddresses(team._id.toString(), membership._id.toString());

  return <MailingProvider
    addresses={JSON.parse(JSON.stringify(addresses)) as EmailAddress[]}
  >
    {children}
  </MailingProvider>
}
