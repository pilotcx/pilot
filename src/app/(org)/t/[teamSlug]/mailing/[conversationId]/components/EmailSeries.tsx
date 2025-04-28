"use client";
import {useParams} from "next/navigation";
import {useMailing} from "@/components/providers/mailing-provider";
import {useEffect} from "react";
import useApi from "@/hooks/use-api";
import apiService from "@/lib/services/api";
import {useTeam} from "@/components/providers/team-provider";
import EmailDisplay from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailDisplay";
import EmailComposer from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailComposer";

export default function EmailSeries() {
  const {team} = useTeam();
  const {conversationId} = useParams();
  const {activeAddress} = useMailing();
  const [getEmails, {data: emails}] = useApi(apiService.getConversationEmails);

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
    />
  </>
}
