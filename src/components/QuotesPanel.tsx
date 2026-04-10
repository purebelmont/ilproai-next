"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import BusinessProfile, { loadBizProfile, type BizProfile } from "@/components/BusinessProfile";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocItem {
  name: string;
  spec: string;
  qty: number;
  unit: string;
  unitPrice: number;
  remark: string;
}

interface QuoteDoc {
  id: string;
  docNumber: string;
  date: string;
  validUntil: string;
  status: "draft" | "confirmed";
  supplier: BizProfile;
  buyerName: string;
  buyerReg: string;
  buyerCeo: string;
  buyerAddr: string;
  items: DocItem[];
  notes: string;
  paymentTerms: string;
}

interface PODoc extends QuoteDoc {
  deliveryDate: string;
  deliveryPlace: string;
}

interface TaxDoc {
  id: string;
  docNumber: string;
  date: string;
  status: "draft" | "confirmed";
  invoiceType: "영수" | "청구";
  supplier: BizProfile;
  buyerName: string;
  buyerReg: string;
  buyerCeo: string;
  buyerAddr: string;
  buyerBizType: string;
  buyerBizItem: string;
  items: DocItem[];
  cash: number;
  check: number;
  note: number;  // 어음
  credit: number; // 외상미수금
}

type DocTab = "quote" | "po" | "tax";

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_QUOTES = "ilpro_quotes";
const LS_POS = "ilpro_purchase_orders";
const LS_TAXES = "ilpro_tax_invoices";

