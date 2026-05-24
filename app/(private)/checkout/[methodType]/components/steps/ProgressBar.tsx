"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Fragment } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressBarProps) {
  return (
    <div className="flex items-center">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <Fragment key={step}>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCompleted && "bg-primary text-white",
                  isActive && "bg-accent text-white",
                  !isCompleted && !isActive && "bg-gray-200 text-gray-500",
                )}
              >
                {isCompleted ? <Check className="size-4" /> : step}
              </span>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:inline",
                  isActive ? "text-primary" : "text-gray-500",
                )}
              >
                {stepLabels[index]}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-gray-200",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
