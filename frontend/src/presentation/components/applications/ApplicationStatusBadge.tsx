// src/presentation/components/applications/ApplicationStatusBadge.tsx
import type { ApplicationStatus } from "@/domain/models/Application";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_STYLES } from "@/domain/models/Application";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold
      rounded-full border whitespace-nowrap ${APPLICATION_STATUS_STYLES[status]}`}>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}