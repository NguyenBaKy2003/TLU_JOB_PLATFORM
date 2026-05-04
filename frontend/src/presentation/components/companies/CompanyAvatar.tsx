// src/presentation/components/companies/CompanyAvatar.tsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface Props {
  name: string;
  logoUrl?: string;
  size?: number;
  className?: string;
  showFallbackIcon?: boolean;
}

const COLORS = [
  { gradient: "from-blue-500 to-blue-700", bg: "bg-blue-500" },
  { gradient: "from-red-500 to-red-700", bg: "bg-red-500" },
  { gradient: "from-green-500 to-green-700", bg: "bg-green-500" },
  { gradient: "from-purple-500 to-purple-700", bg: "bg-purple-500" },
  { gradient: "from-orange-500 to-orange-700", bg: "bg-orange-500" },
  { gradient: "from-teal-500 to-teal-700", bg: "bg-teal-500" },
  { gradient: "from-pink-500 to-pink-700", bg: "bg-pink-500" },
  { gradient: "from-indigo-500 to-indigo-700", bg: "bg-indigo-500" },
];

export function CompanyAvatar({
  name,
  logoUrl,
  size = 48,
  className = "",
  showFallbackIcon = true,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const initials = name
    .split(" ")
    .map(word => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
    
  const colorIndex = name.charCodeAt(0) % COLORS.length;
  const color = COLORS[colorIndex];

  // CASE 1: Có logo và không lỗi
  if (logoUrl && !imgError) {
    return (
      <div 
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        {isLoading && (
          <div 
            className="absolute inset-0 rounded-xl bg-gray-100 animate-pulse"
            style={{ width: size, height: size }}
          />
        )}
        <img
          src={logoUrl}
          alt={name}
          onError={() => setImgError(true)}
          onLoad={() => setIsLoading(false)}
          className={`
            rounded-xl object-cover transition-all duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${className}
          `}
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  // CASE 2: Fallback avatar chữ
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-xl bg-gradient-to-br ${color.gradient}
        flex items-center justify-center shrink-0 text-white font-bold shadow-lg
        ${className}
      `}
      style={{ width: size, height: size }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 rounded-xl overflow-hidden opacity-10">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white rounded-full" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {showFallbackIcon && size >= 40 ? (
          <>
            <Building2 
              className="mb-0.5" 
              size={Math.floor(size * 0.35)} 
              strokeWidth={1.5}
            />
            <span style={{ fontSize: Math.max(10, Math.floor(size * 0.2)) }}>
              {initials}
            </span>
          </>
        ) : (
          <span style={{ fontSize: Math.floor(size * 0.4) }}>
            {initials}
          </span>
        )}
      </div>
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/0 via-white/20 to-white/0"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}