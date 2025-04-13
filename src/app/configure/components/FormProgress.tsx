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
    <div className="w-full mb-4">
      <div className="flex justify-between border-gray-200 pb-8">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick && onStepClick(index)}
            disabled={!onStepClick || index > currentStepIndex}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-4 px-2 text-sm font-medium transition-all relative",
              index <= currentStepIndex ? "text-primary" : "text-gray-400",
              onStepClick && index <= currentStepIndex
                ? "cursor-pointer"
                : "cursor-default"
            )}
          >
            {step.title}
            <div
              className={cn(
                "absolute -bottom-3 left-0 w-full h-0.5",
                index === currentStepIndex ? "bg-primary" : "bg-gray-200"
              )}
            />
            <div
              className={cn(
                "absolute z-10 text-gray-500 rounded-full w-5 h-5 text-xs flex items-center justify-center -bottom-5",
                index === currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-400 border bg-white"
              )}
            >
              {index + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
