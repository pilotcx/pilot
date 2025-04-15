"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateAdminStep } from "@/components/configure/create-admin-step";
import { ConfigurationStepLayout } from "../components/ConfigurationStepLayout";
import { AdminAccount } from "@/lib/validations/organization";
import { toast } from "sonner";

export default function AdminAccountPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AdminAccount) => {
    setIsSubmitting(true);

    try {
      // Submit the admin account data to the API
      const response = await fetch('/api/configure/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create admin account');
      }

      toast.success("Admin account created successfully!");
      router.push('/configure/organization');
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin account");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfigurationStepLayout 
      currentStepIndex={0}
      title="Create Admin Account"
      description="Set up the administrator account for your organization"
    >
      <CreateAdminStep 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ConfigurationStepLayout>
  );
}
