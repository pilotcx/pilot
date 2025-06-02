"use client";

import {
  BookOpen,
  CheckCheckIcon,
  FileCheckIcon,
  MailIcon,
  NewspaperIcon,
  Settings2,
  TargetIcon
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { useTeam } from "@/components/providers/team-provider";
import { TeamSwitcher } from "@/components/team-switcher";
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
} from "@/components/ui/sidebar";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { team, projects } = useTeam();
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
            url: `/t/${team.slug}/kanban-task`,
          },
        ],
      },
      {
        title: "OKRs",
        url: "#",
        icon: TargetIcon,
        items: [
          {
            title: "Dashboard",
            url: `/t/${teamSlug}/okr`,
          },
          {
            title: "Objectives",
            url: `/t/${teamSlug}/okr/objectives`,
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
          {
            title: "Domains",
            url: teamSlug ? `/t/${teamSlug}/settings/domains` : "#",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/t/${teamSlug}/`}>
                  <NewspaperIcon />
                  <span>Newsfeed</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/t/${teamSlug}/requests`}>
                  <FileCheckIcon />
                  <span>Requests</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/t/${teamSlug}/mailing`}>
                  <MailIcon />
                  <span>Mailing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/teams/${teamSlug}/integrations`}>
                  <Settings2 />
                  <span>Integrations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain items={data.navMain} />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
