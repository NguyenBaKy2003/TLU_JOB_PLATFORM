// src/presentation/components/settings/NameSection.tsx
"use client";
import { useState }        from "react";
import { User, Pencil, Check, X, SquarePen } from "lucide-react";
import { SectionCard }     from "./SectionCard";
import { useToast }        from "@/presentation/components/ui/toast";

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

interface Props { firstName: string;  }

export function NameSection({ firstName: initFirst,  }: Props) {
  const toast = useToast();
  const [editing,    setEditing]    = useState(false);
  const [firstName,  setFirstName]  = useState(initFirst);
//   const [lastName,   setLastName]   = useState(initLast);

  const handleSave = async () => {
    // TODO: call service.updateName(firstName, lastName)
    setEditing(false);
    toast.success("Đã lưu", "Họ và tên đã được cập nhật.");
  };

  return (
    <SectionCard icon={<User size={16} />} title="Họ và tên">
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 block">Tên</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} placeholder="Tên" />
            </div>
            {/* <div>
              <label className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 block">Họ</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} placeholder="Họ" />
            </div> */}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <X size={14} /> Hủy
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
              <Check size={14} /> Lưu
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="grid grid-cols-1 gap-8 flex-1">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Tên</p>
              <p className="text-sm font-medium text-gray-800">{firstName || "—"}</p>
            </div>
            {/* <div>
              <p className="text-xs text-gray-400 mb-0.5">Họ</p>
              <p className="text-sm font-medium text-gray-800">{lastName || "—"}</p>
            </div> */}
          </div>
          <button onClick={() => setEditing(true)}
            className="shrink-0 p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <SquarePen size={15} />
          </button>
        </div>
      )}
    </SectionCard>
  );
}