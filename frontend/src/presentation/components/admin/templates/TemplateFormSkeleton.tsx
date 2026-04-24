// src/presentation/components/admin/templates/TemplateFormSkeleton.tsx

export function TemplateFormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-4 px-6 py-6">
            {[80, 60, 40, 100, 200].map((h, i) => (
              <div 
                key={i} 
                className="animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" 
                style={{ height: h }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}