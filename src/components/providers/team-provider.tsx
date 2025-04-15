'use client';

import {Team, TeamMemberMapped} from "@/lib/types/models/team";
import {createContext, ReactNode, useContext} from "react";
import {Project} from "@/lib/types/models/project";

interface TeamProviderType {
  team: Team;
  membership: TeamMemberMapped;
  projects: Project[];
}

const TeamProviderContext = createContext<TeamProviderType>({
  team: {} as Team,
  membership: {} as TeamMemberMapped,
  projects: [],
});

export function useTeam() {
  return useContext(TeamProviderContext);
}

export default function TeamProvider({children, team, membership, projects}: TeamProviderType & {
  children: ReactNode
}) {
  return <TeamProviderContext.Provider
    value={{
      team,
      membership,
      projects
    }}
  >
    {children}
  </TeamProviderContext.Provider>
}
