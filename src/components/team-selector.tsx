"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/services/api";
import { Team } from "@/lib/types/models/team";
import { Calendar, PlusCircle, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function TeamSelector() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = (await api.getUserTeams()) as {
          data: { docs: Team[] };
          message: string;
        };
        setTeams(response.data.docs || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load teams");
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleCreateTeam = () => {
    router.push("/new-team");
  };

  const handleSelectTeam = (teamSlug: string) => {
    router.push(`/t/${teamSlug}`);
  };

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Select a Team</h1>
        <p className="text-muted-foreground mt-2">
          Choose a team to work with or create a new one
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm">
              <CardHeader className="p-6">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card className="text-center p-8 max-w-md mx-auto shadow-sm">
          <CardHeader>
            <CardTitle>No Teams Found</CardTitle>
            <CardDescription>
              You don&apos;t have any teams yet. Create your first team to get
              started.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={handleCreateTeam}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create a Team
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team._id?.toString()}
              className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-border/80 flex flex-col"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1 text-lg">
                    {team.name}
                  </CardTitle>
                  <Users className="h-4 *:w-4 text-primary" />
                </div>
                <CardDescription className="flex items-center mt-1">
                  {team.membersCount}{" "}
                  {team.membersCount === 1 ? "member" : "members"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow">
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>Created {new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-sm line-clamp-2">
                  {team.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9 p-0"
                  onClick={() => router.push(`/t/${team.slug}/settings`)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  className="flex-1 ml-2"
                  onClick={() => handleSelectTeam(team.slug)}
                >
                  Select Team
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Create new team card */}
          <Card className="overflow-hidden border-dashed">
            <CardHeader className="gap-0">
              <CardTitle>Create a New Team</CardTitle>
              <CardDescription>
                Start collaborating with a new group
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-sm text-muted-foreground">
                Set up a new team and invite members to join your workspace
              </p>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCreateTeam}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
