"use client";

import { Download, Eye, SquarePen, Check, X } from "lucide-react";
import Image                                   from "next/image";
import { useRef, useState }                    from "react";

interface ProfileHeroProps {
  firstName?:       string;
  lastName?:        string;
  title?:           string;
  avatar?:          string;
  onAvatarChange?:  (file: File) => Promise<void>;
  onViewCV?:        () => Promise<void>;
  onDownloadCV?:    () => Promise<void>;
  onTitleChange?:   (title: string) => Promise<void>; // ← thêm
}

export default function ProfileHero({
  firstName, lastName, title, avatar,
  onAvatarChange, onViewCV, onDownloadCV, onTitleChange,
}: ProfileHeroProps) {
  const fileRef                            = useRef<HTMLInputElement>(null);
  const inputRef                           = useRef<HTMLInputElement>(null);
  const [uploading,    setUploading]       = useState(false);
  const [preview,      setPreview]         = useState<string | undefined>(avatar);
  const [cvLoading,    setCvLoading]       = useState<"view" | "download" | null>(null);

  // ── Headline state ─
  const [editingTitle, setEditingTitle]    = useState(false);
  const [titleDraft,   setTitleDraft]      = useState(title ?? "");
  const [savingTitle,  setSavingTitle]     = useState(false);

  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const initials    = (firstName?.charAt(0) ?? lastName?.charAt(0) ?? "?").toUpperCase();

  // ── Avatar ─────────
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

  // ── Headline ───────
  const startEditTitle = () => {
    setTitleDraft(title ?? "");
    setEditingTitle(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelEditTitle = () => {
    setTitleDraft(title ?? "");
    setEditingTitle(false);
  };

  const saveTitle = async () => {
    if (!onTitleChange) return;
    setSavingTitle(true);
    try {
      await onTitleChange(titleDraft.trim());
      setEditingTitle(false);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  saveTitle();
    if (e.key === "Escape") cancelEditTitle();
  };

  // ── CV ─────────────
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

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Avatar + info */}
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
                  src={preview} alt={displayName || "avatar"}
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
                <span className="text-gray-400 font-normal italic text-[16px] sm:text-base">
                  Chưa có tên
                </span>
              )}
            </h2>

            {/* ── Headline inline edit ── */}
            {editingTitle ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  ref={inputRef}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  disabled={savingTitle}
                  maxLength={100}
                  placeholder="Thêm headline..."
                  className="flex-1 min-w-0 px-2 py-0.5 text-xs sm:text-[16px] text-gray-700
                    border border-blue-400 rounded-md outline-none ring-2 ring-blue-100
                    placeholder:text-gray-300 disabled:opacity-50"
                />
                {/* Confirm */}
                <button
                  onClick={saveTitle}
                  disabled={savingTitle}
                  className="shrink-0 w-6 h-6 flex items-center justify-center
                    rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {savingTitle
                    ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Check size={12} className="text-white" />}
                </button>
                {/* Cancel */}
                <button
                  onClick={cancelEditTitle}
                  disabled={savingTitle}
                  className="shrink-0 w-6 h-6 flex items-center justify-center
                    rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  <X size={12} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-0.5 group/headline">
                <p className="text-xs sm:text-[16px] text-gray-500 truncate">
                  {title || (
                    <span className="text-gray-300 italic">Thêm headline</span>
                  )}
                </p>
                {onTitleChange && (
                  <button
                    onClick={startEditTitle}
                    className="shrink-0 opacity-0 group-hover/headline:opacity-100
                      transition-opacity p-0.5 rounded hover:bg-gray-100"
                  >
                    <SquarePen size={11} className="text-gray-400 hover:text-blue-500" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CV buttons */}
        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            onClick={handleViewCV}
            disabled={!!cvLoading || !onViewCV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5
              px-3 sm:px-4 py-2 text-[16px] font-medium text-blue-600 bg-blue-50 rounded-lg
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
              px-3 sm:px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg
              hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {cvLoading === "download"
              ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Download size={15} />}
            <span className="hidden sm:inline">Tải xuống bản PDF</span>
            <span className="sm:hidden">Tải xuống</span>
          </button>
        </div>

      </div>
    </div>
  );
}