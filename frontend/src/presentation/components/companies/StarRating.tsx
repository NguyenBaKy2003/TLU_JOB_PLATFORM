// src/presentation/components/companies/StarRating.tsx
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function StarRating({ value, size = "md", showValue = true }: StarRatingProps) {
  const sizes = {
    sm: { star: 12, text: "text-xs" },
    md: { star: 14, text: "text-[16px]" },
    lg: { star: 16, text: "text-base" }
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className="flex items-center gap-1">
      <Star className="text-amber-400 fill-amber-400" size={currentSize.star} />
      {showValue && (
        <span className={`font-semibold text-gray-700 ${currentSize.text}`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}