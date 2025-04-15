"use client"

import * as React from "react"
import {
  ArchiveIcon,
  ArchiveX,
  File,
  Inbox,
  InboxIcon,
  SearchIcon,
  Send,
  SendIcon,
  Trash2,
  TrashIcon
} from "lucide-react"
import {Sidebar,} from "@/components/ui/sidebar"
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      isActive: true,
    },
    {
      title: "Drafts",
      url: "#",
      icon: File,
      isActive: false,
    },
    {
      title: "Sent",
      url: "#",
      icon: Send,
      isActive: false,
    },
    {
      title: "Junk",
      url: "#",
      icon: ArchiveX,
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
      isActive: false,
    },
  ],
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: "Emily Davis",
      email: "emilydavis@example.com",
      subject: "Re: Question about Budget",
      date: "2 days ago",
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: "Michael Wilson",
      email: "michaelwilson@example.com",
      subject: "Important Announcement",
      date: "1 week ago",
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: "Sarah Brown",
      email: "sarahbrown@example.com",
      subject: "Re: Feedback on Proposal",
      date: "1 week ago",
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: "David Lee",
      email: "davidlee@example.com",
      subject: "New Project Idea",
      date: "1 week ago",
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: "Olivia Wilson",
      email: "oliviawilson@example.com",
      subject: "Vacation Plans",
      date: "1 week ago",
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: "James Martin",
      email: "jamesmartin@example.com",
      subject: "Re: Conference Registration",
      date: "1 week ago",
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: "Sophia White",
      email: "sophiawhite@example.com",
      subject: "Team Dinner",
      date: "1 week ago",
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ],
}

export function MailSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const mails = data.mails;

  return (
    <div className={'max-w-[300px] border-r flex flex-col h-full'} style={{height: '100%', maxHeight: '100%'}}>
      <div className={'p-4 border-b flex-shrink-0 flex flex-col gap-2 bg-sidebar'}>
        <div>
          <Select>
            <SelectTrigger className={'bg-background !text-foreground w-full'}>
              nhan@northstudio.vn
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbox">
                Inbox
              </SelectItem>
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
        {mails.map((mail) => (
          <a
            href="#"
            key={mail.email}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
          >
            <div className="flex w-full items-center gap-2">
              <span>{mail.name}</span>{" "}
              <span className="ml-auto text-xs">{mail.date}</span>
            </div>
            <span className="font-medium">{mail.subject}</span>
            <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
              {mail.teaser}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
