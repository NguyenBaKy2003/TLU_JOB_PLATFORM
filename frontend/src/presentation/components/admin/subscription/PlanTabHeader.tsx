// src/presentation/components/admin/subscription/PlanTabHeader.tsx
import { Plus } from "lucide-react";

interface Props {
  count:    number;
  onCreate: () => void;
}

export function PlanTabHeader({ count, onCreate }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">
        <strong className="text-gray-800">{count}</strong> gói dịch vụ
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white
          text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
      >
        <Plus size={16} /> Tạo gói mới
      </button>
    </div>
  );
}