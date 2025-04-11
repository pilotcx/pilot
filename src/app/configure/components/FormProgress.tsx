import { Step } from "@/hooks/use-multi-step-form";
import { cn } from "@/lib/utils";

type FormProgressProps = {
  steps: Step[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
};

export function FormProgress({
  steps,
  currentStepIndex,
  onStepClick,
}: FormProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between border-b border-gray-200">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick && onStepClick(index)}
            disabled={!onStepClick || index > currentStepIndex}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-4 px-2 text-sm font-medium transition-all relative",
              index <= currentStepIndex 
                ? "text-primary" 
                : "text-gray-400",
              onStepClick && index <= currentStepIndex
                ? "cursor-pointer"
                : "cursor-default"
            )}
          >
            {step.title}
            {index === currentStepIndex && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {steps[currentStepIndex].description}
      </p>
    </div>
  );
}
