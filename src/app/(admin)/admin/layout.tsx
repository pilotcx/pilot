import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider className="h-full">
      <AdminSidebar />
      <SidebarInset className="flex-1 p-6">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
