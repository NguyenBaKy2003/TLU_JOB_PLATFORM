// src/presentation/components/settings/NameSection.tsx
"use client";
import { useState }        from "react";
import { User, Check, X, SquarePen, Loader2 } from "lucide-react";
import { SectionCard }     from "./SectionCard";
import { useToast }        from "@/presentation/components/ui/toast";
import { SettingService }  from "@/application/services/SettingService";
import { SettingRepository } from "@/infrastructure/repositories/SettingRepository";

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

const service = new SettingService(new SettingRepository());

interface Props {
  firstName: string;
}

export function NameSection({ firstName: initFirst }: Props) {
  const toast     = useToast();
  const [editing,   setEditing]   = useState(false);
  const [firstName, setFirstName] = useState(initFirst);
  const [loading,   setLoading]   = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await service.updateName({ fullName: firstName.trim() });
      setEditing(false);
      toast.success("Đã lưu", "Họ và tên đã được cập nhật.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra.";
      toast.error("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(initFirst);
    setEditing(false);
  };

  return (
    <SectionCard icon={<User size={16} />} title="Họ và tên">
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 block">
                Họ và tên
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputCls}
                placeholder="Họ và tên đầy đủ"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <X size={14} /> Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !firstName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-0.5">Tên</p>
            <p className="text-sm font-medium text-gray-800">{firstName || "—"}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <SquarePen size={15} />
          </button>
        </div>
      )}
    </SectionCard>
  );
}