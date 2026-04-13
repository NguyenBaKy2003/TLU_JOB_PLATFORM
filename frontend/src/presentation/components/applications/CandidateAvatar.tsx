// src/presentation/components/applications/CandidateAvatar.tsx

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-orange-500",
  "from-pink-400 to-pink-600",
  "from-teal-400 to-teal-600",
];

export function CandidateAvatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const color = AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS?.length];
  const sizeClass = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-14 h-14" : "w-10 h-10";

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center
            text-white font-bold text-sm`}
        >
          {name?.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}