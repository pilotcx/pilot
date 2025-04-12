'use client';

import {Team} from "@/lib/types/models/team";
import {createContext, ReactNode, useContext} from "react";

interface TeamProviderType {
  team: Team;
}

const TeamProviderContext = createContext<TeamProviderType>({
  team: {} as Team,
});

export function useTeam() {
  const {team} = useContext(TeamProviderContext);
  return team;
}

export default function TeamProvider({children, team}: { children: ReactNode, team: Team }) {
  return <TeamProviderContext.Provider
    value={{
      team,
    }}
  >
    {children}
  </TeamProviderContext.Provider>
}
