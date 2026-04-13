// src/presentation/components/applications/CandidateDetailPanel.tsx
"use client";
import { useState, useEffect } from "react";
import { Mail, Phone, FileText, Calendar, Clock, Zap } from "lucide-react";
import { CandidateAvatar } from "./CandidateAvatar";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { StatusDropdown } from "./StatusDropdown";
import { StatusTimeline } from "./StatusTimeline";
import { ApplicationService } from "@/application/services/ApplicationService";
import { ApplicationRepository } from "@/infrastructure/repositories/ApplicationRepository";
import type {
  ApplicationWithCandidate,
  ApplicationStatusLog,
  ApplicationStatus,
} from "@/domain/models/Application";

const service = new ApplicationService(new ApplicationRepository());

export function CandidateDetailPanel({
  app,
  onStatusChange,
  onScheduleInterview,
}: {
  app: ApplicationWithCandidate;
  onStatusChange: (s: ApplicationStatus, note?: string) => void;
  onScheduleInterview: () => void;
}) {
  const [logs, setLogs] = useState<ApplicationStatusLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    service
      .getStatusLogs(app.id)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [app.id]);

  const canSchedule = service.canScheduleInterview(app);

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">

      {/* Candidate header */}
      <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <CandidateAvatar name={app.candidateName} src={app.candidateAvatar} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{app.candidateName}</p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <a
              href={`mailto:${app.candidateEmail}`}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
            >
              <Mail size={11} /> {app.candidateEmail}
            </a>
            {app.candidatePhone && (
              <a
                href={`tel:${app.candidatePhone}`}
                className="text-xs text-gray-500 flex items-center gap-1"
              >
                <Phone size={11} /> {app.candidatePhone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status + actions */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <ApplicationStatusBadge status={app.status} />
          <StatusDropdown current={app.status} onChange={onStatusChange} />
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={app.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-xs
              font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <FileText size={13} /> Xem CV
          </a>
          {canSchedule && (
            <button
              onClick={onScheduleInterview}
              className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl text-xs
                font-medium text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <Calendar size={13} /> Lên lịch phỏng vấn
            </button>
          )}
        </div>
      </div>

      {/* Application info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Thông tin đơn
        </p>
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ngày nộp</span>
            <span className="font-medium text-gray-800">
              {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          {app.expectedSalary && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Lương mong muốn</span>
              <span className="font-medium text-blue-600">
                {app.expectedSalary.toLocaleString()} VND
              </span>
            </div>
          )}
          {app.aiScore != null && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <Zap size={12} /> Điểm AI
              </span>
              <span
                className={`font-bold ${
                  app.aiScore >= 80
                    ? "text-green-600"
                    : app.aiScore >= 60
                    ? "text-yellow-600"
                    : "text-red-500"
                }`}
              >
                {app.aiScore}/100
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cover letter */}
      {app.coverLetter && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Thư xin việc
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {app.coverLetter}
          </p>
        </div>
      )}

      {/* Interview info */}
      {app.scheduledAt && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
            <Clock size={12} /> Lịch phỏng vấn
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(app.scheduledAt).toLocaleString("vi-VN")}
          </p>
          {app.interviewLocation && (
            <p className="text-xs text-gray-600 mt-0.5">{app.interviewLocation}</p>
          )}
          {app.interviewNote && (
            <p className="text-xs text-gray-500 mt-1 italic">{app.interviewNote}</p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Lịch sử trạng thái
        </p>
        <StatusTimeline logs={logs} loading={loading} />
      </div>
    </div>
  );
}