// src/presentation/components/applications/ScheduleInterviewModal.tsx
"use client";
import { useState }                   from "react";
import { X, Calendar, MapPin, Check } from "lucide-react";
import { ApplicationService }         from "@/application/services/ApplicationService";
import { ApplicationRepository }      from "@/infrastructure/repositories/ApplicationRepository";
import { useToast }                   from "@/presentation/components/ui/toast";
import { extractErrorMessage }        from "@/lib/extractErrorMessage";

const service = new ApplicationService(new ApplicationRepository());

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

interface Props {
  applicationId:  string;
  candidateName:  string;
  onSuccess:      () => void;
  onClose:        () => void;
}

export function ScheduleInterviewModal({
  applicationId, candidateName, onSuccess, onClose,
}: Props) {
  const toast = useToast();

  const [scheduledAt, setScheduledAt] = useState("");
  const [location,    setLocation]    = useState("");
  const [note,        setNote]        = useState("");
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState<{ scheduledAt?: string; location?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!scheduledAt)      e.scheduledAt = "Vui lòng chọn thời gian";
    if (!location.trim())  e.location    = "Vui lòng nhập địa điểm";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await service.scheduleInterview(applicationId, { scheduledAt, location, note: note || undefined });
      toast.success("Thành công", "Đã lên lịch phỏng vấn.");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Lên lịch phỏng vấn</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="px-4 py-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 font-medium">
              Ứng viên: <strong>{candidateName}</strong>
            </p>
          </div>

          {/* Thời gian */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" /> Thời gian phỏng vấn *
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minDate}
              onChange={e => {
                setScheduledAt(e.target.value);
                setErrors(p => ({ ...p, scheduledAt: undefined }));
              }}
              className={inputCls + (errors.scheduledAt ? " border-red-300" : "")}
            />
            {errors.scheduledAt && (
              <p className="text-[11px] text-red-500">{errors.scheduledAt}</p>
            )}
          </div>

          {/* Địa điểm */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <MapPin size={12} className="text-gray-400" /> Địa điểm *
            </label>
            <input
              value={location}
              onChange={e => {
                setLocation(e.target.value);
                setErrors(p => ({ ...p, location: undefined }));
              }}
              placeholder="VD: Tầng 5, 140 Nguyễn Trãi hoặc Google Meet: ..."
              className={inputCls + (errors.location ? " border-red-300" : "")}
            />
            {errors.location && (
              <p className="text-[11px] text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Ghi chú */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Ghi chú (tuỳ chọn)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Hướng dẫn cụ thể, cần mang theo tài liệu gì..."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100
                rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm
                font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700
                disabled:opacity-50 transition-colors"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Check size={15} />}
              {saving ? "Đang lưu..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}