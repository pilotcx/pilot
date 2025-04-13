import withTeam from "@/lib/utils/withTeam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import { TeamNewsfeed } from "@/components/team-newsfeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function TeamPage({params}: { params: any }) {
  const {team} = await withTeam((await params).teamSlug);

  return (
    <div className="container max-w-3xl mx-auto">
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <TeamNewsfeed />
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Project Alpha</CardTitle>
                <CardDescription>
                  Website redesign project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Progress: 60%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Beta</CardTitle>
                <CardDescription>
                  Mobile app development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Progress: 25%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Gamma</CardTitle>
                <CardDescription>
                  Marketing campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Progress: 80%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Team Tasks</CardTitle>
              <CardDescription>
                Manage your team's tasks and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Task management features coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
