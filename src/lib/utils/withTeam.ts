import {teamService} from "@/lib/services/team";
import {withAuthPage} from "@/lib/utils/withAuthPage";
import {redirect} from "next/navigation";

interface TeamParams {
  teamSlug: string;
}

export default async function withTeam(params: TeamParams | Promise<TeamParams>) {
  const {teamSlug} = await params;
  const jwt = await withAuthPage({
    redirectTo: '/login'
  });
  const userId = jwt.id;
  const data = await teamService.getTeamWithMembership(teamSlug, userId);
  if (!data || !data.team || !data.membership) return redirect('/not-found');
  return {team: data.team, membership: data.membership};
}
