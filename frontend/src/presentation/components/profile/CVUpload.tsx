"use client";

import React, { useCallback, useState } from "react";
import { FileText, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

interface CVUploadProps {
  onUpload?: (file: File) => void;
  currentFile?: string;
  onRemove?: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function CVUpload({ onUpload, currentFile, onRemove }: CVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>(currentFile ? "success" : "idle");
  const [fileName, setFileName] = useState(currentFile ?? "");
  const [fileSize, setFileSize] = useState("");
  const [progress, setProgress] = useState(0);

  const simulateUpload = (file: File) => {
    setFileName(file.name);
    setFileSize(`${Math.round(file.size / 1024)} KB`);
    setUploadState("uploading");
    setProgress(0);

    // Simulate progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        clearInterval(interval);
        // Simulate random error for demo — replace with real upload logic
        const success = Math.random() > 0.3;
        if (success) {
          setProgress(100);
          setUploadState("success");
          onUpload?.(file);
        } else {
          setProgress(20);
          setUploadState("error");
        }
      } else {
        setProgress(Math.min(p, 95));
      }
    }, 150);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    simulateUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const openPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  const handleRetry = () => {
    setUploadState("idle");
    setProgress(0);
    openPicker();
  };

  const handleRemove = () => {
    setUploadState("idle");
    setFileName("");
    setFileSize("");
    setProgress(0);
    onRemove?.();
  };

  // ── Error state ──────────────────────────────────────────────
  if (uploadState === "error") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center space-y-4">
        <div>
          <p className="text-base font-bold text-red-500">Lỗi</p>
          <p className="text-xs text-gray-400">Không thể tải tệp lên.</p>
        </div>

        <div className="border-2 border-dashed border-red-200 rounded-xl p-5 space-y-2">
          <div className="w-12 h-12 mx-auto bg-red-50 rounded-2xl flex items-center justify-center border border-red-200">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800">{fileName}</p>
          <p className="text-xs text-gray-400">{fileSize}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-red-500 font-medium tabular-nums">{progress}%</span>
          </div>
        </div>

        <button onClick={handleRetry}
          className="w-full py-2.5 text-sm font-semibold text-red-500 border-2 border-red-300 rounded-xl hover:bg-red-50 transition-all">
          Thử lại
        </button>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────
  if (uploadState === "success") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center space-y-4">
        <div>
          <p className="text-base font-bold text-blue-600">CV đã tải lên</p>
          <p className="text-xs text-gray-400">Tải tệp lên thành công!</p>
        </div>

        <div className="relative border-2 border-dashed border-blue-200 rounded-xl p-5 space-y-2">
          <button onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg transition-colors bg-white">
            <Trash2 size={13} />
          </button>
          <div className="w-12 h-12 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
            <FileText size={22} className="text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800">{fileName}</p>
          <p className="text-xs text-gray-400">{fileSize}</p>
        </div>

        <button onClick={openPicker}
          className="w-full py-2.5 text-sm font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all">
          Thay đổi tệp
        </button>
      </div>
    );
  }

  // ── Idle / uploading state ────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Tải CV của bạn lên</h3>
        <p className="text-xs text-gray-400 mt-0.5">Bạn có thể đính kèm một tệp CV riêng tại đây.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={uploadState === "idle" ? openPicker : undefined}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all ${
          uploadState === "uploading"
            ? "border-blue-300 bg-blue-50 cursor-default"
            : isDragging
            ? "border-blue-400 bg-blue-50 cursor-copy"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer"
        }`}
      >
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
          <FileText size={20} className="text-blue-500" />
        </div>

        {uploadState === "uploading" ? (
          <div className="w-full space-y-1.5 text-center">
            <p className="text-sm font-semibold text-gray-800">{fileName}</p>
            <p className="text-xs text-gray-400">{fileSize}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-blue-600 font-medium tabular-nums">{Math.round(progress)}%</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600">
              Kéo & Thả hoặc <span className="text-blue-600">Chọn tệp</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Định dạng PDF, tối đa 10 MB</p>
          </div>
        )}
      </div>

      {uploadState === "idle" && (
        <button onClick={openPicker}
          className="w-full py-2.5 text-sm font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all">
          Tải lên CV
        </button>
      )}
    </div>
  );
}