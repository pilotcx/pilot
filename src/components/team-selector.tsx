"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users } from "lucide-react";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { Team } from "@/lib/types/models/team";
import { Skeleton } from "@/components/ui/skeleton";
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
        const response = await api.getUserTeams();
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
            <Card key={i} className="overflow-hidden">
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
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>No Teams Found</CardTitle>
            <CardDescription>
              You don&apos;t have any teams yet. Create your first team to get started.
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {teams.map((team) => (
              <Card key={team._id} className="overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="line-clamp-1">{team.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {team.membersCount} {team.membersCount === 1 ? "member" : "members"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {team.description || "No description provided"}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleSelectTeam(team.slug)}
                  >
                    Select Team
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Create new team card */}
            <Card className="overflow-hidden border-dashed">
              <CardHeader className="p-6">
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
        </>
      )}
    </div>
  );
}
