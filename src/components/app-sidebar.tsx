"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot, CheckCheckIcon, CheckIcon,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal, TargetIcon,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavProjects} from "@/components/nav-projects"
import {NavUser} from "@/components/nav-user"
import {TeamSwitcher} from "@/components/team-switcher"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,} from "@/components/ui/sidebar"

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
          url: "#",
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
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
        <NavProjects projects={data.projects}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )
}
