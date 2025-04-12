import {teamService} from "@/lib/services/team";
import {withAuthPage} from "@/lib/utils/withAuthPage";
import {redirect} from "next/navigation";

interface TeamParams {
  teamSlug: string;
}

export default async function withTeam(params: TeamParams | Promise<TeamParams>) {
  const {teamSlug} = await params;
  await withAuthPage({
    redirectTo: '/login'
  });
  const team = await teamService.getTeamBySlug(teamSlug);
  if (!team) return redirect('/not-found');
  return team;
}
