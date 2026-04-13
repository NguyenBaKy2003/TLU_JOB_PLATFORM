import React from "react";

interface Props {
  name: string;
  logoUrl?: string; // 👈 thêm
  size?: number;
  className?: string;
}

const COLORS = [
  "from-blue-500 to-blue-700",
  "from-red-500 to-red-700",
  "from-green-500 to-green-700",
  "from-purple-500 to-purple-700",
  "from-orange-500 to-orange-700",
  "from-teal-500 to-teal-700",
  "from-pink-500 to-pink-700",
  "from-indigo-500 to-indigo-700",
];

export function CompanyAvatar({
  name,
  logoUrl,
  size = 48,
  className = "",
}: Props) {
  const initials = name.slice(0, 2).toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];

  // 👉 fallback state
  const [imgError, setImgError] = React.useState(false);

  // ── CASE 1: có logo → show ảnh ─────────────────────────
  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgError(true)} // fallback nếu ảnh lỗi
        className={`rounded-xl object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // ── CASE 2: fallback avatar chữ ───────────────────────
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${color}
        flex items-center justify-center shrink-0 text-white font-bold ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.32),
      }}
    >
      {initials}
    </div>
  );
}