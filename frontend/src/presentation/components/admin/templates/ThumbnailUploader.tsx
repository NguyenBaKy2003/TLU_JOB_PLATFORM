// src/presentation/components/admin/templates/ThumbnailUploader.tsx
"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface ThumbnailUploaderProps {
  /** URL thumbnail hiện tại từ server */
  currentUrl?: string | null;
  /**
   * File đang pending (do page quản lý).
   * Khi prop này thay đổi, component tự tạo ObjectURL để preview.
   */
  pendingFile?: File | null;
  /** Emit khi user chọn file hợp lệ */
  onFileSelect: (file: File) => void;
  /** Đang upload */
  uploading?: boolean;
  /** Lỗi từ server */
  error?: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Drag-and-drop thumbnail uploader.
 *
 * Preview priority: pendingFile ObjectURL > currentUrl > empty state.
 * Validate MIME + size ở client; lỗi server nhận qua prop `error`.
 * Không tự gọi API.
 */
export function ThumbnailUploader({
  currentUrl,
  pendingFile,
  onFileSelect,
  uploading = false,
  error: externalError,
}: ThumbnailUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Tạo / huỷ ObjectURL khi pendingFile thay đổi
  useEffect(() => {
    if (!pendingFile) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const displayError = externalError ?? localError;
  // Ưu tiên: preview file mới > URL server > trống
  const displayUrl = objectUrl ?? currentUrl ?? null;

  // ── Validate & emit ───────────────────────

  const processFile = useCallback(
    (file: File) => {
      setLocalError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setLocalError("Chỉ chấp nhận JPEG, PNG, WEBP.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setLocalError(`Ảnh tối đa ${MAX_SIZE_MB}MB.`);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  // ── Event handlers ────────────────────────

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function openPicker() {
    if (!uploading) inputRef.current?.click();
  }

  // ── Render ────

  return (
    <div className="space-y-2">
      <label className="block text-[16px] font-medium text-gray-700 dark:text-gray-300">
        Thumbnail
      </label>

      <div
        role="button"
        tabIndex={0}
        aria-label="Chọn hoặc kéo thả ảnh thumbnail"
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPicker();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-150",
          "cursor-pointer select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          uploading
            ? "cursor-not-allowed opacity-60"
            : dragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            : displayError
            ? "border-red-400 bg-red-50 dark:bg-red-950/20"
            : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-indigo-950/20",
          displayUrl ? "h-48" : "h-36",
        ].join(" ")}
      >
        {displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Thumbnail preview"
              className="h-full w-full rounded-xl object-cover"
            />
            {!uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity duration-150 hover:opacity-100">
                <UploadIcon className="h-7 w-7 text-white" />
                <span className="mt-1 text-xs font-medium text-white">Đổi ảnh</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <ImageIcon
              className={[
                "h-10 w-10",
                dragging ? "text-indigo-500" : "text-gray-400 dark:text-gray-500",
              ].join(" ")}
            />
            <p className="text-[16px] font-medium text-gray-600 dark:text-gray-400">
              Kéo thả hoặc{" "}
              <span className="underline underline-offset-2 text-indigo-600 dark:text-indigo-400">
                chọn file
              </span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              JPEG, PNG, WEBP — tối đa {MAX_SIZE_MB}MB
            </p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 dark:bg-gray-900/70">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}
      </div>

      {displayError && (
        <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertIcon className="h-3.5 w-3.5 shrink-0" />
          {displayError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
        disabled={uploading}
      />
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
      fill="currentColor" className={className}>
      <path fillRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd" />
    </svg>
  );
}