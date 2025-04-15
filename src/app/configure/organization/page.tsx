"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationInfoStep } from "@/components/configure/organization-info-step";
import { ConfigurationStepLayout } from "../components/ConfigurationStepLayout";
import { toast } from "sonner";
import { dbService } from "@/lib/db/service";
import { systemConfigService } from "@/lib/services/system-config";
import { SystemConfigKey } from "@/lib/types/models/system-config";

export default function OrganizationInfoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Submit the organization info data to the API
      const response = await fetch('/api/configure/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save organization information');
      }

      toast.success("Organization information saved successfully!");
      router.push('/configure/features');
    } catch (error: any) {
      toast.error(error.message || "Failed to save organization information");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfigurationStepLayout 
      currentStepIndex={1}
      title="Organization Information"
      description="Provide details about your organization"
    >
      <OrganizationInfoStep 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ConfigurationStepLayout>
  );
}
