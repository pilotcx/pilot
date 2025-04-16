import {Metadata} from "next";
import {notFound, redirect} from "next/navigation";
import {dbService} from "@/lib/db/service";
import {TeamRole} from "@/lib/types/models/team";
import {MemberDetailForm} from "@/components/teams/members/member-detail-form";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import withTeam from "@/lib/utils/withTeam";

export const metadata: Metadata = {
  title: "Member Details",
  description: "View and edit team member details",
};

export default async function MemberDetailPage({
                                                 params,
                                               }: {
  params: Promise<{ teamSlug: string, memberId: string }>;
}) {
  const {memberId} = await params;
  const {team, membership} = await withTeam(params);

  const canManageMembers = [TeamRole.Owner, TeamRole.Manager].includes(membership.role);

  if (!canManageMembers) {
    redirect(`/t/${team.slug}/forbidden`);
  }

  // Get the member details
  await dbService.connect();
  const member = await dbService.teamMember.findById(memberId).populate('user');

  if (!member || member.team.toString() !== team._id.toString()) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Member Details</h3>
          <p className="text-sm text-muted-foreground">
            View and edit team member information
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/t/${team.slug}/settings/members`}>
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Back to Members
          </Link>
        </Button>
      </div>

      <Separator/>

      <MemberDetailForm
        teamId={team._id.toString()}
        member={JSON.parse(JSON.stringify(member))}
        currentUserRole={membership.role as TeamRole}
        teamSlug={team.slug}
      />
    </div>
  );
}
