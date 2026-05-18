"use client";

import { Link2, X, Plus }       from "lucide-react";
import { useState }             from "react";
import SectionWrapper           from "./SectionWrapper";
import { CandidateProfile,
         UpdateProfilePayload,
         SocialPlatform }       from "@/domain/models/Candidate";
import { SectionKey }           from "@/presentation/hooks/useCandidateProfile";

const PLATFORMS: { label: string; value: SocialPlatform; color: string; dot: string }[] = [
  { label: "LinkedIn",   value: "LINKEDIN",  color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500"   },
  { label: "GitHub",     value: "GITHUB",    color: "bg-gray-100 text-gray-700",   dot: "bg-gray-700"   },
  { label: "Dribble",    value: "DRIBBLE",   color: "bg-pink-100 text-pink-700",   dot: "bg-pink-500"   },
  { label: "Instagram",  value: "INSTAGRAM", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  { label: "Behance",    value: "BEHANCE",   color: "bg-blue-100 text-blue-800",   dot: "bg-blue-700"   },
  { label: "Portfolio",  value: "PORTFOLIO", color: "bg-green-100 text-green-700", dot: "bg-green-500"  },
];

const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.value, p]));

interface DraftLink { platform: string; url: string; }

interface Props {
  profile: CandidateProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (section: SectionKey, payload: UpdateProfilePayload) => Promise<void>;
}

export default function LinksSection({ profile, saving, error, onSave }: Props) {
  const [editing,  setEditing] = useState(false);
  const [draft,    setDraft]   = useState<DraftLink[]>(() =>
    profile.socialLinks.map((l) => ({ platform: l.platform, url: l.url }))
  );
  const [platform, setPlatform] = useState<string>("LINKEDIN");
  const [url,      setUrl]      = useState("");

  const addLink = () => {
    const t = url.trim();
    if (t && !draft.find((l) => l.platform === platform))
      setDraft((p) => [...p, { platform, url: t }]);
    setUrl("");
  };
  const removeLink = (platform: string) => setDraft((p) => p.filter((l) => l.platform !== platform));

  const handleSave = async () => {
    await onSave("links", { socialLinks: draft.map((l) => ({ platform: l.platform, url: l.url })) });
    setEditing(false);
  };
  const handleCancel = () => {
    setDraft(profile.socialLinks.map((l) => ({ platform: l.platform, url: l.url })));
    setEditing(false);
  };

  return (
    <SectionWrapper title="Liên kết" icon={<Link2 size={16} />}
      onEdit={() => setEditing(true)} editing={editing}>
      {error && <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {editing ? (
        <>
          <div className="flex gap-2 mb-4">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2 text-[16px] border border-gray-200 rounded-lg focus:outline-none
                focus:ring-2 focus:ring-blue-500 bg-white shrink-0">
              {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
              placeholder="https://..."
              className="flex-1 px-3 py-2 text-[16px] border border-gray-200 rounded-lg focus:outline-none
                focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
            <button onClick={addLink}
              className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50">
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {draft.map((link) => {
              const meta = PLATFORM_MAP[link.platform];
              return (
                <span key={link.platform}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[16px] rounded-full ${meta?.color ?? "bg-gray-100 text-gray-700"}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${meta?.dot ?? "bg-gray-400"}`} />
                  {meta?.label ?? link.platform}
                  <button onClick={() => removeLink(link.platform)} className="hover:opacity-70 ml-0.5">
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Hủy</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}Lưu</button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile.socialLinks.length > 0 ? profile.socialLinks.map((link) => {
            const meta = PLATFORM_MAP[link.platform];
            return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[16px] rounded-full border
                  hover:opacity-80 transition-opacity ${meta?.color ?? "bg-gray-100 text-gray-700"}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${meta?.dot ?? "bg-gray-400"}`} />
                {meta?.label ?? link.platform}
              </a>
            );
          }) : <p className="text-[16px] text-gray-400 italic">Chưa có liên kết</p>}
        </div>
      )}
    </SectionWrapper>
  );
}