"use client"

import * as React from "react"
import {
  BookOpen,
  CheckCheckIcon,
  FileCheckIcon,
  FolderKanbanIcon,
  Frame, MailIcon,
  Map,
  NewspaperIcon,
  PieChart,
  Settings2,
  TargetIcon,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavProjects} from "@/components/nav-projects"
import {NavUser} from "@/components/nav-user"
import {TeamSwitcher} from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link";
import {useTeam} from "@/components/providers/team-provider";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const {team, projects} = useTeam();
  const teamSlug = team.slug;

  const data = {
    navMain: [
      {
        title: "Tasks",
        url: "#",
        icon: CheckCheckIcon,
        isActive: true,
        items: [
          {
            title: "Task List",
            url: `/t/${team.slug}/tasks`,
          },
          {
            title: "Kanban Board",
            url: "#",
          },
        ],
      },
      {
        title: "OKRs",
        url: "#",
        icon: TargetIcon,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Knowledge",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "Docs",
            url: "#",
          },
          {
            title: "Resources",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: teamSlug ? `/t/${teamSlug}/settings` : "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: teamSlug ? `/t/${teamSlug}/settings` : "#",
          },
          {
            title: "Members",
            url: teamSlug ? `/t/${teamSlug}/settings/members` : "#",
          },
          {
            title: "Integrations",
            url: teamSlug ? `/t/${teamSlug}/settings/integrations` : "#",
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher/>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/t/${teamSlug}/`}>
                  <NewspaperIcon/>
                  <span>Newsfeed</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/t/${teamSlug}/requests`}>
                  <FileCheckIcon/>
                  <span>Requests</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/t/${teamSlug}/mailing`}>
                  <MailIcon/>
                  <span>Mailing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain items={data.navMain}/>
        <NavProjects/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )
}
