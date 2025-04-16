import {ReactNode} from "react";
import {withAuthPage} from "@/lib/utils/withAuthPage";
import {UserRole} from "@/lib/types/models/user";
import {redirect} from "next/navigation";
import {Toaster} from "sonner";

export default async function AdminLayout({
                                            children,
                                          }: {
  children: ReactNode;
}) {
  const user = await withAuthPage({
    roles: [UserRole.Admin],
    redirectTo: '/login',
    forbiddenPath: '/'
  });

  if (!user || user.role !== UserRole.Admin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
      <Toaster position="top-right"/>
    </div>
  );
}
