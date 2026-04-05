// src/presentation/components/employer/jobs/JobActionMenu.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Send,
         XCircle, Trash2, FileEdit }   from "lucide-react";
import type { JobStatus }              from "@/domain/models/Job";

interface Props {
  jobId:    string;
  status:   JobStatus;
  onPublish?: () => void;
  onClose?:   () => void;
  onDelete?:  () => void;
  onEdit?:    () => void;
  onView?:    () => void;
}

export function JobActionMenu({ jobId, status, onPublish, onClose, onDelete, onEdit, onView }: Props) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const item = (
    icon: React.ReactNode, label: string,
    onClick: (() => void) | undefined, danger = false,
  ) => onClick ? (
    <button key={label}
      onClick={() => { onClick(); setOpen(false); }}
      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left
        transition-colors ${danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"}`}>
      <span className={danger ? "text-red-400" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  ) : null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="w-8 h-8 flex items-center justify-center text-gray-400
          hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl
          border border-gray-100 shadow-lg py-1 z-20">
          {item(<Eye size={14} />, "Xem trước", onView)}
          {item(<FileEdit size={14} />, "Chỉnh sửa", onEdit)}
          {status === "DRAFT" && item(<Send size={14} />, "Đăng tin", onPublish)}
          {status === "PUBLISHED" && item(<XCircle size={14} />, "Đóng tin", onClose)}
          {(status === "DRAFT" || status === "CLOSED" || status === "EXPIRED") &&
            <>
              <hr className="my-1 border-gray-100" />
              {item(<Trash2 size={14} />, "Xóa bài đăng", onDelete, true)}
            </>
          }
        </div>
      )}
    </div>
  );
}