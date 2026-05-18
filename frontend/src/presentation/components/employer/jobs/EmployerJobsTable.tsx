// src/presentation/components/employer/jobs/EmployerJobsTable.tsx
"use client";
import Link                from "next/link";
import { Users, MapPin,
         CalendarDays }    from "lucide-react";
import { JobStatusBadge }  from "./JobStatusBadge";
import { JobActionMenu }   from "./JobActionMenu";
import type { JobPost }    from "@/domain/models/Job";
import { JOB_TYPE_LABELS } from "@/domain/models/Job";

// ── Helpers 


function daysLeft(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN",
    { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Props ──

interface Props {
  jobs:      JobPost[];
  onPublish: (id: string) => void;
  onClose:   (id: string) => void;
  onDelete:  (id: string) => void;
}

// ── Component ─────────────

export function EmployerJobsTable({ jobs, onPublish, onClose, onDelete }: Props) {
  if (jobs.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border n border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto min-h-screen">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-50">
              {["Công việc", "Trạng thái", "Lượt ứng tuyển",
                "Mức lương", "Hạn nộp", ""].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold
                  text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.map(job => {
              const dl = daysLeft(job.deadline);
              return (
                <tr key={job.id} className="hover:bg-gray-50/60 transition-colors group">

                  {/* Job info */}
                  <td className="px-5 py-4">
                    <p className="text-[16px] font-semibold text-gray-900 group-hover:text-blue-600
                      transition-colors truncate max-w-[400px]">
                      {job.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
                      {job.jobType && (
                        <span>{JOB_TYPE_LABELS[job.jobType]}</span>
                      )}
                      {job.workLocation?.city && (
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} /> {job.workLocation.city}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <JobStatusBadge status={job.status} />
                  </td>

                  {/* Applications */}
                  <td className="px-5 py-4">
                    <Link href={`/employer/jobs/${job.id}/applications`}
                      className="flex items-center gap-1.5 text-[16px] text-gray-700
                        hover:text-blue-600 transition-colors w-fit">
                      <Users size={13} className="text-gray-400" />
                      <span className="font-semibold">{job?.applicationCount}</span>
                      <span className="text-gray-400 text-xs">lượt</span>
                    </Link>
                  </td>

                  {/* Salary */}
                  <td className="px-5 py-4">
                    <span className="text-[16px] font-semibold text-blue-600">
                      {job?.salaryDisplay}
                    </span>
                  </td>

                  {/* Deadline */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CalendarDays size={12} className="text-gray-400" />
                      <span>{formatDate(job.deadline)}</span>
                    </div>
                    {job.status === "PUBLISHED" && (
                      <p className={`text-[11px] mt-0.5 font-medium ${
                        dl <= 3 ? "text-red-500" : dl <= 7 ? "text-yellow-600" : "text-gray-400"
                      }`}>
                        {dl === 0 ? "Hết hạn hôm nay" : `Còn ${dl} ngày`}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <JobActionMenu
                      jobId={job.id}
                      status={job.status}
                      onView={()    => window.open(`/jobs/${job.id}`, "_blank")}
                      onEdit={()    => window.location.href = `/employer/jobs/${job.id}/edit`}
                      onPublish={() => onPublish(job.id)}
                      onClose={()   => onClose(job.id)}
                      onDelete={()  => onDelete(job.id)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}