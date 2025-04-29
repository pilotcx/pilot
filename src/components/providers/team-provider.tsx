"use client";

import apiService from "@/lib/services/api";
import { Project } from "@/lib/types/models/project";
import { Team, TeamMemberMapped } from "@/lib/types/models/team";
import { createContext, ReactNode, useContext, useState } from "react";

interface TeamProviderType {
  team: Team;
  membership: TeamMemberMapped;
  projects: Project[];
  reloadProjects?: () => Promise<void>;
}

const TeamProviderContext = createContext<TeamProviderType>({
  team: {} as Team,
  membership: {} as TeamMemberMapped,
  projects: [],
  reloadProjects: undefined,
});

export function useTeam() {
  return useContext(TeamProviderContext);
}

export default function TeamProvider({
  children,
  team,
  membership,
  projects = [],
}: TeamProviderType & {
  children: ReactNode;
}) {
  const [projectsData, setProjectsData] = useState<Project[]>(projects || []);

  const reloadProjects = async () => {
    if (!membership?._id || !team?._id) {
      return;
    }
    try {
      const response = await apiService.getJoinedProjects(
        membership._id.toString(),
        team._id.toString()
      );
      if (response?.data) {
        setProjectsData(response.data || []);
      } else {
        setProjectsData([]);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjectsData([]);
    }
  };
  
  return (
    <TeamProviderContext.Provider
      value={{
        team,
        membership,
        projects: projectsData,
        reloadProjects,
      }}
    >
      {children}
    </TeamProviderContext.Provider>
  );
}
