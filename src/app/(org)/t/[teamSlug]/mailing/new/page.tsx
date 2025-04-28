"use client";
import EmailComposer from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailComposer";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {MultiEmailInput} from "@/components/ui/multi-email-input";
import useApi from "@/hooks/use-api";
import apiService from "@/lib/services/api";
import {useTeam} from "@/components/providers/team-provider";
import {toast} from "sonner";
import {useMailing} from "@/components/providers/mailing-provider";

export default function NewEmailPage() {
  const {team} = useTeam();
  const {activeAddress} = useMailing();
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [ccEnabled, setCcEnabled] = useState(false);
  const [bccEnabled, setBccEnabled] = useState(false);
  const [sendEmail] = useApi(apiService.sendEmail);

  async function onSend(html: string) {
    const form = new FormData();
    form.append('subject', subject);
    form.append('html', html);
    form.append('from', activeAddress?.fullAddress as string);
    for (let email of to) form.append('to[]', email);
    for (let email of cc) form.append('cc[]', email);
    for (let email of bcc) form.append('bcc[]', email);
    const result = await sendEmail(team._id as string, form);
    toast.success(result.message);
  }

  return <div className={'container max-w-[1000px]'}>
    <div className={'border rounded-xl overflow-hidden'}>
      <div className={'bg-primary text-primary-foreground px-4 py-2'}>
        Compose Email
      </div>
      <div className={'divide-y border-b'}>
        <div className={'flex flex-row items-center gap-0.5 pl-2'}>
          <span className={'text-xs'}>To:</span>
          <div className="flex-1">
            <MultiEmailInput
              value={to}
              onChange={setTo}
              className={'border-none shadow-none rounded-none'}
              placeholder={'example@email.com'}
            />
          </div>
          <div className={'flex flex-row pr-2 gap-2 text-sm'}>
            <div className={'cursor-pointer'} onClick={() => {
              setCcEnabled(!ccEnabled);
              setCc([]);
            }}>Cc
            </div>
            <div className={'cursor-pointer'} onClick={() => {
              setBccEnabled(!bccEnabled);
              setBcc([]);
            }}>Bcc
            </div>
          </div>
        </div>
        {ccEnabled && (
          <div className={'flex flex-row items-center gap-0.5 pl-2'}>
            <span className={'text-xs'}>Cc:</span>
            <div className="flex-1">
              <MultiEmailInput
                value={cc}
                onChange={setCc}
                className={'border-none shadow-none rounded-none'}
                placeholder={'example@email.com'}
              />
            </div>
          </div>
        )}
        {bccEnabled && (
          <div className={'flex flex-row items-center gap-0.5 pl-2'}>
            <span className={'text-xs'}>Bcc:</span>
            <div className="flex-1">
              <MultiEmailInput
                value={bcc}
                onChange={setBcc}
                className={'border-none shadow-none rounded-none'}
                placeholder={'example@email.com'}
              />
            </div>
          </div>
        )}
        <Input
          className={'border-none shadow-none'}
          placeholder={'Subject'}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <EmailComposer contentClassName={'h-[600px] overflow-y-auto'} onSend={onSend}/>
    </div>
  </div>
}
