import { withAuthPage } from "@/lib/utils/withAuthPage";
import { teamService } from "@/lib/services/team";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";

interface TeamPageProps {
  params: Promise<{
    teamSlug: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const {teamSlug} = await params;
  // Ensure the user is authenticated
  await withAuthPage({
    redirectTo: '/login'
  });

  try {
    // Fetch team data by slug
    const team = await teamService.getTeamBySlug(teamSlug);

    if (!team) {
      return notFound();
    }

    return (
      <div className="container py-10">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <CardDescription className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {team.membersCount} {team.membersCount === 1 ? "member" : "members"}
              </CardDescription>
            </div>
            <Link href={`/t/${teamSlug}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {team.description || "No description provided"}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Team content will go here */}
          <Card>
            <CardHeader>
              <CardTitle>Team Dashboard</CardTitle>
              <CardDescription>
                Welcome to your team workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is where you'll see your team's activity and manage your projects.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching team:", error);
    return notFound();
  }
}
