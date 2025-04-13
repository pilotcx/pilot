"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import api from "@/lib/services/api";
export const LogoutDropdownItem = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  return (
    <DropdownMenuItem
      disabled={isLoggingOut}
      onClick={async () => {
        try {
          setIsLoggingOut(true);
          await api.logout();
          toast.success("Logged out successfully");
          router.push("/login");
        } catch (error: any) {
          toast.error(error.message || "Failed to log out");
          setIsLoggingOut(false);
        }
      }}
    >
      <LogOut />
      {isLoggingOut ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
};
