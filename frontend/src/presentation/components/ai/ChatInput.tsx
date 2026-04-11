import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder={placeholder ?? "Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"}
        rows={1}
        className="flex-1 resize-none outline-none text-sm text-gray-800
          placeholder:text-gray-400 bg-transparent leading-relaxed
          disabled:opacity-50 max-h-[120px]"
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
          hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors shrink-0"
      >
        <Send className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}