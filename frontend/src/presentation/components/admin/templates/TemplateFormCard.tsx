// src/presentation/components/admin/templates/TemplateFormCard.tsx

import { ReactNode } from "react";

interface TemplateFormCardProps {
  children: ReactNode;
}

export function TemplateFormCard({ children }: TemplateFormCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {children}
    </div>
  );
}