"use client"
import { FcGoogle } from "react-icons/fc"; 
import { FaFacebook } from "react-icons/fa";
interface SocialAuthButtonProps {
  provider: "google" | "facebook"
  onClick: () => void
  loading?: boolean
}

export function SocialAuthButton({ provider, onClick, loading }: SocialAuthButtonProps) {
  const isGoogle = provider === "google"
  const bgColor = isGoogle ? "bg-white hover:bg-gray-50 border border-gray-300" : "bg-blue-600 hover:bg-blue-700"
  const textColor = isGoogle ? "text-gray-900" : "text-white"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full ${bgColor} ${textColor} font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50`}
    >
      {isGoogle ? (
       <FcGoogle className="h-5 w-5"></FcGoogle>
      ) : (
        <FaFacebook></FaFacebook>
      )}
      <span>{loading ? "Đang kết nối..." : isGoogle ? "Google" : "Facebook"}</span>
    </button>
  )
}
