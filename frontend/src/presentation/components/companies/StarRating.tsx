// src/presentation/components/companies/StarRating.tsx
import { Star } from "lucide-react";

export function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={13} className="text-yellow-400 fill-yellow-400" />
      <span className="text-xs font-semibold text-yellow-600">{value.toFixed(1)}</span>
    </div>
  );
}