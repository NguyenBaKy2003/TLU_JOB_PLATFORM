// src/presentation/components/admin/templates/TemplateThumbnail.tsx

interface TemplateThumbnailProps {
  thumbnailUrl: string | null;
  name: string;
}

export function TemplateThumbnail({ thumbnailUrl, name }: TemplateThumbnailProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="aspect-video w-full bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-indigo-950 dark:to-slate-900">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-10 w-10 text-indigo-200 dark:text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}