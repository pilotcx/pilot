"use client";
import {useParams} from "next/navigation";
import {useMailing} from "@/components/providers/mailing-provider";
import {useEffect} from "react";
import useApi from "@/hooks/use-api";
import apiService from "@/lib/services/api";
import {useTeam} from "@/components/providers/team-provider";
import EmailDisplay from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailDisplay";
import EmailComposer from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailComposer";
import {parseEmailFrom} from "@/lib/utils/parseEmailFrom";
import {toast} from "sonner";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import gravatar from "gravatar";

export default function EmailSeries() {
  const {team, membership} = useTeam();
  const {conversationId} = useParams();
  const {activeAddress} = useMailing();
  const [getEmails, {data: emails}] = useApi(apiService.getConversationEmails);
  const [sendEmail] = useApi(apiService.sendEmail);

  const load = () => {
    if (!team || !activeAddress || !conversationId) return;
    // call api to retrieve conversation emails, sorted by date
    getEmails(team._id as string, conversationId as string, activeAddress.fullAddress!).then(() => {
    });
  }
  useEffect(() => {
    load();
  }, [activeAddress, conversationId, team]);

  return <>
    <div className={'divide-y'}>
      {emails?.map(email => <div key={email._id?.toString()} className={'py-4'}>
        <EmailDisplay email={email}/>
      </div>)}
    </div>
    <div className={'flex flex-row gap-2 p-4'}>
      <Avatar
        className={'w-10 h-10'}
      >
        <AvatarImage
          src={gravatar.url(activeAddress?.fullAddress!)}
        />
        <AvatarFallback>
          {membership.displayName?.substring(0, 2)?.toUpperCase() || ''}
        </AvatarFallback>
      </Avatar>
      <div className={'flex-1 border rounded-lg p-2'}>
        <EmailComposer
          context={{
            target: emails?.[0]?.from ?? ''
          }}
          onSend={async (content) => {
            if (!emails) return;
            const {email: lastEmailAddress} = parseEmailFrom(emails[emails.length - 1].from);
            const form = new FormData();
            form.append('subject', 'Re: ' + emails[0].subject);
            form.append('html', content);
            form.append('from', activeAddress?.fullAddress!);
            form.append('to', lastEmailAddress);
            form.append('inReplyTo', emails[emails.length - 1]?.messageId!);
            const result = await sendEmail(team._id as string, form);
            toast.success(result.message);
            load();
          }}
        />
      </div>
    </div>
  </>
}
