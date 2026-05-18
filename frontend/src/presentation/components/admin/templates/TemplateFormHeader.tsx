// src/presentation/components/admin/templates/TemplateFormHeader.tsx

import { ReactNode } from "react";

interface TemplateFormHeaderProps {
  title: string;
  subtitle?: string;
  templateId?: string;
  children?: ReactNode;
}

export function TemplateFormHeader({ 
  title, 
  subtitle, 
  templateId, 
  children 
}: TemplateFormHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-[16px] text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        {templateId && (
          <p className="mt-0.5 font-mono text-xs text-gray-400">{templateId}</p>
        )}
      </div>
      {children}
    </div>
  );
}