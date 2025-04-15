"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {TeamRequest} from "@/lib/types/models/team-request";
import {formatDistanceToNow} from "date-fns";
import {TeamRequestStatusBadge} from "./TeamRequestStatusBadge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {MessageSquareIcon} from "lucide-react";
import {TeamMember} from "@/lib/types/models/team";
import Link from "next/link";
import {useTeam} from "@/components/providers/team-provider";

interface TeamRequestListProps {
  requests: TeamRequest[];
}

export function TeamRequestList({requests}: TeamRequestListProps) {
  const {team} = useTeam();

  return (
    <div className="flex flex-col gap-4">
      {requests.map((request) => (
        <Link href={`/t/${team.slug}/requests/${request._id}`}>
          <Card key={request._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  <CardDescription>
                    Created {formatDistanceToNow(new Date(request.createdAt as string), {addSuffix: true})}
                  </CardDescription>
                </div>
                <TeamRequestStatusBadge status={request.status}/>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {request.description}
              </p>
              <div className="flex items-center mt-4 gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={(request.requester as TeamMember).avatar}/>
                    <AvatarFallback>
                      {(request.requester as TeamMember).displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                  {(request.requester as TeamMember).displayName}
                </span>
                </div>

                {request.reviewer && (
                  <div className="flex items-center gap-1 ml-4">
                    <span className="text-xs text-muted-foreground">Reviewer:</span>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={(request.reviewer as TeamMember).avatar}/>
                      <AvatarFallback>
                        {(request.reviewer as TeamMember).displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">
                    {(request.reviewer as TeamMember).displayName}
                  </span>
                  </div>
                )}

                {request.commentCount > 0 && (
                  <div className="ml-auto flex items-center text-sm text-muted-foreground">
                    <MessageSquareIcon className="h-4 w-4 mr-1"/>
                    {request.commentCount}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
