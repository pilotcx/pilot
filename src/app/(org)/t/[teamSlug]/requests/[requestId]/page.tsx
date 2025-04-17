"use client";

import {useTeam} from "@/components/providers/team-provider";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowLeftIcon, MessageSquareIcon} from "lucide-react";
import {use, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import api from "@/lib/services/api";
import useApi from "@/hooks/use-api";
import {TeamRequest, TeamRequestStatus} from "@/lib/types/models/team-request";
import {Skeleton} from "@/components/ui/skeleton";
import {formatDistanceToNow} from "date-fns";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {TeamMember, TeamRole} from "@/lib/types/models/team";
import {Separator} from "@/components/ui/separator";
import {TeamRequestCommentList} from "@/app/(org)/t/[teamSlug]/requests/components/TeamRequestCommentList";
import {TeamRequestStatusBadge} from "@/app/(org)/t/[teamSlug]/requests/components/TeamRequestStatusBadge";
import {UpdateTeamRequestDialog} from "@/app/(org)/t/[teamSlug]/requests/components/UpdateTeamRequestDialog";
import Link from "next/link";

export default function TeamRequestDetailPage({params: _params}: {
  params: Promise<{ teamSlug: string; requestId: string }>
}) {
  const params = use(_params);
  const router = useRouter();
  const {team, membership} = useTeam();
  const [request, setRequest] = useState<TeamRequest | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  // Use API hooks
  const [getTeamRequest, {loading: loadingRequest}] = useApi(api.getTeamRequest);

  // Fetch request on component mount
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await getTeamRequest(team._id?.toString()!, params.requestId);
        if (response.data) {
          setRequest(response.data);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load request");
        router.push(`/t/${params.teamSlug}/requests`);
      }
    };

    fetchRequest();
  }, [getTeamRequest, params.requestId, router, team._id, params.teamSlug]);

  const handleUpdateRequest = async (status: TeamRequestStatus, responseNote?: string) => {
    try {
      const response = await api.updateTeamRequest(team._id?.toString()!, params.requestId, {
        status,
        responseNote,
      });

      if (response.data) {
        setRequest(response.data);
        toast.success(`Request ${status.toLowerCase()}`);
        setUpdateDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update request");
    }
  };

  const isManagerOrOwner = membership.role === TeamRole.Manager || membership.role === TeamRole.Owner;
  const isPending = request?.status === TeamRequestStatus.PENDING;
  const isRequester = request?.requester && (request.requester as TeamMember)._id === membership._id;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/t/${params.teamSlug}/requests`}>
            <ArrowLeftIcon className="h-4 w-4"/>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Request Details</h1>
      </div>

      {loadingRequest || !request ? (
        <RequestDetailSkeleton/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{request.title}</CardTitle>
                    <CardDescription>
                      Created {formatDistanceToNow(new Date(request.createdAt as string), {addSuffix: true})}
                    </CardDescription>
                  </div>
                  <TeamRequestStatusBadge status={request.status}/>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>{request.description}</p>
                </div>
              </CardContent>
              {request.responseNote && (
                <>
                  <Separator/>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-2">Response:</h3>
                    <div className="prose max-w-none">
                      <p>{request.responseNote}</p>
                    </div>
                  </CardContent>
                </>
              )}
              {isManagerOrOwner && isPending && (
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setUpdateDialogOpen(true)}
                  >
                    Respond to Request
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquareIcon className="h-5 w-5"/>
                    Comments
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {isManagerOrOwner || isRequester
                      ? "You can comment on this request"
                      : "Only reviewers and the requester can comment"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TeamRequestCommentList
                  requestId={params.requestId}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requester</CardTitle>
              </CardHeader>
              <CardContent>
                {request.requester && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={(request.requester as TeamMember).avatar}/>
                      <AvatarFallback>
                        {(request.requester as TeamMember).displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{(request.requester as TeamMember).displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {(request.requester as TeamMember).role}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {request.reviewer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Reviewer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={(request.reviewer as TeamMember).avatar}/>
                      <AvatarFallback>
                        {(request.reviewer as TeamMember).displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{(request.reviewer as TeamMember).displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {(request.reviewer as TeamMember).role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {request.responder && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Responder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={(request.responder as TeamMember).avatar}/>
                      <AvatarFallback>
                        {(request.responder as TeamMember).displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{(request.responder as TeamMember).displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {(request.responder as TeamMember).role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isPending && isRequester && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleUpdateRequest(TeamRequestStatus.CANCELLED)}
                  >
                    Cancel Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {request && (
        <UpdateTeamRequestDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          request={request}
          onUpdateRequest={handleUpdateRequest}
        />
      )}
    </div>
  );
}

function RequestDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-6 w-64"/>
                <Skeleton className="h-4 w-40 mt-2"/>
              </div>
              <Skeleton className="h-6 w-24"/>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full"/>
            <Skeleton className="h-4 w-full mt-2"/>
            <Skeleton className="h-4 w-2/3 mt-2"/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32"/>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full"/>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32"/>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full"/>
              <div>
                <Skeleton className="h-5 w-32"/>
                <Skeleton className="h-4 w-24 mt-1"/>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
