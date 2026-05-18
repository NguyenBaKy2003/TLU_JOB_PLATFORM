// src/presentation/components/admin/templates/MetaRow.tsx

interface MetaRowProps {
  label: string;
  children: React.ReactNode;
}

export function MetaRow({ label, children }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-[16px] text-gray-500 dark:text-gray-400 min-w-28">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}