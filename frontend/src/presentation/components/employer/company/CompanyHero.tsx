// src/presentation/components/company-profile/CompanyHero.tsx
"use client";
import { useState, useRef }            from "react";
import { SquarePen, Camera, Globe,
         CheckCircle2, Clock, XCircle } from "lucide-react";
import type { CompanyProfile,
              VerificationStatus }      from "@/domain/models/Company";

const VERIFY_BADGE: Record<VerificationStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  VERIFIED:   { label: "Đã xác thực",    icon: <CheckCircle2 size={12} />, cls: "text-green-700 bg-green-50 border-green-200" },
  UNVERIFIED: { label: "Chờ xác thực",   icon: <Clock size={12} />,        cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  REJECTED:   { label: "Bị từ chối",     icon: <XCircle size={12} />,      cls: "text-red-700 bg-red-50 border-red-200" },
  SUSPENDED:  { label: "Đã bị khoá",     icon: <XCircle size={12} />,      cls: "text-gray-600 bg-gray-100 border-gray-200" },
};

interface Props {
  profile:        CompanyProfile;
  onLogoChange?:  (file: File) => Promise<void>;
  onCoverChange?: (file: File) => Promise<void>;
}

export function CompanyHero({ profile, onLogoChange, onCoverChange }: Props) {
  const logoRef              = useRef<HTMLInputElement>(null);
  const coverRef             = useRef<HTMLInputElement>(null);
  const [logoUploading,  setLogoUploading]  = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [logoPreview,   setLogoPreview]    = useState<string | undefined>(profile.logoUrl ?? undefined);
  const [coverPreview,  setCoverPreview]   = useState<string | undefined>(profile.coverImageUrl ?? undefined);

  const handleFile = async (
    file: File,
    setPreview: (v: string) => void,
    setUploading: (v: boolean) => void,
    fallback: string | undefined,
    onUpload?: (f: File) => Promise<void>,
  ) => {
    if (!onUpload) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploading(true);
    try { await onUpload(file); }
    catch { if (fallback) setPreview(fallback); }
    finally { setUploading(false); URL.revokeObjectURL(url); }
  };

  const badge = VERIFY_BADGE[profile.verificationStatus];
  const initials = (profile.name ?? "").slice(0, 2).toUpperCase() || "CO";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cover */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700">
        {coverPreview && (
          <img src={coverPreview} alt="cover"
            className={`w-full h-full object-cover ${coverUploading ? "opacity-60" : ""}`} />
        )}
        {onCoverChange && (
          <button onClick={() => coverRef.current?.click()}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/40
              text-white text-xs font-medium rounded-xl hover:bg-black/60 transition-colors backdrop-blur-sm">
            <Camera size={13} /> Đổi ảnh bìa
          </button>
        )}
        <input ref={coverRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, setCoverPreview, setCoverUploading, profile.coverImageUrl ?? undefined, onCoverChange); e.target.value = ""; }} />
      </div>

      {/* Profile card */}
      <div className="px-6 pb-6 -mt-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">

          {/* Logo */}
          <div className="relative shrink-0 w-20 h-20 group cursor-pointer"
            onClick={() => !logoUploading && logoRef.current?.click()}>
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden
              flex items-center justify-center">
              {logoPreview
                ? <img src={logoPreview} alt={profile.name}
                    className={`w-full h-full object-cover ${logoUploading ? "opacity-60" : ""}`} />
                : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700
                    flex items-center justify-center text-white font-bold text-xl">
                    {initials}
                  </div>
              }
            </div>
            {onLogoChange && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200
                rounded-full flex items-center justify-center shadow-sm
                group-hover:bg-blue-50 transition-colors">
                <SquarePen size={11} className="text-blue-600" />
              </div>
            )}
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, setLogoPreview, setLogoUploading, profile.logoUrl ?? undefined, onLogoChange); e.target.value = ""; }} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0 sm:mb-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">{profile.name || "Tên công ty"}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold
                rounded-full border ${badge.cls}`}>
                {badge.icon} {badge.label}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
              {profile.industry && <span>{profile.industry}</span>}
              {profile.city    && <span>· {profile.city}{profile.country ? `, ${profile.country}` : ""}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline">
                  <Globe size={11} /> {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Rejection reason */}
        {profile.verificationStatus === "REJECTED" && profile.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 leading-relaxed">
            <strong>Lý do từ chối:</strong> {profile.rejectionReason}
          </div>
        )}
      </div>
    </div>
  );
}