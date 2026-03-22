import { AxiosError } from "axios";

/**
 * Lấy message lỗi từ Axios error hoặc Error thông thường.
 *
 * Thứ tự ưu tiên:
 * 1. response.data.message  ← message từ backend ApiResponse
 * 2. error.message          ← JS Error message
 * 3. fallback               ← chuỗi mặc định
 */
export function extractErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): string {
  // Axios error — lấy message từ backend
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  // JS Error thông thường
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}