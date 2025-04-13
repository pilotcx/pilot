import { useState } from 'react';

export type Step = {
  id: string;
  title: string;
};

export function useMultiStepForm<T>(steps: Step[], initialData: T) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<T>(initialData);

  function next() {
    setCurrentStepIndex(i => {
      if (i >= steps.length - 1) return i;
      return i + 1;
    });
  }

  function back() {
    setCurrentStepIndex(i => {
      if (i <= 0) return i;
      return i - 1;
    });
  }

  function goTo(index: number) {
    setCurrentStepIndex(index);
  }

  function updateFormData(values: Partial<T>) {
    setFormData(prev => ({ ...prev, ...values }));
  }

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    steps,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    goTo,
    next,
    back,
    formData,
    updateFormData,
  };
}
