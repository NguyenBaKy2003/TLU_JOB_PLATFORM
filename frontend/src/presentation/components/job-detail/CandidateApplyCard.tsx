"use client";
import { CheckCircle2 } from "lucide-react";
import type { JobPostDetail } from "@/domain/models/Job";
import { AppliedBadge, formatSalary } from "./JobDetailComponents";

interface CandidateApplyCardProps {
  job:          JobPostDetail;
  applied:      boolean;
  saved:        boolean;
  applyDone:    boolean;
  onApply:      () => void;
  onSave:       () => void;
}

export function CandidateApplyCard({
  job, applied, saved, applyDone, onApply, onSave,
}: CandidateApplyCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 mb-1">Mức lương</p>
      <p className="text-2xl font-bold text-blue-600 mb-4">{formatSalary(job)}</p>

      {applied ? (
        <AppliedBadge />
      ) : (
        <button
          onClick={onApply}
          disabled={!job.acceptingApplications}
          className="w-full py-3 bg-blue-600 text-white text-[16px] font-semibold
            rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors flex items-center justify-center gap-2">
          Ứng tuyển ngay
        </button>
      )}

      {!applied && (
        <button onClick={onSave}
          className={`w-full py-2.5 text-[16px] font-medium rounded-xl border
            transition-colors mt-2 ${saved
              ? "border-blue-300 bg-blue-50 text-blue-600"
              : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"}`}>
          {saved ? "Đã lưu" : "Lưu tin"}
        </button>
      )}

      {!job.acceptingApplications && !applied && (
        <p className="text-[11px] text-red-400 text-center mt-2">
          Tin tuyển dụng đã hết hạn
        </p>
      )}

      {applyDone && (
        <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200
          rounded-xl text-[11px] text-green-700 flex items-center gap-1.5">
          <CheckCircle2 size={12} />
          Nộp đơn thành công! Nhà tuyển dụng sẽ liên hệ bạn sớm.
        </div>
      )}
    </div>
  );
}