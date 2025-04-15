"use client";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {useTeam} from "@/components/providers/team-provider";
import {usePathname} from "next/navigation";

export default function TeamHeader() {
  const {team} = useTeam();
  const pathname = usePathname();

  const showHeader = pathname.split('/')?.[3] !== 'mailing';
  if (!showHeader) return <></>;
  return <header
    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
    <div className="flex items-center gap-2 px-8">
      <SidebarTrigger className="-ml-1"/>
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/">
              Teams
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block"/>
          <BreadcrumbItem>
            <BreadcrumbPage>{team.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
}