function lsLoad<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function lsSave<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function genDocNum(prefix: string) {
  const d = new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}-${yyyymmdd}-${seq}`;
}

const won = (n: number) => n.toLocaleString("ko-KR");

const KO_UNITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const KO_TENS = ["", "십", "백", "천"];
const KO_GROUPS = ["", "만", "억", "조"];

function toKoreanAmount(num: number): string {
  if (num === 0) return "영원정";
  let result = "";
  let n = Math.abs(Math.round(num));
  let groupIdx = 0;
  while (n > 0) {
    const group = n % 10000;
    if (group > 0) {
      let groupStr = "";
      let g = group;
      for (let i = 0; i < 4; i++) {
        const d = g % 10;
        if (d > 0) {
          groupStr = (d === 1 && i > 0 ? "" : KO_UNITS[d]) + KO_TENS[i] + groupStr;
        }
        g = Math.floor(g / 10);
      }
      result = groupStr + KO_GROUPS[groupIdx] + result;
    }
    n = Math.floor(n / 10000);
    groupIdx++;
  }
  return "일금 " + result + "원정";
}

const EMPTY_ITEM: DocItem = { name: "", spec: "", qty: 1, unit: "EA", unitPrice: 0, remark: "" };

function calcItem(it: DocItem) {
  const supply = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
  const vat = Math.round(supply * 0.1);
  return { supply, vat, total: supply + vat };
}

function calcTotals(items: DocItem[]) {
  const supply = items.reduce((s, it) => s + calcItem(it).supply, 0);
  const vat = Math.round(supply * 0.1);
  return { supply, vat, grand: supply + vat };
}

// ─── Print helpers ────────────────────────────────────────────────────────────
function printEl(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { window.print(); return; }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>문서</title>
<style>
  @page { margin: 15mm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif; font-size: 11px; color: #000; background: #fff; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #333; padding: 4px 6px; }
  .no-border td, .no-border th { border: none; }
</style></head><body>${el.innerHTML}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}

// ─── Shared ItemTable ─────────────────────────────────────────────────────────
function ItemTable({ items, setItems, isTax }: { items: DocItem[]; setItems: (items: DocItem[]) => void; isTax?: boolean }) {
  function add() { setItems([...items, { ...EMPTY_ITEM }]); }
  function remove(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function upd(i: number, key: keyof DocItem, val: string | number) {
    const next = items.map((it, idx) => idx === i ? { ...it, [key]: val } : it);
    setItems(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">품목</span>
        <button onClick={add} className="text-[var(--primary)] text-xs font-medium" style={{ minHeight: 0 }}>+ 품목 추가</button>
      </div>
      {items.map((it, i) => {
        const { supply, vat } = calcItem(it);
        return (
          <div key={i} className="rounded-xl border p-3 mb-2 relative" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            {items.length > 1 && (
              <button onClick={() => remove(i)} className="absolute top-2 right-2 text-[var(--text-faint)] text-xs" style={{ minHeight: 0 }}>✕</button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">품명</div>
                <input value={it.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="품목명" className="w-full text-sm outline-none border-none bg-transparent" style={{ color: "var(--text)" }} />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">규격</div>
                <input value={it.spec} onChange={(e) => upd(i, "spec", e.target.value)} placeholder="규격" className="w-full text-sm outline-none border-none bg-transparent" style={{ color: "var(--text)" }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">수량</div>
                <input type="number" value={it.qty} onChange={(e) => upd(i, "qty", e.target.value)} className="w-full text-sm text-right outline-none border-none bg-transparent" style={{ color: "var(--text)" }} />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">단위</div>
                <input value={it.unit} onChange={(e) => upd(i, "unit", e.target.value)} className="w-full text-sm outline-none border-none bg-transparent" style={{ color: "var(--text)" }} />
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">단가</div>
                <input type="number" value={it.unitPrice} onChange={(e) => upd(i, "unitPrice", e.target.value)} className="w-full text-sm text-right outline-none border-none bg-transparent" style={{ color: "var(--text)" }} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex-1 mr-2">
                <div className="text-[10px] text-[var(--text-muted)]">비고</div>
                <input value={it.remark} onChange={(e) => upd(i, "remark", e.target.value)} placeholder="" className="w-full text-xs outline-none border-none bg-transparent" style={{ color: "var(--text)" }} />
              </div>
              <div className="text-right text-xs font-semibold" style={{ color: "var(--primary)" }}>
                공급가 {won(supply)}
                {isTax && <div className="font-normal" style={{ color: "var(--text-muted)" }}>세액 {won(vat)}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Totals box ────────────────────────────────────────────────────────────────
function TotalsBox({ items }: { items: DocItem[] }) {
  const { supply, vat, grand } = calcTotals(items);
  return (
    <div className="rounded-xl p-4 mb-5" style={{ background: "var(--bg-hover)" }}>
      <div className="grid grid-cols-2 gap-1 text-sm">
        <div style={{ color: "var(--text-muted)" }}>공급가액 합계</div><div className="text-right font-semibold">{won(supply)}원</div>
        <div style={{ color: "var(--text-muted)" }}>세액 (10%)</div><div className="text-right font-semibold">{won(vat)}원</div>
        <div className="font-bold text-base border-t pt-2 mt-1" style={{ borderColor: "var(--border)", color: "var(--text)" }}>합계</div>
        <div className="text-right font-extrabold text-base border-t pt-2 mt-1" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>{won(grand)}원</div>
      </div>
    </div>
  );
}

// ─── BuyerFields ──────────────────────────────────────────────────────────────
function BuyerFields({
  name, regNum, ceo, addr, bizType, bizItem,
  setName, setRegNum, setCeo, setAddr, setBizType, setBizItem,
  showBizFields,
}: {
  name: string; regNum: string; ceo: string; addr: string; bizType?: string; bizItem?: string;
  setName: (v: string) => void; setRegNum: (v: string) => void; setCeo: (v: string) => void;
  setAddr: (v: string) => void; setBizType?: (v: string) => void; setBizItem?: (v: string) => void;
  showBizFields?: boolean;
}) {
  return (
    <div className="ios-fields mb-4">
      <div className="ios-field"><label>거래처</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="(주)한국제조" /></div>
      <div className="ios-field"><label>사업자번호</label><input value={regNum} onChange={(e) => setRegNum(e.target.value)} placeholder="000-00-00000" inputMode="numeric" /></div>
      <div className="ios-field"><label>대표자</label><input value={ceo} onChange={(e) => setCeo(e.target.value)} placeholder="홍길동" /></div>
      <div className="ios-field"><label>주소</label><input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="서울시 강남구..." /></div>
      {showBizFields && setBizType && (
        <div className="ios-field"><label>업태</label><input value={bizType || ""} onChange={(e) => setBizType(e.target.value)} placeholder="도소매" /></div>
      )}
      {showBizFields && setBizItem && (
        <div className="ios-field"><label>종목</label><input value={bizItem || ""} onChange={(e) => setBizItem(e.target.value)} placeholder="철강재" /></div>
      )}
    </div>
  );
}

// ─── Quote / PO Print Template ────────────────────────────────────────────────
function QuotePrintTemplate({ doc, isPO }: { doc: QuoteDoc & Partial<PODoc>; isPO?: boolean }) {
  const { supply, vat, grand } = calcTotals(doc.items);
  const title = isPO ? "발주서" : "견적서";
  const docNumLabel = isPO ? "발주번호" : "견적번호";

  return (
    <div style={{ background: "#fff", color: "#000", padding: "20px", fontFamily: "'Noto Sans KR', sans-serif", fontSize: "12px", lineHeight: 1.5 }}>
      <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: 700, letterSpacing: "12px", marginBottom: "20px" }}>{title}</h2>

      {/* Header info */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "6px 10px", width: "20%", background: "#f5f5f5", fontWeight: 600 }}>{docNumLabel}</td>
            <td style={{ border: "1px solid #000", padding: "6px 10px", width: "30%" }}>{doc.docNumber}</td>
            <td style={{ border: "1px solid #000", padding: "6px 10px", width: "20%", background: "#f5f5f5", fontWeight: 600 }}>견적일자</td>
            <td style={{ border: "1px solid #000", padding: "6px 10px", width: "30%" }}>{doc.date}</td>
          </tr>
          {!isPO && (
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px 10px", background: "#f5f5f5", fontWeight: 600 }}>유효기간</td>
              <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{doc.validUntil}</td>
              <td style={{ border: "1px solid #000", padding: "6px 10px", background: "#f5f5f5", fontWeight: 600 }}>결제조건</td>
              <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{doc.paymentTerms}</td>
            </tr>
          )}
          {isPO && (
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px 10px", background: "#f5f5f5", fontWeight: 600 }}>납기일</td>
              <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{(doc as PODoc).deliveryDate}</td>
              <td style={{ border: "1px solid #000", padding: "6px 10px", background: "#f5f5f5", fontWeight: 600 }}>납품장소</td>
              <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{(doc as PODoc).deliveryPlace}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Supplier / Buyer two-column */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: "6px", background: "#f5f5f5", width: "50%" }}>공급자</th>
            <th style={{ border: "1px solid #000", padding: "6px", background: "#f5f5f5", width: "50%" }}>공급받는자</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["상호", doc.supplier.companyName, doc.buyerName],
            ["사업자번호", doc.supplier.regNumber, doc.buyerReg],
            ["대표자", doc.supplier.ceoName, doc.buyerCeo],
            ["주소", doc.supplier.address, doc.buyerAddr],
            ["업태/종목", `${doc.supplier.bizType} / ${doc.supplier.bizItem}`, ""],
            ["연락처", doc.supplier.phone, ""],
          ].map(([label, sup, buy], i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}><strong>{label}:</strong> {sup}</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>{buy && <><strong>{label}:</strong> {buy}</>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["No.", "품명", "규격", "수량", "단위", "단가", "공급가액", "세액", "비고"].map((h) => (
              <th key={h} style={{ border: "1px solid #000", padding: "5px 4px", textAlign: "center", fontSize: "11px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doc.items.filter((it) => it.name).map((it, i) => {
            const { supply: s, vat: v } = calcItem(it);
            return (
              <tr key={i}>
                <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{i + 1}</td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>{it.name}</td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>{it.spec}</td>
                <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>{won(it.qty)}</td>
                <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{it.unit}</td>
                <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>{won(it.unitPrice)}</td>
                <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>{won(s)}</td>
                <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>{won(v)}</td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>{it.remark}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 5 - doc.items.filter((it) => it.name).length) }).map((_, i) => (
            <tr key={"empty" + i}>
              {Array.from({ length: 9 }).map((__, j) => (
                <td key={j} style={{ border: "1px solid #000", padding: "4px", height: "22px" }}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "6px 10px", background: "#f5f5f5", fontWeight: 600, width: "20%" }}>공급가액 합계</td>
            <td style={{ border: "1px solid #000", padding: "6px 10px", width: "30%", textAlign: "right" }}>{won(supply)}원</td>
            <td style={{ border: "1px solid #000", padding: "6px 10px", background: "#f5f5f5", fontWeight: 600, width: "20%" }}>세액 합계</td>
            <td style={{ border: "1px solid #000", padding: "6px 10px", width: "30%", textAlign: "right" }}>{won(vat)}원</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ border: "1px solid #000", padding: "6px 10px", background: "#f5f5f5", fontWeight: 700, fontSize: "14px" }}>총 합계</td>
            <td colSpan={2} style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", fontWeight: 700, fontSize: "14px" }}>₩{won(grand)}</td>
          </tr>
        </tbody>
      </table>

      {doc.notes && (
        <div style={{ border: "1px solid #000", padding: "8px 12px", marginBottom: "12px" }}>
          <strong>특기사항 / 결제조건:</strong> {doc.notes}
        </div>
      )}

      {/* Stamp area */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "13px", marginBottom: "4px" }}>{doc.supplier.companyName}</div>
          {doc.supplier.stampUrl ? (
            <img src={doc.supplier.stampUrl} alt="직인" style={{ width: 60, height: 60, objectFit: "contain" }} />
          ) : (
            <div style={{ width: 60, height: 60, border: "1px dashed #999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999" }}>직인</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tax Invoice Print Template ───────────────────────────────────────────────
function TaxPrintTemplate({ doc }: { doc: TaxDoc }) {
  const { supply, vat, grand } = calcTotals(doc.items);

  return (
    <div style={{ background: "#fff", color: "#000", padding: "16px", fontFamily: "'Noto Sans KR', sans-serif", fontSize: "11px", lineHeight: 1.4 }}>
      <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: 700, letterSpacing: "8px", marginBottom: "4px" }}>세금계산서</h2>
      <div style={{ textAlign: "center", fontSize: "12px", marginBottom: "12px" }}>
        이 금액을&nbsp;
        <span style={{ border: "1px solid #000", padding: "1px 6px" }}>{doc.invoiceType === "영수" ? "✓" : " "} 영수</span>
        &nbsp;
        <span style={{ border: "1px solid #000", padding: "1px 6px" }}>{doc.invoiceType === "청구" ? "✓" : " "} 청구</span>
        &nbsp;함
      </div>

      {/* Supplier / Buyer */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", tableLayout: "fixed" }}>
        <tbody>
          <tr>
            <td style={{ width: "10%", border: "1px solid #000", background: "#f0f0f0", padding: "4px", textAlign: "center", fontWeight: 700, writingMode: "vertical-rl", fontSize: "13px", letterSpacing: "4px" }}>공급자</td>
            <td style={{ width: "40%", border: "none", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["등록번호", doc.supplier.regNumber],
                    ["상호", doc.supplier.companyName],
                    ["성명(대표)", doc.supplier.ceoName],
                    ["사업장주소", doc.supplier.address],
                    ["업태", doc.supplier.bizType],
                    ["종목", doc.supplier.bizItem],
                    ["연락처", doc.supplier.phone],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", background: "#f8f8f8", width: "34%", fontWeight: 600 }}>{k}</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td style={{ width: "10%", border: "1px solid #000", background: "#f0f0f0", padding: "4px", textAlign: "center", fontWeight: 700, writingMode: "vertical-rl", fontSize: "13px", letterSpacing: "4px" }}>공급받는자</td>
            <td style={{ width: "40%", border: "none", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["등록번호", doc.buyerReg],
                    ["상호", doc.buyerName],
                    ["성명(대표)", doc.buyerCeo],
                    ["사업장주소", doc.buyerAddr],
                    ["업태", doc.buyerBizType],
                    ["종목", doc.buyerBizItem],
                    ["연락처", ""],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", background: "#f8f8f8", width: "34%", fontWeight: 600 }}>{k}</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount header */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "5px 8px", background: "#f8f8f8", fontWeight: 700, width: "20%" }}>합계금액</td>
            <td colSpan={3} style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: 700, fontSize: "13px" }}>{toKoreanAmount(grand)} (₩{won(grand)})</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "5px 8px", background: "#f8f8f8", fontWeight: 600 }}>작성년월일</td>
            <td style={{ border: "1px solid #000", padding: "5px 8px", width: "30%" }}>{doc.date}</td>
            <td style={{ border: "1px solid #000", padding: "5px 8px", background: "#f8f8f8", fontWeight: 600, width: "15%" }}>발행번호</td>
            <td style={{ border: "1px solid #000", padding: "5px 8px" }}>{doc.docNumber}</td>
          </tr>
        </tbody>
      </table>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["월", "일", "품목", "규격", "수량", "단가", "공급가액", "세액", "비고"].map((h) => (
              <th key={h} style={{ border: "1px solid #000", padding: "4px 3px", textAlign: "center", fontSize: "10px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doc.items.filter((it) => it.name).map((it, i) => {
            const d = new Date(doc.date);
            const { supply: s, vat: v } = calcItem(it);
            return (
              <tr key={i}>
                <td style={{ border: "1px solid #000", padding: "4px 3px", textAlign: "center" }}>{String(d.getMonth() + 1).padStart(2, "0")}</td>
                <td style={{ border: "1px solid #000", padding: "4px 3px", textAlign: "center" }}>{String(d.getDate()).padStart(2, "0")}</td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>{it.name}</td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>{it.spec}</td>
                <td style={{ border: "1px solid #000", padding: "4px 3px", textAlign: "right" }}>{won(it.qty)}</td>
                <td style={{ border: "1px solid #000", padding: "4px 3px", textAlign: "right" }}>{won(it.unitPrice)}</td>
                <td style={{ border: "1px solid #000", padding: "4px 3px", textAlign: "right" }}>{won(s)}</td>
                <td style={{ border: "1px solid #000", padding: "4px 3px", textAlign: "right" }}>{won(v)}</td>
                <td style={{ border: "1px solid #000", padding: "4px" }}>{it.remark}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 4 - doc.items.filter((it) => it.name).length) }).map((_, i) => (
            <tr key={"empty" + i}>
              {Array.from({ length: 9 }).map((__, j) => (
                <td key={j} style={{ border: "1px solid #000", padding: "4px", height: "20px" }}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals row */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "5px 8px", background: "#f8f8f8", fontWeight: 600, width: "12%" }}>합계</td>
            <td style={{ border: "1px solid #000", padding: "5px 8px", textAlign: "right", width: "22%" }}>{won(supply)}</td>
            <td style={{ border: "1px solid #000", padding: "5px 8px", textAlign: "right", width: "22%" }}>{won(vat)}</td>
            <td style={{ border: "1px solid #000", padding: "5px 8px", background: "#f8f8f8", fontWeight: 600, width: "12%" }}>총합계</td>
            <td style={{ border: "1px solid #000", padding: "5px 8px", textAlign: "right", fontWeight: 700 }}>{won(grand)}</td>
          </tr>
        </tbody>
      </table>

      {/* Payment breakdown */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["현금", "수표", "어음", "외상미수금"].map((h) => (
              <th key={h} style={{ border: "1px solid #000", padding: "4px", textAlign: "center", width: "25%" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "5px", textAlign: "right" }}>{doc.cash ? won(doc.cash) : ""}</td>
            <td style={{ border: "1px solid #000", padding: "5px", textAlign: "right" }}>{doc.check ? won(doc.check) : ""}</td>
            <td style={{ border: "1px solid #000", padding: "5px", textAlign: "right" }}>{doc.note ? won(doc.note) : ""}</td>
            <td style={{ border: "1px solid #000", padding: "5px", textAlign: "right" }}>{doc.credit ? won(doc.credit) : ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Quote Editor ─────────────────────────────────────────────────────────────
function QuoteEditor({ doc, onClose }: { doc: Partial<QuoteDoc>; onClose: () => void }) {
  const biz = loadBizProfile();
  const [docNumber] = useState(doc.docNumber || genDocNum("EST"));
  const [date, setDate] = useState(doc.date || today());
  const [validUntil, setValidUntil] = useState(doc.validUntil || "");
  const [buyerName, setBuyerName] = useState(doc.buyerName || "");
  const [buyerReg, setBuyerReg] = useState(doc.buyerReg || "");
  const [buyerCeo, setBuyerCeo] = useState(doc.buyerCeo || "");
  const [buyerAddr, setBuyerAddr] = useState(doc.buyerAddr || "");
  const [items, setItems] = useState<DocItem[]>(doc.items?.length ? doc.items : [{ ...EMPTY_ITEM }]);
  const [notes, setNotes] = useState(doc.notes || "");
  const [paymentTerms, setPaymentTerms] = useState(doc.paymentTerms || "");
  const [status, setStatus] = useState<"draft" | "confirmed">(doc.status || "draft");
  const printId = useRef("qprint_" + genId());

  function buildDoc(): QuoteDoc {
    return {
      id: doc.id || genId(),
      docNumber,
      date,
      validUntil,
      status,
      supplier: biz,
      buyerName, buyerReg, buyerCeo, buyerAddr,
      items,
      notes,
      paymentTerms,
    };
  }

  function save() {
    const all = lsLoad<QuoteDoc>(LS_QUOTES);
    const built = buildDoc();
    const idx = all.findIndex((q) => q.id === built.id);
    if (idx >= 0) all[idx] = built; else all.unshift(built);
    lsSave(LS_QUOTES, all);
    onClose();
  }

  function del() {
    if (!doc.id || !confirm("삭제하시겠습니까?")) return;
    lsSave(LS_QUOTES, lsLoad<QuoteDoc>(LS_QUOTES).filter((q) => q.id !== doc.id));
    onClose();
  }

  return (
    <div className="p-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="text-[var(--primary)] text-sm">← 목록</button>
        <div className="flex gap-3">
          <button onClick={() => printEl(printId.current)} className="text-sm font-medium" style={{ color: "var(--text-muted)", minHeight: 0 }}>PDF</button>
          <button
            onClick={() => { buildDoc(); setStatus("confirmed"); }}
            className="text-sm font-medium"
            style={{ color: status === "confirmed" ? "var(--success)" : "var(--text-muted)", minHeight: 0 }}
          >
            {status === "confirmed" ? "✓ 확정됨" : "확정"}
          </button>
          <button onClick={save} className="text-sm font-bold" style={{ color: "var(--primary)", minHeight: 0 }}>저장</button>
        </div>
      </div>

      <div className="rounded-xl border p-3 mb-4 text-xs" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
        <span className="font-semibold">견적번호:</span> {docNumber}
        {biz.companyName && <span className="ml-3"><span className="font-semibold">공급자:</span> {biz.companyName}</span>}
      </div>

      <div className="ios-fields mb-4">
        <div className="ios-field"><label>견적일자</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="ios-field"><label>유효기간</label><input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
        <div className="ios-field"><label>결제조건</label><input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="현금, 30일 후 지급 등" /></div>
      </div>

      <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>공급받는자</div>
      <BuyerFields name={buyerName} regNum={buyerReg} ceo={buyerCeo} addr={buyerAddr}
        setName={setBuyerName} setRegNum={setBuyerReg} setCeo={setBuyerCeo} setAddr={setBuyerAddr} />

      <ItemTable items={items} setItems={setItems} />
      <TotalsBox items={items} />

      <div className="ios-fields mb-5">
        <div className="ios-field"><label>특기사항</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="납기, 운송비 별도 등" /></div>
      </div>

      <button onClick={save} className="w-full p-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>저장</button>
      {doc.id && <div className="ios-danger mt-2" onClick={del}>견적서 삭제</div>}

      {/* Hidden print area */}
      <div id={printId.current} style={{ display: "none" }}>
        <QuotePrintTemplate doc={buildDoc()} isPO={false} />
      </div>
    </div>
  );
}

// ─── PO Editor ────────────────────────────────────────────────────────────────
function POEditor({ doc, onClose }: { doc: Partial<PODoc>; onClose: () => void }) {
  const biz = loadBizProfile();
  const [docNumber] = useState(doc.docNumber || genDocNum("PO"));
  const [date, setDate] = useState(doc.date || today());
  const [validUntil, setValidUntil] = useState(doc.validUntil || "");
  const [deliveryDate, setDeliveryDate] = useState(doc.deliveryDate || "");
  const [deliveryPlace, setDeliveryPlace] = useState(doc.deliveryPlace || "");
  const [buyerName, setBuyerName] = useState(doc.buyerName || "");
  const [buyerReg, setBuyerReg] = useState(doc.buyerReg || "");
  const [buyerCeo, setBuyerCeo] = useState(doc.buyerCeo || "");
  const [buyerAddr, setBuyerAddr] = useState(doc.buyerAddr || "");
  const [items, setItems] = useState<DocItem[]>(doc.items?.length ? doc.items : [{ ...EMPTY_ITEM }]);
  const [notes, setNotes] = useState(doc.notes || "");
  const [paymentTerms, setPaymentTerms] = useState(doc.paymentTerms || "");
  const [status, setStatus] = useState<"draft" | "confirmed">(doc.status || "draft");
  const printId = useRef("poprint_" + genId());

  function buildDoc(): PODoc {
    return {
      id: doc.id || genId(),
      docNumber, date, validUntil, status, supplier: biz,
      buyerName, buyerReg, buyerCeo, buyerAddr,
      items, notes, paymentTerms,
      deliveryDate, deliveryPlace,
    };
  }

  function save() {
    const all = lsLoad<PODoc>(LS_POS);
    const built = buildDoc();
    const idx = all.findIndex((q) => q.id === built.id);
    if (idx >= 0) all[idx] = built; else all.unshift(built);
    lsSave(LS_POS, all);
    onClose();
  }

  function del() {
    if (!doc.id || !confirm("삭제하시겠습니까?")) return;
    lsSave(LS_POS, lsLoad<PODoc>(LS_POS).filter((q) => q.id !== doc.id));
    onClose();
  }

  return (
    <div className="p-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="text-[var(--primary)] text-sm">← 목록</button>
        <div className="flex gap-3">
          <button onClick={() => printEl(printId.current)} className="text-sm font-medium" style={{ color: "var(--text-muted)", minHeight: 0 }}>PDF</button>
          <button onClick={save} className="text-sm font-bold" style={{ color: "var(--primary)", minHeight: 0 }}>저장</button>
        </div>
      </div>

      <div className="rounded-xl border p-3 mb-4 text-xs" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
        <span className="font-semibold">발주번호:</span> {docNumber}
        {biz.companyName && <span className="ml-3"><span className="font-semibold">발주자:</span> {biz.companyName}</span>}
      </div>

      <div className="ios-fields mb-4">
        <div className="ios-field"><label>발주일자</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="ios-field"><label>납기일</label><input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} /></div>
        <div className="ios-field"><label>납품장소</label><input value={deliveryPlace} onChange={(e) => setDeliveryPlace(e.target.value)} placeholder="본사 창고" /></div>
        <div className="ios-field"><label>결제조건</label><input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="30일 어음 등" /></div>
      </div>

      <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>공급업체</div>
      <BuyerFields name={buyerName} regNum={buyerReg} ceo={buyerCeo} addr={buyerAddr}
        setName={setBuyerName} setRegNum={setBuyerReg} setCeo={setBuyerCeo} setAddr={setBuyerAddr} />

      <ItemTable items={items} setItems={setItems} />
      <TotalsBox items={items} />

      <div className="ios-fields mb-5">
        <div className="ios-field"><label>특기사항</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="포장방법, 운송비 조건 등" /></div>
      </div>

      <button onClick={save} className="w-full p-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>저장</button>
      {doc.id && <div className="ios-danger mt-2" onClick={del}>발주서 삭제</div>}

      <div id={printId.current} style={{ display: "none" }}>
        <QuotePrintTemplate doc={buildDoc()} isPO={true} />
      </div>
    </div>
  );
}

// ─── Tax Invoice Editor ───────────────────────────────────────────────────────
function TaxEditor({ doc, onClose }: { doc: Partial<TaxDoc>; onClose: () => void }) {
  const biz = loadBizProfile();
  const [docNumber] = useState(doc.docNumber || genDocNum("TAX"));
  const [date, setDate] = useState(doc.date || today());
  const [invoiceType, setInvoiceType] = useState<"영수" | "청구">(doc.invoiceType || "청구");
  const [buyerName, setBuyerName] = useState(doc.buyerName || "");
  const [buyerReg, setBuyerReg] = useState(doc.buyerReg || "");
  const [buyerCeo, setBuyerCeo] = useState(doc.buyerCeo || "");
  const [buyerAddr, setBuyerAddr] = useState(doc.buyerAddr || "");
  const [buyerBizType, setBuyerBizType] = useState(doc.buyerBizType || "");
  const [buyerBizItem, setBuyerBizItem] = useState(doc.buyerBizItem || "");
  const [items, setItems] = useState<DocItem[]>(doc.items?.length ? doc.items : [{ ...EMPTY_ITEM }]);
  const [cash, setCash] = useState(doc.cash || 0);
  const [check, setCheck] = useState(doc.check || 0);
  const [note, setNote] = useState(doc.note || 0);
  const [credit, setCredit] = useState(doc.credit || 0);
  const [status, setStatus] = useState<"draft" | "confirmed">(doc.status || "draft");
  const printId = useRef("taxprint_" + genId());

  const { supply, vat, grand } = calcTotals(items);

  function buildDoc(): TaxDoc {
    return {
      id: doc.id || genId(),
      docNumber, date, invoiceType, status,
      supplier: biz,
      buyerName, buyerReg, buyerCeo, buyerAddr, buyerBizType, buyerBizItem,
      items, cash, check, note, credit,
    };
  }

  function save() {
    const all = lsLoad<TaxDoc>(LS_TAXES);
    const built = buildDoc();
    const idx = all.findIndex((q) => q.id === built.id);
    if (idx >= 0) all[idx] = built; else all.unshift(built);
    lsSave(LS_TAXES, all);
    onClose();
  }

  function del() {
    if (!doc.id || !confirm("삭제하시겠습니까?")) return;
    lsSave(LS_TAXES, lsLoad<TaxDoc>(LS_TAXES).filter((q) => q.id !== doc.id));
    onClose();
  }

  return (
    <div className="p-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onClose} className="text-[var(--primary)] text-sm">← 목록</button>
        <div className="flex gap-3">
          <button onClick={() => printEl(printId.current)} className="text-sm font-medium" style={{ color: "var(--text-muted)", minHeight: 0 }}>PDF</button>
          <button onClick={save} className="text-sm font-bold" style={{ color: "var(--primary)", minHeight: 0 }}>저장</button>
        </div>
      </div>

      <div className="rounded-xl border p-3 mb-4 text-xs" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
        <span className="font-semibold">발행번호:</span> {docNumber}
        {biz.companyName && <span className="ml-3"><span className="font-semibold">공급자:</span> {biz.companyName}</span>}
      </div>

      <div className="ios-fields mb-4">
        <div className="ios-field"><label>작성일자</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="ios-field">
          <label>구분</label>
          <div className="flex gap-3 flex-1">
            {(["영수", "청구"] as const).map((t) => (
              <label key={t} className="flex items-center gap-1 cursor-pointer" style={{ minHeight: 0 }}>
                <input type="radio" checked={invoiceType === t} onChange={() => setInvoiceType(t)} />
                <span className="text-sm">{t}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>공급받는자</div>
      <BuyerFields
        name={buyerName} regNum={buyerReg} ceo={buyerCeo} addr={buyerAddr}
        bizType={buyerBizType} bizItem={buyerBizItem}
        setName={setBuyerName} setRegNum={setBuyerReg} setCeo={setBuyerCeo} setAddr={setBuyerAddr}
        setBizType={setBuyerBizType} setBizItem={setBuyerBizItem}
        showBizFields
      />

      <ItemTable items={items} setItems={setItems} isTax />

      {/* Tax totals */}
      <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg-hover)" }}>
        <div className="grid grid-cols-2 gap-1 text-sm mb-3">
          <div style={{ color: "var(--text-muted)" }}>공급가액</div><div className="text-right font-semibold">{won(supply)}원</div>
          <div style={{ color: "var(--text-muted)" }}>세액</div><div className="text-right font-semibold">{won(vat)}원</div>
          <div className="font-bold border-t pt-2" style={{ borderColor: "var(--border)" }}>합계금액</div>
          <div className="text-right font-extrabold border-t pt-2" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>{won(grand)}원</div>
        </div>
        <div className="text-xs rounded p-2" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
          {toKoreanAmount(grand)}
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="text-xs font-bold mb-2" style={{ color: "var(--text-muted)" }}>결제 내역</div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {[
          { label: "현금", val: cash, set: setCash },
          { label: "수표", val: check, set: setCheck },
          { label: "어음", val: note, set: setNote },
          { label: "외상미수금", val: credit, set: setCredit },
        ].map(({ label, val, set }) => (
          <div key={label} className="rounded-xl border p-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>{label}</div>
            <input
              type="number"
              value={val || ""}
              onChange={(e) => set(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full text-sm text-right outline-none border-none bg-transparent"
              style={{ color: "var(--text)" }}
            />
          </div>
        ))}
      </div>

      <button onClick={save} className="w-full p-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>저장</button>
      {doc.id && <div className="ios-danger mt-2" onClick={del}>세금계산서 삭제</div>}

      <div id={printId.current} style={{ display: "none" }}>
        <TaxPrintTemplate doc={buildDoc()} />
      </div>
    </div>
  );
}

// ─── Document List ────────────────────────────────────────────────────────────
function DocList<T extends { id: string; docNumber: string; date: string; status: string; buyerName: string; items: DocItem[] }>({
  docs,
  label,
  onAdd,
  onEdit,
}: {
  docs: T[];
  label: string;
  onAdd: () => void;
  onEdit: (doc: T) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold">{label}</h4>
        <button onClick={onAdd} className="text-sm font-medium" style={{ color: "var(--primary)" }}>+ 추가</button>
      </div>
      {docs.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-faint)" }}>
          <div className="text-4xl mb-3">📄</div>
          {label}를 작성해보세요
        </div>
      ) : (
        docs.map((doc) => {
          const { grand } = calcTotals(doc.items);
          return (
            <div
              key={doc.id}
              onClick={() => onEdit(doc)}
              className="rounded-xl border p-4 mb-2 cursor-pointer active:opacity-70"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{doc.docNumber}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: doc.status === "confirmed" ? "rgba(48,209,88,0.15)" : "rgba(142,142,147,0.15)",
                    color: doc.status === "confirmed" ? "var(--success)" : "var(--text-muted)",
                  }}
                >
                  {doc.status === "confirmed" ? "확정" : "초안"}
                </span>
              </div>
              <div className="font-semibold text-sm mb-1">{doc.buyerName || "—"}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.date}</span>
                <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>₩{won(grand)}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Main QuotesPanel ─────────────────────────────────────────────────────────
export default function QuotesPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [docTab, setDocTab] = useState<DocTab>("quote");
  const [quotes, setQuotes] = useState<QuoteDoc[]>([]);
  const [pos, setPOs] = useState<PODoc[]>([]);
  const [taxes, setTaxes] = useState<TaxDoc[]>([]);
  const [editing, setEditing] = useState<{ type: DocTab; doc: any } | null>(null);
  const [showBizProfile, setShowBizProfile] = useState(false);

  const reload = useCallback(() => {
    setQuotes(lsLoad<QuoteDoc>(LS_QUOTES));
    setPOs(lsLoad<PODoc>(LS_POS));
    setTaxes(lsLoad<TaxDoc>(LS_TAXES));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  function closeEditor() {
    setEditing(null);
    reload();
  }

  // ── Business Profile view ──
  if (showBizProfile) return <BusinessProfile onClose={() => setShowBizProfile(false)} />;

  // ── Editor views ──
  if (editing) {
    if (editing.type === "quote") return <QuoteEditor doc={editing.doc} onClose={closeEditor} />;
    if (editing.type === "po") return <POEditor doc={editing.doc} onClose={closeEditor} />;
    if (editing.type === "tax") return <TaxEditor doc={editing.doc} onClose={closeEditor} />;
  }

  // ── List view ──
  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">비즈니스 문서</h4>
        <button
          onClick={() => setShowBizProfile(true)}
          className="text-xs px-3 py-1.5 rounded-lg border"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-card)", minHeight: 0 }}
        >
          사업자 정보
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 rounded-xl p-1" style={{ background: "var(--bg-hover)" }}>
        {([
          { id: "quote" as const, label: "견적서" },
          { id: "po" as const, label: "발주서" },
          { id: "tax" as const, label: "세금계산서" },
        ]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setDocTab(id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: docTab === id ? "var(--bg-card)" : "transparent",
              color: docTab === id ? "var(--primary)" : "var(--text-muted)",
              boxShadow: docTab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              minHeight: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {docTab === "quote" && (
        <DocList
          docs={quotes}
          label="견적서"
          onAdd={() => setEditing({ type: "quote", doc: {} })}
          onEdit={(doc) => setEditing({ type: "quote", doc })}
        />
      )}
      {docTab === "po" && (
        <DocList
          docs={pos}
          label="발주서"
          onAdd={() => setEditing({ type: "po", doc: {} })}
          onEdit={(doc) => setEditing({ type: "po", doc })}
        />
      )}
      {docTab === "tax" && (
        <DocList
          docs={taxes}
          label="세금계산서"
          onAdd={() => setEditing({ type: "tax", doc: {} })}
          onEdit={(doc) => setEditing({ type: "tax", doc })}
        />
      )}
    </div>
  );
}
