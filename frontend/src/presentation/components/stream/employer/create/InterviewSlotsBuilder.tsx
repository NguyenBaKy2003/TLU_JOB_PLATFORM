// components/stream/employer/create/InterviewSlotsBuilder.tsx
import React from "react";
import { Plus, Trash2 } from "lucide-react";

export interface SlotInput {
  startTime: string;
  durationMinutes: number;
}

interface InterviewSlotsBuilderProps {
  slots: SlotInput[];
  onChange: (slots: SlotInput[]) => void;
}

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90];

export function InterviewSlotsBuilder({ slots, onChange }: InterviewSlotsBuilderProps) {
  const addSlot = () => {
    const last = slots[slots.length - 1];
    const defaultTime = last
      ? new Date(new Date(last.startTime).getTime() + 30 * 60000).toISOString().slice(0, 16)
      : new Date(Date.now() + 60 * 60000).toISOString().slice(0, 16);
    onChange([...slots, { startTime: defaultTime, durationMinutes: 30 }]);
  };

  const updateSlot = (i: number, patch: Partial<SlotInput>) => {
    const next = [...slots];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const removeSlot = (i: number) => {
    onChange(slots.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      {slots.map((slot, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
        >
          {/* Slot number */}
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-1">
            {i + 1}
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-medium">
                Thời gian bắt đầu
              </label>
              <input
                type="datetime-local"
                value={slot.startTime}
                onChange={(e) => updateSlot(i, { startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-medium">
                Thời lượng
              </label>
              <select
                value={slot.durationMinutes}
                onChange={(e) => updateSlot(i, { durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                {DURATION_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m} phút</option>
                ))}
              </select>
            </div>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeSlot(i)}
            className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 mt-1"
            title="Xóa slot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={addSlot}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Thêm slot phỏng vấn
      </button>
    </div>
  );
}