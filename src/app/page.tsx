"use client";

import { useRouter } from "next/navigation";
import { IntroSlides, Slide } from "@/components/intro-slides";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [isFirstTime, setIsFirstTime] = useState(true);
  const slides: Slide[] = [
    {
      title: "Welcome to Tower",
      description: "Your complete Team Management & Collaboration Software solution",
      image: "/team-collaboration.svg"
    },
    {
      title: "Seamless Team Collaboration",
      description: "Streamline communication, task assignment, and project tracking in one unified platform",
      image: "/team-tasks.svg"
    },
    {
      title: "GitLab Integration",
      description: "Connect directly with GitLab to manage repositories, merge requests, and track development progress",
      image: "/gitlab-integration.svg"
    },
    {
      title: "Real-time Updates",
      description: "Stay informed with real-time notifications and project status updates across your entire team",
      image: "/realtime-updates.svg"
    }
  ];

  const handleComplete = () => {
    router.push('/configure');
  };

  const handleSkip = () => {
    router.push('/configure');
  };

  return (
  <>
  { isFirstTime ? (
       <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
       <IntroSlides 
         slides={slides} 
         onComplete={handleComplete} 
         onSkip={handleSkip}
       />
       
       <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
         Tower - Team Management & Collaboration Software
       </div>
     </div> 
  ) : (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
    )}
    </>
  )
}
