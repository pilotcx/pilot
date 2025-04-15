import {AppSidebar} from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {SidebarInset, SidebarProvider, SidebarTrigger,} from "@/components/ui/sidebar"
import {ReactNode} from "react";
import withTeam from "@/lib/utils/withTeam";
import TeamProvider from "@/components/providers/team-provider";
import {Team, TeamMemberMapped} from "@/lib/types/models/team";
import type {Metadata} from "next";
import {systemConfigService} from "@/lib/services/system-config";
import {SystemConfigKey} from "@/lib/types/models/system-config";
import {projectService} from "@/lib/services/project";

interface TeamLayoutProps {
  children: ReactNode;
  params: {
    teamSlug: string;
  };
}

export async function generateMetadata({params}: TeamLayoutProps): Promise<Metadata> {
  const {team} = await withTeam(params);
  const title = await systemConfigService.get<string>(SystemConfigKey.OrgName) ?? 'Tower';

  return {
    title: team.name + ' :: ' + title,
  }
}

export default async function TeamLayout({children, params}: TeamLayoutProps) {
  const {team, membership} = await withTeam(params);
  // Fetch team data for the breadcrumb
  const teamJson = JSON.parse(JSON.stringify(team)) as Team;
  const membershipJson = JSON.parse(JSON.stringify(membership)) as TeamMemberMapped;
  const joinedProjects = await projectService.getJoinedProjects(membership._id.toString());
  const projectsJson = JSON.parse(JSON.stringify(joinedProjects));
  return (
    <TeamProvider
      team={teamJson}
      membership={membershipJson}
      projects={projectsJson}
    >
      <SidebarProvider>
        <AppSidebar/>
        <SidebarInset>
          <header
            className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-8">
              <SidebarTrigger className="-ml-1"/>
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">
                      Teams
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block"/>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{team.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 pb-4 px-8 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TeamProvider>
  )
}
