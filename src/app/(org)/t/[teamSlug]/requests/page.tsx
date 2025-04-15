"use client";

import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/services/api";
import useApi from "@/hooks/use-api";
import { TeamRequest, TeamRequestStatus } from "@/lib/types/models/team-request";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamRequestList } from "@/app/(org)/t/[teamSlug]/requests/components/TeamRequestList";
import { CreateTeamRequestDialog } from "@/app/(org)/t/[teamSlug]/requests/components/CreateTeamRequestDialog";
import { TeamRole } from "@/lib/types/models/team";

export default function TeamRequestsPage() {
  const { team, membership } = useTeam();
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Use API hooks
  const [getTeamRequests, { data: requestsData, loading: loadingRequests }] = useApi(api.getTeamRequests);

  // Fetch requests on component mount and when tab changes
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const options: any = {
          page: 1,
          limit: 50,
        };

        // Filter by status based on active tab
        if (activeTab === "pending") {
          options.status = TeamRequestStatus.PENDING;
        } else if (activeTab === "approved") {
          options.status = TeamRequestStatus.APPROVED;
        } else if (activeTab === "declined") {
          options.status = TeamRequestStatus.DECLINED;
        } else if (activeTab === "my-requests") {
          options.requesterId = membership._id;
        }

        await getTeamRequests(team._id?.toString()!, options);
      } catch (error: any) {
        toast.error(error.message || "Failed to load requests");
      }
    };

    fetchRequests();
  }, [activeTab, team._id, getTeamRequests, membership._id]);

  // Update requests when data changes
  useEffect(() => {
    if (requestsData) {
      setRequests(requestsData);
    }
  }, [requestsData]);

  const handleCreateRequest = async () => {
    setCreateDialogOpen(true);
  };

  const handleRequestCreated = (newRequest: TeamRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    setCreateDialogOpen(false);
    toast.success("Request created successfully");
  };

  const isManagerOrOwner = membership.role === TeamRole.Manager || membership.role === TeamRole.Owner;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Requests</h1>
          <p className="text-muted-foreground">
            {isManagerOrOwner
              ? "Review and respond to team requests"
              : "Submit requests to team managers"}
          </p>
        </div>
        <Button onClick={handleCreateRequest}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{isManagerOrOwner ? "All Requests" : "My Requests"}</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          {isManagerOrOwner && <TabsTrigger value="my-requests">Sent Requests</TabsTrigger>}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loadingRequests ? (
            <RequestsLoadingSkeleton />
          ) : requests.length === 0 ? (
            <EmptyState onCreateRequest={handleCreateRequest} />
          ) : (
            <TeamRequestList
              requests={requests}
              isManager={isManagerOrOwner}
              onRequestUpdated={(updatedRequest) => {
                setRequests((prev) =>
                  prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
                );
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {loadingRequests ? (
            <RequestsLoadingSkeleton />
          ) : requests.length === 0 ? (
            <EmptyState message="No pending requests found" onCreateRequest={handleCreateRequest} />
          ) : (
            <TeamRequestList
              requests={requests}
              isManager={isManagerOrOwner}
              onRequestUpdated={(updatedRequest) => {
                setRequests((prev) =>
                  prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
                );
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {loadingRequests ? (
            <RequestsLoadingSkeleton />
          ) : requests.length === 0 ? (
            <EmptyState message="No approved requests found" onCreateRequest={handleCreateRequest} />
          ) : (
            <TeamRequestList
              requests={requests}
              isManager={isManagerOrOwner}
              onRequestUpdated={(updatedRequest) => {
                setRequests((prev) =>
                  prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
                );
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="declined" className="mt-4">
          {loadingRequests ? (
            <RequestsLoadingSkeleton />
          ) : requests.length === 0 ? (
            <EmptyState message="No declined requests found" onCreateRequest={handleCreateRequest} />
          ) : (
            <TeamRequestList
              requests={requests}
              isManager={isManagerOrOwner}
              onRequestUpdated={(updatedRequest) => {
                setRequests((prev) =>
                  prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
                );
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="my-requests" className="mt-4">
          {loadingRequests ? (
            <RequestsLoadingSkeleton />
          ) : requests.length === 0 ? (
            <EmptyState message="You haven't created any requests yet" onCreateRequest={handleCreateRequest} />
          ) : (
            <TeamRequestList
              requests={requests}
              isManager={isManagerOrOwner}
              onRequestUpdated={(updatedRequest) => {
                setRequests((prev) =>
                  prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
                );
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateTeamRequestDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        teamId={team._id?.toString()!}
        onRequestCreated={handleRequestCreated}
      />
    </div>
  );
}

function EmptyState({ message = "No requests found", onCreateRequest }: { message?: string; onCreateRequest: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-medium">{message}</h3>
          <p className="text-sm text-muted-foreground">
            Create a new request to get started
          </p>
          <Button onClick={onCreateRequest}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
