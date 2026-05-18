// src/presentation/components/admin/templates/TemplateFilters.tsx

interface TemplateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterStatus: "" | "active" | "inactive";
  onStatusChange: (value: "" | "active" | "inactive") => void;
}

export function TemplateFilters({
  search,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStatus,
  onStatusChange,
}: TemplateFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-48">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên template..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-[16px] transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>

      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[16px] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">Tất cả danh mục</option>
        <option value="professional">Professional</option>
        <option value="creative">Creative</option>
        <option value="simple">Simple</option>
      </select>

      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value as "" | "active" | "inactive")}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[16px] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Đang hiển thị</option>
        <option value="inactive">Đang ẩn</option>
      </select>
    </div>
  );
}