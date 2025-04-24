"use client";

import {
  EyeIcon,
  Folder,
  FolderIcon,
  Forward,
  MoreHorizontal,
  PlusIcon,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useTeam } from "@/components/providers/team-provider";
import { useRouter } from "next/navigation";
import { TeamRole } from "@/lib/types/models/team";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function NavProjects() {
  const { team, projects, membership } = useTeam();
  const { isMobile } = useSidebar();
  const router = useRouter();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="flex flex-row items-center justify-between gap-2">
        Projects
        <div className="flex flex-row items-center gap-3">
          {membership.role === TeamRole.Owner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <PlusIcon
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => router.push(`/t/${team.slug}/projects/new`)}
                />
              </TooltipTrigger>
              <TooltipContent>Create Project</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <EyeIcon
                className="w-4 h-4 cursor-pointer"
                onClick={() => router.push(`/t/${team.slug}/projects`)}
              />
            </TooltipTrigger>
            <TooltipContent>View All Projects</TooltipContent>
          </Tooltip>
        </div>
      </SidebarGroupLabel>
      <SidebarMenu>
        {projects.slice(0, 5).map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={`/t/${team.slug}/projects/${item.code}`}>
                <div className={"w-6 h-6 rounded-md border flex"}>
                  <FolderIcon className="w-3 h-3 m-auto" />
                </div>
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Folder className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
