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

export default function EmailSeries() {
  const {team} = useTeam();
  const {conversationId} = useParams();
  const {activeAddress} = useMailing();
  const [getEmails, {data: emails}] = useApi(apiService.getConversationEmails);
  const [sendEmail] = useApi(apiService.sendEmail);

  useEffect(() => {
    if (!team || !activeAddress || !conversationId) return;
    // call api to retrieve conversation emails, sorted by date
    getEmails(team._id as string, conversationId as string, activeAddress.fullAddress!).then(() => {
      console.log(emails);
    });
  }, [activeAddress, conversationId, team]);

  return <>
    <div className={'divide-y'}>
      {emails?.map(email => <div key={email._id?.toString()} className={'py-4'}>
        <EmailDisplay email={email}/>
      </div>)}
    </div>
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
        console.log(result);
      }}
    />
  </>
}
