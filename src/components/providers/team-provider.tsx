'use client';

import {Team, TeamMember} from "@/lib/types/models/team";
import {createContext, ReactNode, useContext} from "react";

interface TeamProviderType {
  team: Team;
  membership: TeamMember;
}

const TeamProviderContext = createContext<TeamProviderType>({
  team: {} as Team,
  membership: {} as TeamMember,
});

export function useTeam() {
  return useContext(TeamProviderContext);
}

export default function TeamProvider({children, team, membership}: {
  children: ReactNode,
  team: Team,
  membership: TeamMember
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
