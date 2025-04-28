"use client"

import * as React from "react"
import {ArchiveIcon, InboxIcon, PlusIcon, SearchIcon, SendIcon, TrashIcon} from "lucide-react"
import {Sidebar,} from "@/components/ui/sidebar"
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {useMailing} from "@/components/providers/mailing-provider";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import {useTeam} from "@/components/providers/team-provider";
import {parseEmailFrom} from "@/lib/utils/parseEmailFrom";
import {Button} from "@/components/ui/button";

dayjs.extend(relativeTime);

export function MailSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const {addresses, activeAddress, setActiveAddress, conversations} = useMailing();
  const {team} = useTeam();

  return (
    <div className={'w-[300px] border-r flex flex-col h-full'} style={{height: '100%', maxHeight: '100%'}}>
      <div className={'p-4 pb-0 border-b flex-shrink-0 flex flex-col gap-2 bg-sidebar'}>
        <div>
          <Select
            onValueChange={(value) => setActiveAddress?.(addresses.find(x => x._id === value)!)}
          >
            <SelectTrigger className={'bg-background !text-foreground w-full'}>
              {activeAddress?.fullAddress ?? "Select an email address"}
            </SelectTrigger>
            <SelectContent>
              {addresses.map((address) => (
                <SelectItem key={address._id as string} value={address._id as string}>
                  {address.fullAddress}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={'flex flex-row -mx-2 items-center justify-between'}>
          <Select>
            <SelectTrigger
              className={'border-none cursor-pointer h-6 bg-transparent font-semibold shadow-none'}
            >
              <InboxIcon className={'w-4 h-4'}/>
              Inbox
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbox">
                <InboxIcon/>
                Inbox
              </SelectItem>
              <SelectItem value="sent">
                <SendIcon/>
                Sent
              </SelectItem>
              <SelectItem value="archived">
                <ArchiveIcon/>
                Archived
              </SelectItem>
              <SelectItem value="trash">
                <TrashIcon/>
                Trash
              </SelectItem>
            </SelectContent>
          </Select>
          <div className={'flex flex-row items-center gap-2 text-sm font-medium text-muted-foreground pr-2'}>
            Unread
            <Switch/>
          </div>
        </div>
      </div>
      <div className={'flex-1 overflow-y-auto scrollbar-hidden'}>
        {(conversations ?? []).map((conv) => (
          <Link
            href={`/t/${team.slug}/mailing/${conv.conversation._id}`}
            key={conv.conversation._id as string}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
          >
            <div className="flex w-full items-center gap-2">
              <span className={'font-semibold'}>{parseEmailFrom(conv.email.from).name}</span>
              <span className="ml-auto text-xs">{dayjs(conv.email.createdAt as string).fromNow()}</span>
            </div>
            <span className="font-medium text-xs">{conv.email?.subject}</span>
            <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
              {conv.email.summary ?? "(Empty email)"}
            </span>
          </Link>
        ))}
      </div>
      <div className={'p-4'}>
        <Link href={`/t/${team.slug}/mailing/new`}>
          <Button className={'w-full'}>
            <PlusIcon/>
            New Email
          </Button>
        </Link>
      </div>
    </div>
  )
}
