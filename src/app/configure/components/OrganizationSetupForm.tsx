"use client";
import {Card, CardContent} from "@/components/ui/card";
import {Step, useMultiStepForm} from "@/hooks/use-multi-step-form";
import {
  AdminAccount,
  Industry,
  OrganizationComplete,
  OrganizationSetup,
  OrganizationSize,
  OrganizationStructure,
  UserRole
} from "@/lib/validations/organization";
import {useState} from "react";
import {OrganizationInfoStep} from "@/components/configure/organization-info-step";
import {FormProgress} from "./FormProgress";
import {CreateAdminStep} from "@/components/configure/create-admin-step";
import {IntroduceFeaturesStep} from "@/components/configure/introduce-features-step";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {undefined} from "zod";
import {CheckCircleIcon} from "lucide-react";

const FORM_STEPS: Step[] = [
  {
    id: "admin-account",
    title: "Admin Account",
  },
  {
    id: "organization-info",
    title: "Organization Info",
  },
  {
    id: "features",
    title: "Features",
  },
];

const INITIAL_DATA: OrganizationSetup = {
  adminAccount: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  organization: {
    name: "",
    industry: Industry.Other,
    size: OrganizationSize.XSmall,
    organizationStructure: OrganizationStructure.MultiTeam,
    allowRegistration: false,
    teamCreationPermission: {
      allowAnyUser: false,
      allowedRoles: [UserRole.Admin]
    },
    email: "",
    phone: "",
    website: "",
    address: "",
    state: "",
    postalCode: "",
  }
};

export function OrganizationSetupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    currentStepIndex,
    currentStep,
    steps,
    goTo,
    next,
    back,
    formData,
    updateFormData,
  } = useMultiStepForm<OrganizationSetup>(FORM_STEPS, INITIAL_DATA);

  const handleStepClick = (index: number) => {
    if (index <= currentStepIndex) {
      goTo(index);
    }
  };

  const handleAdminAccountSubmit = (data: AdminAccount) => {
    updateFormData({adminAccount: data});
    next();
  };

  const handleOrgInfoSubmit = (data: any) => {
    updateFormData({ organization: data });
    handleSubmitConfiguration();
  };

  const handleSubmitConfiguration = async () => {
    setIsSubmitting(true);

    try {
      // Submit the complete form data to the API
      const response = await fetch('/api/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to configure organization');
      }

      setSuccess(true);
      toast.success("Organization setup successful!");
      next(); // Move to the features step
    } catch (error: any) {
      toast.error(error.message || "Failed to configure organization");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    router.push('/');
  };

  if (success && currentStepIndex === 2) {
    return <IntroduceFeaturesStep onComplete={handleComplete}/>;
  }

  if (success) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600"/>
            </div>
            <h2 className="text-2xl font-semibold">Organization Created!</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Your organization has been successfully set up. You can now start
              using the platform.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardContent className="p-6 sm:p-8">
        <h1 className="mb-1 text-center text-2xl font-semibold">
          Organization Setup
        </h1>
        <p className="text-muted-foreground text-center text-sm">
          Complete the form to set up your organization
        </p>

        <FormProgress
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepClick={handleStepClick}
        />

        {currentStep.id === "admin-account" && (
          <CreateAdminStep
            defaultValues={formData.adminAccount}
            onSubmit={handleAdminAccountSubmit}
          />
        )}

        {currentStep.id === "organization-info" && (
          <OrganizationInfoStep
            defaultValues={formData.organization}
            onSubmit={handleOrgInfoSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
  );
}
