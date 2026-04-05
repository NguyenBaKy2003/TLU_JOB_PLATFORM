// src/presentation/components/employer/jobs/JobStatusBadge.tsx
import type { JobStatus } from "@/domain/models/Job";
import { JOB_STATUS_LABELS } from "@/domain/models/Job";

const STATUS_STYLES: Record<JobStatus, string> = {
  DRAFT:     "bg-gray-100 text-gray-600 border-gray-200",
  PUBLISHED: "bg-green-50 text-green-700 border-green-200",
  CLOSED:    "bg-red-50 text-red-600 border-red-200",
  EXPIRED:   "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold
      rounded-full border ${STATUS_STYLES[status]}`}>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}