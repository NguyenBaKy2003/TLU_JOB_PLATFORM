// src/presentation/components/companies/CompanyAvatar.tsx
interface Props { name: string; size?: number; className?: string; }

const COLORS = [
  "from-blue-500 to-blue-700",   "from-red-500 to-red-700",
  "from-green-500 to-green-700", "from-purple-500 to-purple-700",
  "from-orange-500 to-orange-700","from-teal-500 to-teal-700",
  "from-pink-500 to-pink-700",   "from-indigo-500 to-indigo-700",
];

export function CompanyAvatar({ name, size = 48, className = "" }: Props) {
  const initials = name.slice(0, 2).toUpperCase();
  const color    = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${color} flex items-center justify-center
        shrink-0 text-white font-bold ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
    >
      {initials}
    </div>
  );
}