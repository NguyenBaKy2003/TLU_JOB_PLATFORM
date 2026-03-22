"use client";

import { Copy, Check,  X, SquarePen } from "lucide-react";
import { useState }               from "react";
import { QRCodeSVG }              from "qrcode.react";

interface Props {
  profileUrl:   string;
  onUpdateUrl?: (slug: string) => Promise<void>;
}

const BASE = "joblin.com/u/";

export default function ProfileShareCard({ profileUrl, onUpdateUrl }: Props) {
  const [copied,  setCopied]  = useState(false);
  const [editing, setEditing] = useState(false);
  const [slug,    setSlug]    = useState(() => profileUrl.replace(BASE, ""));
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fullUrl = `https://${profileUrl}`;

  // ── Copy ─────────────────────────────────────────────────────────────────

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ── Save slug ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!onUpdateUrl) return;
    const trimmed = slug.trim().toLowerCase();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await onUpdateUrl(trimmed);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        Đường dẫn hồ sơ của bạn
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Chia sẻ hồ sơ của bạn thông qua đường dẫn duy nhất này.
      </p>

      {/* QR Code — gen từ fullUrl thật */}
      <div className="flex justify-center mb-4">
        <div className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          <QRCodeSVG
            value={fullUrl}
            size={112}
            bgColor="#ffffff"
            fgColor="#111111"
            level="M"           // Error correction: L | M | Q | H
            includeMargin={false}
          />
        </div>
      </div>

      {/* URL / Slug editor */}
      {editing ? (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[11px] text-gray-400 shrink-0 truncate">{BASE}</span>
            <input
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="ten-cua-ban"
              maxLength={30}
              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
            />
            <button
              onClick={() => { setEditing(false); setError(null); }}
              className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
          {error && <p className="text-[11px] text-red-500 mt-1 pl-1">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !slug.trim()}
            className="w-full mt-2 py-1.5 text-xs font-medium text-white bg-blue-600
              rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors
              flex items-center justify-center gap-1.5"
          >
            {saving && (
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Lưu
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3 gap-2">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline truncate flex-1 min-w-0"
          >
            {profileUrl}
          </a>
          {onUpdateUrl && (
            <button
              onClick={() => setEditing(true)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
            >
              <SquarePen size={14} />
            </button>
          )}
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm
          font-medium rounded-lg border transition-all ${
            copied
              ? "border-green-400 text-green-600 bg-green-50"
              : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
      >
        {copied
          ? <><Check size={15} /> Đã sao chép!</>
          : <><Copy size={15} /> Sao chép liên kết</>
        }
      </button>
    </div>
  );
}