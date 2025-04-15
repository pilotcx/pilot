"use client";

import { Badge } from "@/components/ui/badge";
import { TeamRequestStatus } from "@/lib/types/models/team-request";
import { CheckIcon, ClockIcon, XIcon } from "lucide-react";

interface TeamRequestStatusBadgeProps {
  status: TeamRequestStatus;
}

export function TeamRequestStatusBadge({ status }: TeamRequestStatusBadgeProps) {
  switch (status) {
    case TeamRequestStatus.PENDING:
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          Pending
        </Badge>
      );
    case TeamRequestStatus.APPROVED:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckIcon className="h-3 w-3" />
          Approved
        </Badge>
      );
    case TeamRequestStatus.DECLINED:
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XIcon className="h-3 w-3" />
          Declined
        </Badge>
      );
    case TeamRequestStatus.CANCELLED:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
          <XIcon className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    case TeamRequestStatus.IN_REVIEW:
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          In Review
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
