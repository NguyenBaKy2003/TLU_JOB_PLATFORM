'use client';

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4'
};

const variantClasses = {
  primary: 'border-primary/20 border-t-primary',
  secondary: 'border-secondary/20 border-t-secondary',
  white: 'border-white/20 border-t-white'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  text,
  className = ''
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full animate-spin
        `}
      />
      {text && (
        <p className="text-[16px] text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

// Skeleton loading for content
export interface SkeletonLoaderProps {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text', 
  width, 
  height, 
  className = '' 
}) => {
  const baseClass = 'animate-pulse bg-muted rounded';
  
  const variantClass = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg'
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  else if (variant === 'text') style.height = '1rem';
  
  return (
    <div
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      style={style}
    />
  );
};

// Skeleton for card
export interface CardSkeletonProps {
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ lines = 3 }) => {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <SkeletonLoader variant="rectangle" height={160} className="w-full" />
      <SkeletonLoader variant="text" width="80%" />
      <SkeletonLoader variant="text" width="60%" />
      {lines > 2 && <SkeletonLoader variant="text" width="90%" />}
      <div className="flex gap-2 pt-2">
        <SkeletonLoader variant="text" width={80} />
        <SkeletonLoader variant="text" width={80} />
      </div>
    </div>
  );
};

// Skeleton for list
export interface ListSkeletonProps {
  rows?: number;
  avatar?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  rows = 5, 
  avatar = false 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
          {avatar && <SkeletonLoader variant="circle" width={40} height={40} />}
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="70%" />
            <SkeletonLoader variant="text" width="50%" />
          </div>
          <SkeletonLoader variant="rectangle" width={60} height={28} />
        </div>
      ))}
    </div>
  );
};