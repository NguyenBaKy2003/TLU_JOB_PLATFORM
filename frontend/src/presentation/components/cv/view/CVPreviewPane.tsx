// presentation/components/cv/view/CVPreviewPane.tsx

interface Props { html: string; }

export function CVPreviewPane({ html }: Props) {
  if (!html) {
    return (
      <div style={{
        width: "210mm", minHeight: "297mm", margin: "0 auto",
        background: "#fff", borderRadius: "4px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#9ca3af", fontSize: "14px"
      }}>
        Chưa có nội dung preview
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      style={{
        width: "210mm",
        minHeight: "297mm",
        border: "none",
        borderRadius: "4px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        background: "#fff",
        display: "block",
        margin: "0 auto",
      }}
      title="CV preview"
      sandbox="allow-same-origin" // chặn script trong template chạy
    />
  );
}