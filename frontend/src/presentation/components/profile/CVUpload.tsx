"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface CVUploadProps {
  onUpload?: (file: File) => void;
  currentFile?: string;
  onRemove?: () => void;
}

export function CVUpload({ onUpload, currentFile, onRemove }: CVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        onUpload?.(file);
      }
    },
    [onUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload?.(file);
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onUpload?.(file);
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">Tải CV của bạn lên</h3>
      <p className="text-xs text-gray-400 mb-4">
        Bạn có thể đính kèm một tệp CV riêng tại đây.
      </p>

      {currentFile ? (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <FileText size={20} className="text-blue-600 flex-shrink-0" />
          <span className="text-xs text-blue-700 font-medium flex-1 truncate">
            {currentFile}
          </span>
          <button
            onClick={onRemove}
            className="w-5 h-5 flex items-center justify-center text-blue-400 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all cursor-pointer ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
          onClick={handleBrowse}
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Upload size={18} className="text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600">
              Kéo & Thả hoặc{" "}
              <span className="text-blue-600">Chọn tệp</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Tải lên (Định dạng PDF, tối đa 10 MB).
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleBrowse}
        className="w-full mt-3 py-2.5 text-sm font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all"
      >
        Tải lên CV
      </button>
    </div>
  );
}