import TeamHeader from "@/app/(org)/t/[teamSlug]/team-header";
import { AppSidebar } from "@/components/app-sidebar";
import TeamProvider from "@/components/providers/team-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { projectService } from "@/lib/services/project";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";
import { Team, TeamMemberMapped } from "@/lib/types/models/team";
import withTeam from "@/lib/utils/withTeam";
import type { Metadata } from "next";
import { ReactNode } from "react";

interface TeamLayoutProps {
  children: ReactNode;
  params: {
    teamSlug: string;
  };
}

export async function generateMetadata({
  params,
}: TeamLayoutProps): Promise<Metadata> {
  const { team } = await withTeam(params);
  const title =
    (await systemConfigService.get<string>(SystemConfigKey.OrgName)) ?? "Pilot";

  return {
    title: team.name + " :: " + title,
  };
}

const RoutesHiddenOverFlow = ["kanban-task"];

export default async function TeamLayout({
  children,
  params,
}: TeamLayoutProps) {
  const { team, membership } = await withTeam(params);
  // Fetch team data for the breadcrumb
  const teamJson = JSON.parse(JSON.stringify(team)) as Team;
  const membershipJson = JSON.parse(
    JSON.stringify(membership)
  ) as TeamMemberMapped;
  const joinedProjects = await projectService.getJoinedProjects(
    membership._id.toString()
  );
  const projectsJson = JSON.parse(JSON.stringify(joinedProjects));

  return (
    <TeamProvider
      team={teamJson}
      membership={membershipJson}
      projects={projectsJson}
    >
      <SidebarProvider className={"h-full"}>
        <AppSidebar />
        <SidebarInset
          overflowHidden={RoutesHiddenOverFlow}
          className={"flex-1"}
        >
          <TeamHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TeamProvider>
  );
}
