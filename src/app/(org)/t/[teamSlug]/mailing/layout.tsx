import MailingProvider from "@/components/providers/mailing-provider";
import {ReactNode} from "react";
import withTeam from "@/lib/utils/withTeam";
import {emailAddressService} from "@/lib/services/email-address";
import {EmailAddress} from "@/lib/types/models/email-address";
import {MailSidebar} from "@/components/mail-sidebar";

export default async function MailingLayout({children, params}: {
  children: ReactNode,
  params: Promise<{ teamSlug: string }>
}) {
  const {team, membership} = await withTeam(await params);
  const addresses = await emailAddressService.getTeamMemberEmailAddresses(team._id.toString(), membership._id.toString());

  return <MailingProvider
    addresses={JSON.parse(JSON.stringify(addresses)) as EmailAddress[]}
  >
    <div className={'relative h-full flex flex-row'} style={{ height: '100%', overflow: 'hidden' }}>
      <MailSidebar/>
      <div className={'flex-1 flex flex-col items-center justify-center'}>
        {children}
      </div>
    </div>
  </MailingProvider>
}
