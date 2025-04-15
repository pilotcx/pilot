"use client";

import { useRouter } from "next/navigation";
import { IntroduceFeaturesStep } from "@/components/configure/introduce-features-step";
import { ConfigurationStepLayout } from "../components/ConfigurationStepLayout";
import { toast } from "sonner";

export default function FeaturesPage() {
  const router = useRouter();

  const handleComplete = async () => {
    try {
      // Mark the features step as completed
      const response = await fetch('/api/configure/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete configuration');
      }

      toast.success("Configuration completed successfully!");
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || "Failed to complete configuration");
      console.error("Complete error:", error);
    }
  };

  return (
    <ConfigurationStepLayout 
      currentStepIndex={2}
      title="Welcome to Your New Workspace"
      description="Your organization is now set up! Here are some key features to get you started."
    >
      <IntroduceFeaturesStep onComplete={handleComplete} />
    </ConfigurationStepLayout>
  );
}
