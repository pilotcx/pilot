"use client";
import { IntroSlides, Slide } from "@/components/intro-slides";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StarterPage() {
  const router = useRouter();
  const slides: Slide[] = [
    {
      title: "Welcome to Tower",
      description:
        "Your complete Team Management & Collaboration Software solution",
      image: "/team-collaboration.svg",
    },
    {
      title: "Seamless Team Collaboration",
      description:
        "Streamline communication, task assignment, and project tracking in one unified platform",
      image: "/team-tasks.svg",
    },
    {
      title: "GitLab Integration",
      description:
        "Connect directly with GitLab to manage repositories, merge requests, and track development progress",
      image: "/gitlab-integration.svg",
    },
    {
      title: "Real-time Updates",
      description:
        "Stay informed with real-time notifications and project status updates across your entire team",
      image: "/realtime-updates.svg",
    },
  ];

  const handleComplete = () => {
    router.push("/configure");
  };

  const handleSkip = () => {
    router.push("/configure");
  };
  return (
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
  );
}
