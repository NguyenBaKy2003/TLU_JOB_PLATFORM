import { AxiosError } from "axios";

/**
 * Lấy message lỗi từ Axios error hoặc Error thông thường.
 *
 * Thứ tự ưu tiên:
 * 1. response.data.message  ← message từ backend ApiResponse (JSON)
 * 2. response.data (Blob)   ← parse JSON từ Blob (khi request dùng responseType: "blob")
 * 3. error.message          ← JS Error message
 * 4. fallback                ← chuỗi mặc định
 */
export async function extractErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): Promise<string> {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // Trường hợp thường: data đã là JSON object
    if (data && typeof data === "object" && !(data instanceof Blob)) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }

    // Trường hợp request dùng responseType: "blob" (download CV...)
    // → response lỗi cũng bị trả về dạng Blob, cần đọc text rồi parse JSON
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (typeof parsed?.message === "string" && parsed.message.trim()) {
          return parsed.message;
        }
      } catch {
        // Không parse được — bỏ qua, fallback xuống dưới
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}