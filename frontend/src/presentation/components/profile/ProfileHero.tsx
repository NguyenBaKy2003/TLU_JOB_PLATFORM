"use client";

import { Download, Eye, SquarePen } from "lucide-react";
import Image                        from "next/image";
import { useRef, useState }         from "react";

interface ProfileHeroProps {
  firstName?:      string;
  lastName?:       string;
  title?:          string;
  avatar?:         string;
  onAvatarChange?: (file: File) => Promise<void>;
  onViewCV?:       () => Promise<void>;
  onDownloadCV?:   () => Promise<void>;
}

export default function ProfileHero({
  firstName, lastName, title, avatar,
  onAvatarChange, onViewCV, onDownloadCV,
}: ProfileHeroProps) {
  const fileRef                         = useRef<HTMLInputElement>(null);
  const [uploading,    setUploading]    = useState(false);
  const [preview,      setPreview]      = useState<string | undefined>(avatar);
  const [cvLoading,    setCvLoading]    = useState<"view" | "download" | null>(null);

  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const initials    = (firstName?.charAt(0) ?? lastName?.charAt(0) ?? "?").toUpperCase();

  // ── Avatar ────────────

  const handleAvatarFile = async (file: File) => {
    if (!onAvatarChange) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    try { await onAvatarChange(file); }
    catch { setPreview(avatar); }
    finally { setUploading(false); URL.revokeObjectURL(localUrl); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleAvatarFile(f);
    e.target.value = "";
  };

  // ── CV ─

  const handleViewCV = async () => {
    if (!onViewCV || cvLoading) return;
    setCvLoading("view");
    try { await onViewCV(); } finally { setCvLoading(null); }
  };

  const handleDownloadCV = async () => {
    if (!onDownloadCV || cvLoading) return;
    setCvLoading("download");
    try { await onDownloadCV(); } finally { setCvLoading(null); }
  };

  // ──────

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-100 shadow-sm">

      {/*
        Mobile:  avatar + info trên 1 hàng, CV buttons xuống hàng dưới
        Desktop: tất cả trên 1 hàng
      */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Row 1 trên mobile: avatar + info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">

          {/* Avatar */}
          <div
            className="relative shrink-0 cursor-pointer group"
            onClick={() => !uploading && fileRef.current?.click()}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden
              border-2 border-gray-200 bg-gray-200 flex items-center justify-center">
              {preview ? (
                <Image
                  src={preview}
                  alt={displayName || "avatar"}
                  width={80} height={80}
                  className={`object-cover w-full h-full transition-opacity
                    ${uploading ? "opacity-60" : "opacity-100"}`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-500
                  flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-white">{initials}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center
                  bg-black/20 rounded-2xl">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200
              rounded-full flex items-center justify-center shadow-sm
              group-hover:bg-blue-50 transition-colors">
              <SquarePen size={11} className="text-blue-600" />
            </div>

            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleFileChange} />
          </div>

          {/* Name + headline */}
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-blue-600 truncate">
              {displayName || (
                <span className="text-gray-400 font-normal italic text-sm sm:text-base">
                  Chưa có tên
                </span>
              )}
            </h2>
            {title && (
              <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{title}</p>
            )}
          </div>
        </div>

        {/* CV buttons — full width trên mobile, inline trên desktop */}
        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            onClick={handleViewCV}
            disabled={!!cvLoading || !onViewCV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5
              px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg
              hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            {cvLoading === "view"
              ? <span className="w-3.5 h-3.5 border-2 border-blue-400/40 border-t-blue-600 rounded-full animate-spin" />
              : <Eye size={15} />}
            <span>Xem CV</span>
          </button>

          <button
            onClick={handleDownloadCV}
            disabled={!!cvLoading || !onDownloadCV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5
              px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
              hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {cvLoading === "download"
              ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Download size={15} />}
            {/* Label rút gọn trên mobile */}
            <span className="hidden sm:inline">Tải xuống bản PDF</span>
            <span className="sm:hidden">Tải xuống</span>
          </button>
        </div>

      </div>
    </div>
  );
}