"use client"

import * as React from "react"
import {ArchiveIcon, InboxIcon, SearchIcon, SendIcon, TrashIcon} from "lucide-react"
import {Sidebar,} from "@/components/ui/sidebar"
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {useMailing} from "@/components/providers/mailing-provider";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function MailSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const {addresses, activeAddress, setActiveAddress, conversations} = useMailing();

  return (
    <div className={'max-w-[300px] border-r flex flex-col h-full'} style={{height: '100%', maxHeight: '100%'}}>
      <div className={'p-4 border-b flex-shrink-0 flex flex-col gap-2 bg-sidebar'}>
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
        <div className={'flex flex-row -mx-2 -mb-2 items-center justify-between'}>
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
      <div className={'bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60'}>
        <div className={'relative'}>
          <SearchIcon
            className={'left-2 top-2.5 absolute text-muted-foreground w-4 h-4'}
          />
          <Input
            className={'w-full shadow-none bg-background pl-7'}
            placeholder={'Search...'}
          />
        </div>
      </div>
      <div className={'flex-1 h-full overflow-y-auto scrollbar-hidden'}>
        {(conversations ?? []).map((conv) => (
          <a
            href="#"
            key={conv.conversation._id as string}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
          >
            <div className="flex w-full items-center gap-2">
              <span>{(conv.email.sender as any).fullName}</span>{" "}
              <span className="ml-auto text-xs">{dayjs(conv.email.createdAt as string).fromNow()}</span>
            </div>
            <span className="font-medium">{conv.email?.subject}</span>
            <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
              {conv.email.summary ?? "(Empty email)"}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
