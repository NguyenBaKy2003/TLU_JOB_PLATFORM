// components/stream/employer/create/StepIndicator.tsx
import React from "react";
import { ChevronRight } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;

        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[16px] font-semibold transition-all
                  ${isDone || isActive
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-400"
                  }`}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className={`text-[16px] font-medium hidden sm:block ${
                  isActive ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}