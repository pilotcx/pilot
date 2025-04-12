"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Step, useMultiStepForm } from "@/hooks/use-multi-step-form";
import {
  OrganizationAddress,
  OrganizationBasicInfo,
  OrganizationComplete,
  OrganizationContact,
  Industry,
  OrganizationSize,
  OrganizationStructure,
  UserRole
} from "@/lib/validations/organization";
import axios from "axios";
import { useState, useEffect } from "react";
import { AddressStep } from "./AddressStep";
import { BasicInfoStep } from "./BasicInfoStep";
import { ContactInfoStep } from "./ContactInfoStep";
import { FormProgress } from "./FormProgress";

const FORM_STEPS: Step[] = [
  {
    id: "basic-info",
    title: "Basic Info",
    description: "Enter your organization's basic information",
  },
  {
    id: "contact",
    title: "Contact",
    description: "Provide contact details for your organization",
  },
  {
    id: "address",
    title: "Address",
    description: "Add your organization's physical address",
  },
];

const INITIAL_DATA: OrganizationComplete = {
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

  streetAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function OrganizationSetupForm() {
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
  } = useMultiStepForm<OrganizationComplete>(FORM_STEPS, INITIAL_DATA);

  useEffect(() => {
    console.log("Current step:", currentStep.id);
    console.log("Current form data:", formData);
  }, [currentStep, formData]);

  const handleStepClick = (index: number) => {
    if (index <= currentStepIndex) {
      goTo(index);
    }
  };

  const handleNext = () => {
    console.log("Next button clicked, advancing to next step");
    next();
  };

  const handleBack = () => {
    console.log("Back button clicked");
    back();
  };

  const handleUpdateFormData = (data: Partial<OrganizationComplete>) => {
    console.log("Updating form data with:", data);
    updateFormData(data);
  };

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      setSuccess(true);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
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
        
        {currentStep.id === "basic-info" && (
          <BasicInfoStep
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
          />
        )}
        
        {currentStep.id === "contact" && (
          <ContactInfoStep
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep.id === "address" && (
          <AddressStep
            data={formData}
            onUpdate={handleUpdateFormData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
  );
}
