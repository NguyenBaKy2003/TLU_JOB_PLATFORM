// src/presentation/components/settings/DeviceItem.tsx
import { X } from "lucide-react";

interface Props {
  icon:     React.ReactNode;
  name:     string;
  detail:   string;
  location: string;
  current?: boolean;
  onLogout?: () => void;
}

export function DeviceItem({ icon, name, detail, location, current, onLogout }: Props) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl ${current ? "bg-blue-50/60" : "bg-gray-50"}`}>
      <div className={`p-2 rounded-lg shrink-0 ${current ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-medium text-gray-800 truncate">{name}</p>
          {current && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-100 rounded-full shrink-0">
              Hiện tại
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{detail}</p>
        <p className="text-xs text-gray-400 truncate">{location}</p>
      </div>
      {!current && onLogout && (
        <button onClick={onLogout}
          className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}