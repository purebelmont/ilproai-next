"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const DOC_TYPES: Record<string, string> = { quote: "견적서", order: "발주서", invoice: "거래명세서" };
const STATUS_LABELS: Record<string, string> = { draft: "초안", sent: "발송", confirmed: "확인", cancelled: "취소" };
const STATUS_COLORS: Record<string, string> = { draft: "var(--gray-500)", sent: "var(--primary)", confirmed: "var(--success)", cancelled: "var(--danger)" };

const fmt = (n: number) => "₩" + n.toLocaleString();

export default function QuotesPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null); // null=list, object=editor

  const load = useCallback(async () => {
    const { data } = await supabase.from("quotes").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setQuotes(data || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ── Quote List ──
  if (!editing) return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">견적서 / 발주서</h4>
        <button onClick={() => setEditing({ doc_type: "quote", title: "", client_name: "", contact_name: "", notes: "", items: [{ item_name: "", spec: "", qty: 1, unit: "EA", unit_price: 0 }] })}
          className="text-[var(--primary)] text-sm font-medium">+ 새 문서</button>
      </div>
      {quotes.length === 0 ? (
        <div className="text-center py-16 text-[var(--gray-400)]"><div className="text-4xl mb-3">💼</div>견적서를 작성해보세요</div>
      ) : quotes.map((q) => (
        <div key={q.id} onClick={() => loadQuoteDetail(q.id)}
          className="p-4 rounded-xl border mb-2 cursor-pointer active:bg-[var(--gray-50)]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{DOC_TYPES[q.doc_type] || "견적서"} {q.quote_number}</div>
            <span className="text-xs font-semibold" style={{ color: STATUS_COLORS[q.status] || "gray" }}>{STATUS_LABELS[q.status] || q.status}</span>
          </div>
          <div className="text-sm mt-1">{q.title || "-"}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[var(--gray-500)]">{q.client_name || "-"}</span>
            <span className="text-sm font-bold text-[var(--primary)]">{fmt(Number(q.grand_total))}</span>
          </div>
          <div className="text-[10px] text-[var(--gray-400)] mt-1">{q.created_at?.split("T")[0]}</div>
        </div>
      ))}
    </div>
  );

  async function loadQuoteDetail(id: number) {
    const { data: q } = await supabase.from("quotes").select("*").eq("id", id).single();
    const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", id).order("sort_order");
    setEditing({ ...q, items: items || [] });
  }

  // ── Quote Editor ──
  return <QuoteEditor data={editing} userId={userId} onClose={() => { setEditing(null); load(); }} />;
}

function QuoteEditor({ data, userId, onClose }: { data: any; userId: string; onClose: () => void }) {
  const [docType, setDocType] = useState(data.doc_type || "quote");
  const [title, setTitle] = useState(data.title || "");
  const [clientName, setClientName] = useState(data.client_name || "");
  const [contactName, setContactName] = useState(data.contact_name || "");
  const [notes, setNotes] = useState(data.notes || "");
  const [status, setStatus] = useState(data.status || "draft");
  const [items, setItems] = useState<any[]>(data.items?.length > 0 ? data.items : [{ item_name: "", spec: "", qty: 1, unit: "EA", unit_price: 0 }]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  function addItem() { setItems([...items, { item_name: "", spec: "", qty: 1, unit: "EA", unit_price: 0 }]); }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, key: string, val: any) {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    setItems(next);
  }

  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unit_price) || 0), 0);
  const vat = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + vat;

  async function save() {
    if (items.filter(i => i.item_name).length === 0) return alert("품목을 입력해주세요.");
    setSaving(true);

    const quoteData: any = { doc_type: docType, title, client_name: clientName, contact_name: contactName, notes, status, subtotal, vat, grand_total: grandTotal, updated_at: new Date().toISOString() };

    let quoteId = data.id;
    if (quoteId) {
      await supabase.from("quotes").update(quoteData).eq("id", quoteId);
      await supabase.from("quote_items").delete().eq("quote_id", quoteId);
    } else {
      const num = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
      const { data: newQ } = await supabase.from("quotes").insert({ ...quoteData, user_id: userId, quote_number: num }).select().single();
      quoteId = newQ?.id;
    }

    if (quoteId) {
      const itemRows = items.filter(i => i.item_name).map((it, idx) => ({
        quote_id: quoteId, item_name: it.item_name, spec: it.spec || "", qty: Number(it.qty) || 0, unit: it.unit || "EA",
        unit_price: Number(it.unit_price) || 0, supply_amount: (Number(it.qty) || 0) * (Number(it.unit_price) || 0),
        vat: Math.round((Number(it.qty) || 0) * (Number(it.unit_price) || 0) * 0.1),
        total: Math.round((Number(it.qty) || 0) * (Number(it.unit_price) || 0) * 1.1), sort_order: idx,
      }));
      if (itemRows.length > 0) await supabase.from("quote_items").insert(itemRows);
    }

    setSaving(false);
    onClose();
  }

  async function del() {
    if (!data.id || !confirm("삭제하시겠습니까?")) return;
    await supabase.from("quote_items").delete().eq("quote_id", data.id);
    await supabase.from("quotes").delete().eq("id", data.id);
    onClose();
  }

  if (preview) return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setPreview(false)} className="text-[var(--primary)] text-sm">← 돌아가기</button>
        <button onClick={() => { navigator.clipboard.writeText(document.getElementById("previewContent")?.innerText || ""); alert("복사됨"); }} className="text-[var(--primary)] text-sm">복사</button>
      </div>
      <div id="previewContent" className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--gray-200)] max-w-xl mx-auto">
        <h2 className="text-center text-xl font-bold mb-6 tracking-[8px]">{DOC_TYPES[docType]}</h2>
        <div className="flex justify-between text-sm mb-4">
          <div><strong>수신:</strong> {clientName} {contactName && `${contactName}님`}</div>
          <div><strong>일자:</strong> {new Date().toISOString().split("T")[0]}</div>
        </div>
        {title && <div className="text-sm mb-4"><strong>건명:</strong> {title}</div>}
        <table className="w-full text-xs border-collapse mb-4">
          <thead><tr className="bg-[var(--gray-100)]">
            <th className="border border-[var(--gray-200)] p-2 text-left">품명</th>
            <th className="border border-[var(--gray-200)] p-2">규격</th>
            <th className="border border-[var(--gray-200)] p-2 text-right">수량</th>
            <th className="border border-[var(--gray-200)] p-2">단위</th>
            <th className="border border-[var(--gray-200)] p-2 text-right">단가</th>
            <th className="border border-[var(--gray-200)] p-2 text-right">공급가액</th>
          </tr></thead>
          <tbody>{items.filter(i => i.item_name).map((it, i) => {
            const sa = (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
            return <tr key={i}>
              <td className="border border-[var(--gray-200)] p-2">{it.item_name}</td>
              <td className="border border-[var(--gray-200)] p-2">{it.spec}</td>
              <td className="border border-[var(--gray-200)] p-2 text-right">{Number(it.qty).toLocaleString()}</td>
              <td className="border border-[var(--gray-200)] p-2 text-center">{it.unit}</td>
              <td className="border border-[var(--gray-200)] p-2 text-right">{fmt(Number(it.unit_price))}</td>
              <td className="border border-[var(--gray-200)] p-2 text-right">{fmt(sa)}</td>
            </tr>;
          })}</tbody>
        </table>
        <div className="text-right text-sm space-y-1">
          <div>공급가액: <strong>{fmt(subtotal)}</strong></div>
          <div>부가세: <strong>{fmt(vat)}</strong></div>
          <div className="text-lg mt-2">합계: <strong className="text-[var(--primary)]">{fmt(grandTotal)}</strong></div>
        </div>
        {notes && <div className="mt-4 pt-3 border-t border-[var(--gray-200)] text-xs text-[var(--gray-500)]"><strong>비고:</strong> {notes}</div>}
      </div>
    </div>
  );

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="text-[var(--primary)] text-sm">← 목록</button>
        <div className="flex gap-2">
          <button onClick={() => setPreview(true)} className="text-[var(--primary)] text-sm">미리보기</button>
          <button onClick={save} disabled={saving} className="text-[var(--primary)] text-sm font-bold">{saving ? "..." : "저장"}</button>
        </div>
      </div>

      {/* Doc type */}
      <div className="flex gap-1.5 mb-5">
        {(["quote", "order", "invoice"] as const).map((t) => (
          <button key={t} onClick={() => setDocType(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${docType === t ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--bg-card)] border-[var(--gray-200)] text-[var(--gray-700)]"}`}>
            {DOC_TYPES[t]}
          </button>
        ))}
      </div>

      {/* Status */}
      {data.id && (
        <div className="flex gap-1.5 mb-5">
          {(["draft", "sent", "confirmed", "cancelled"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${status === s ? "bg-[var(--gray-900)] text-white border-[var(--gray-900)]" : "bg-[var(--bg-card)] border-[var(--gray-200)] text-[var(--gray-500)]"}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Client */}
      <div className="ios-fields mb-4">
        <div className="ios-field"><label>거래처</label><input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="(주)한국제조" /></div>
        <div className="ios-field"><label>담당자</label><input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="김과장" /></div>
        <div className="ios-field"><label>제목</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="STS304 파이프 외" /></div>
        <div className="ios-field"><label>비고</label><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="납기 2주, 운송비 별도" /></div>
      </div>

      {/* Items */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">품목</span>
        <button onClick={addItem} className="text-[var(--primary)] text-xs font-medium">+ 품목 추가</button>
      </div>
      {items.map((it, i) => (
        <div key={i} className="bg-[var(--bg-card)] border border-[var(--gray-200)] rounded-xl p-3 mb-2 relative">
          {items.length > 1 && <button onClick={() => removeItem(i)} className="absolute top-2 right-2 text-[var(--gray-400)] text-xs">✕</button>}
          <div className="grid grid-cols-2 gap-2">
            <div><div className="text-[10px] text-[var(--gray-400)]">품명</div><input value={it.item_name} onChange={(e) => updateItem(i, "item_name", e.target.value)} placeholder="STS304 파이프" className="w-full text-sm outline-none border-none" /></div>
            <div><div className="text-[10px] text-[var(--gray-400)]">규격</div><input value={it.spec} onChange={(e) => updateItem(i, "spec", e.target.value)} placeholder="Ø50x3t" className="w-full text-sm outline-none border-none" /></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div><div className="text-[10px] text-[var(--gray-400)]">수량</div><input type="number" value={it.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} className="w-full text-sm text-right outline-none border-none" /></div>
            <div><div className="text-[10px] text-[var(--gray-400)]">단위</div><input value={it.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} className="w-full text-sm outline-none border-none" /></div>
            <div><div className="text-[10px] text-[var(--gray-400)]">단가</div><input type="number" value={it.unit_price} onChange={(e) => updateItem(i, "unit_price", e.target.value)} className="w-full text-sm text-right outline-none border-none" /></div>
          </div>
          <div className="text-right text-xs font-semibold text-[var(--primary)] mt-2">공급가 {fmt((Number(it.qty) || 0) * (Number(it.unit_price) || 0))}</div>
        </div>
      ))}

      {/* Totals */}
      <div className="bg-[var(--gray-50)] rounded-xl p-4 mt-4 mb-5">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-[var(--gray-500)]">공급가액</div><div className="text-right font-semibold">{fmt(subtotal)}</div>
          <div className="text-[var(--gray-500)]">부가세 (10%)</div><div className="text-right font-semibold">{fmt(vat)}</div>
          <div className="font-bold text-lg border-t border-[var(--gray-300)] pt-2 mt-1">합계</div>
          <div className="text-right font-extrabold text-lg text-[var(--primary)] border-t border-[var(--gray-300)] pt-2 mt-1">{fmt(grandTotal)}</div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm">{saving ? "저장 중..." : "저장"}</button>
      {data.id && <div className="ios-danger mt-2" onClick={del}>문서 삭제</div>}
    </div>
  );
}
