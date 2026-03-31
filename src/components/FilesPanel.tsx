"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const TYPE_COLORS: Record<string, string> = { pdf: "#E53935", csv: "#43A047", xlsx: "#43A047", xls: "#43A047", doc: "#1E88E5", docx: "#1E88E5", txt: "#757575", jpg: "#FB8C00", jpeg: "#FB8C00", png: "#FB8C00", gif: "#FB8C00", hwp: "#1565C0" };

export default function FilesPanel({ userId }: { userId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("files").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setFiles(data || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function upload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const storagePath = `${userId}/${Date.now()}_${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("files").upload(storagePath, file);
      if (uploadError) { console.error(uploadError); continue; }

      // Save metadata to DB
      await supabase.from("files").insert({
        user_id: userId,
        filename: storagePath,
        original_name: file.name,
        file_size: file.size,
        file_type: ext,
        storage_path: storagePath,
      });
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    load();
  }

  async function deleteFile(id: number, storagePath: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.storage.from("files").remove([storagePath]);
    await supabase.from("files").delete().eq("id", id);
    load();
  }

  async function downloadFile(storagePath: string, originalName: string) {
    const { data } = await supabase.storage.from("files").download(storagePath);
    if (!data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fmtSize = (bytes: number) => bytes > 1048576 ? (bytes / 1048576).toFixed(1) + "MB" : Math.round(bytes / 1024) + "KB";

  return (
    <div className="p-5">
      <h4 className="text-lg font-bold mb-3">문서함</h4>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${dragOver ? "border-[var(--primary)] bg-[var(--primary-light)]" : "border-[var(--gray-300)]"}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
      >
        {uploading ? (
          <div><div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-2" /><p className="text-sm text-[var(--gray-500)]">업로드 중...</p></div>
        ) : (
          <div>
            <div className="text-3xl mb-2 opacity-40">📎</div>
            <p className="text-sm text-[var(--gray-500)]">파일을 드래그하거나 탭해서 업로드</p>
            <p className="text-xs text-[var(--gray-400)] mt-1">최대 20MB</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />

      {/* File list */}
      {files.length === 0 ? (
        <div className="text-center py-12 text-[var(--gray-400)]"><div className="text-4xl mb-3">📎</div>파일이 없습니다</div>
      ) : (
        files.map((f) => {
          const ext = f.file_type || "file";
          const color = TYPE_COLORS[ext] || "#757575";
          return (
            <div key={f.id} className="flex items-center gap-3 p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--gray-200)] mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: color }}>
                {ext.toUpperCase().substring(0, 4)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{f.original_name}</div>
                <div className="text-[11px] text-[var(--gray-500)]">{fmtSize(f.file_size)} · {f.created_at?.split("T")[0]}</div>
              </div>
              <button onClick={() => downloadFile(f.storage_path, f.original_name)} className="text-xs text-[var(--primary)] font-medium shrink-0">다운로드</button>
              <button onClick={() => deleteFile(f.id, f.storage_path)} className="text-[var(--gray-400)] text-xs shrink-0">✕</button>
            </div>
          );
        })
      )}
    </div>
  );
}
