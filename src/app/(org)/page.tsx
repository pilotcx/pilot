import { LogoutDropdownItem } from "@/components/logout-item";
import { TeamSelector } from "@/components/team-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { withAuthPage } from "@/lib/utils/withAuthPage";
import { ShieldIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default async function HomePage() {
  await withAuthPage({
    redirectTo: "/login",
  });

  const user = await withAuthPage({
    redirectTo: "/login",
  });
  return (
    <main className="min-h-screen relative flex justify-center bg-background">
      <div className="absolute top-10 right-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 rounded-lg cursor-pointer">
              <AvatarImage src={user.avatar} alt={user?.fullName ?? "@tower"} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={"bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="rounded-lg">
                    {user?.fullName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.fullName}</span>
                  <span className="truncate text-xs">
                    {user.email ?? "No Email"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={"/settings/general"}>
                <DropdownMenuItem>
                  <UserIcon />
                  Account
                </DropdownMenuItem>
              </Link>
              <Link href={"/settings/security"}>
                <DropdownMenuItem>
                  <ShieldIcon />
                  Security
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <LogoutDropdownItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TeamSelector />
    </main>
  );
}
