"use client"

import { AlertCircle, X } from "lucide-react"

interface ErrorAlertProps {
  message: string
  type?: "error" | "warning" | "info"
  onClose?: () => void
  className?: string
}

export function ErrorAlert({ 
  message, 
  type = "error", 
  onClose,
  className = "" 
}: ErrorAlertProps) {
  const colors = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-500"
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-500"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-500"
    }
  }

  const colorScheme = colors[type]

  return (
    <div 
      className={`${colorScheme.bg} ${colorScheme.border} border rounded-lg p-4 mb-4 flex items-start gap-3 ${className}`}
      role="alert"
    >
      <AlertCircle className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`text-[16px] ${colorScheme.text}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${colorScheme.icon} hover:opacity-70 transition-opacity`}
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

interface InactiveAccountAlertProps {
  message: string
  onClose?: () => void
}

export function InactiveAccountAlert({ message, onClose }: InactiveAccountAlertProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-[16px] font-semibold text-red-800 mb-1">
            Tài khoản bị vô hiệu hóa
          </h3>
          <p className="text-[16px] text-red-700">{message}</p>
          <p className="text-[16px] text-red-600 mt-2">
            Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 transition-colors ml-2"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}