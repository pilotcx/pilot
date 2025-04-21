"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface MailingHeaderProps {
  teamName: string;
}

export function MailingHeader({ teamName }: MailingHeaderProps) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Mailing</h1>
        <p className="text-muted-foreground">
          Manage email communications for {teamName}
        </p>
      </div>
      
      <Button onClick={() => router.push("mailing/compose")}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Compose Email
      </Button>
    </div>
  );
}
