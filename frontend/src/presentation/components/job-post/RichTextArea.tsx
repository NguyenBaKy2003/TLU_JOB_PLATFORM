"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit                   from "@tiptap/starter-kit";
import Underline                    from "@tiptap/extension-underline";
import Placeholder                  from "@tiptap/extension-placeholder";
import CharacterCount               from "@tiptap/extension-character-count";
import TextAlign                    from "@tiptap/extension-text-align";
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading2, Heading3, Quote, Minus, AlertCircle,
  Undo, Redo, RemoveFormatting,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RichTextAreaProps {
  label?:       string;
  required?:    boolean;
  placeholder?: string;
  value:        string;
  onChange:     (html: string) => void;
  minLength?:   number;
  maxLength?:   number;
  rows?:        number;
  error?:       string;
  hint?:        string;
}

// ── Toolbar button ────────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, active, title, children, disabled,
}: {
  onClick:   () => void;
  active?:   boolean;
  title?:    string;
  children:  React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`
        flex items-center justify-center w-7 h-7 rounded-lg text-gray-500
        transition-all hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30
        ${active ? "bg-blue-500 text-white hover:bg-blue-800 hover:text-white" : ""}
      `}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RichTextArea({
  label, required, placeholder, value, onChange,
  minLength, maxLength, rows = 5, error, hint,
}: RichTextAreaProps) {

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading:      { levels: [2, 3] },
        bulletList:   { keepMarks: true, keepAttributes: false },
        orderedList:  { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: placeholder ?? "Nhập nội dung...",
      }),
      // ✅ Fix: luôn dùng .configure() tránh CharacterCount class conflict
      CharacterCount.configure(maxLength ? { limit: maxLength } : {}),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        // ✅ Fix: không set class ở đây — để globals.css quản lý .tiptap styles
        style: `min-height: ${rows * 1.625}rem`,
      },
    },
  });

  if (!editor) return null;

  const charCount  = editor.storage.characterCount.characters();
  const isOverMax  = maxLength ? charCount > maxLength  : false;
  const isUnderMin = minLength ? charCount > 0 && charCount < minLength : false;
  const isFocused  = editor.isFocused;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      {label && (
        <label className="text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Editor shell */}
      <div
        className={`
          rounded-xl border bg-white transition-all overflow-hidden
          ${isFocused
            ? "border-blue-400 ring-2 ring-blue-500/20"
            : error
              ? "border-red-300 ring-2 ring-red-500/10"
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      >
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/80">

          <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
            <Undo size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
            <Redo size={14}/>
          </ToolbarBtn>

          <Sep/>

          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")} title="In đậm (Ctrl+B)">
            <Bold size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")} title="In nghiêng (Ctrl+I)">
            <Italic size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")} title="Gạch chân (Ctrl+U)">
            <UnderlineIcon size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")} title="Gạch ngang">
            <Strikethrough size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Xóa định dạng">
            <RemoveFormatting size={14}/>
          </ToolbarBtn>

          <Sep/>

          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })} title="Tiêu đề lớn">
            <Heading2 size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })} title="Tiêu đề nhỏ">
            <Heading3 size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")} title="Trích dẫn">
            <Quote size={14}/>
          </ToolbarBtn>

          <Sep/>

          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })} title="Căn trái">
            <AlignLeft size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })} title="Căn giữa">
            <AlignCenter size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })} title="Căn phải">
            <AlignRight size={14}/>
          </ToolbarBtn>

          <Sep/>

          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")} title="Danh sách dấu chấm">
            <List size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")} title="Danh sách đánh số">
            <ListOrdered size={14}/>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Đường kẻ ngang">
            <Minus size={14}/>
          </ToolbarBtn>

        </div>

        {/* ── Editor content ── */}
        <EditorContent editor={editor} />

        {/* ── Footer: char count ── */}
        {(minLength || maxLength) && (
          <div className={`
            flex justify-end px-3 py-1 text-[11px] border-t border-gray-100
            ${isOverMax ? "text-red-500" : isUnderMin ? "text-amber-500" : "text-gray-400"}
          `}>
            {charCount}
            {maxLength ? `/${maxLength}` : ""}
            {isUnderMin && ` (tối thiểu ${minLength})`}
            {" ký tự"}
          </div>
        )}
      </div>

      {/* Error / hint */}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11}/>{error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}