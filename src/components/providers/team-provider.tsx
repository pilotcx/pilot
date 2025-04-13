'use client';

import {Team, TeamMember, TeamMemberMapped} from "@/lib/types/models/team";
import {createContext, ReactNode, useContext} from "react";

interface TeamProviderType {
  team: Team;
  membership: TeamMemberMapped;
}

const TeamProviderContext = createContext<TeamProviderType>({
  team: {} as Team,
  membership: {} as TeamMemberMapped,
});

export function useTeam() {
  return useContext(TeamProviderContext);
}

export default function TeamProvider({children, team, membership}: {
  children: ReactNode,
  team: Team,
  membership: TeamMemberMapped
}) {
  return <TeamProviderContext.Provider
    value={{
      team,
      membership
    }}
  >
    {children}
  </TeamProviderContext.Provider>
}
