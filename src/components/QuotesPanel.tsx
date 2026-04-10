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
    <div style={{ background: "var(--bg-card)", color: "var(--text)", padding: "20px", fontFamily: "'Noto Sans KR', sans-serif", fontSize: "12px", lineHeight: 1.5 }}>
      <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: 700, letterSpacing: "12px", marginBottom: "20px" }}>{title}</h2>

      {/* Header info */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", width: "20%", background: "var(--bg-hover)", fontWeight: 600 }}>{docNumLabel}</td>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", width: "30%" }}>{doc.docNumber}</td>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", width: "20%", background: "var(--bg-hover)", fontWeight: 600 }}>견적일자</td>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", width: "30%" }}>{doc.date}</td>
          </tr>
          {!isPO && (
            <tr>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 600 }}>유효기간</td>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px" }}>{doc.validUntil}</td>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 600 }}>결제조건</td>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px" }}>{doc.paymentTerms}</td>
            </tr>
          )}
          {isPO && (
            <tr>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 600 }}>납기일</td>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px" }}>{(doc as PODoc).deliveryDate}</td>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 600 }}>납품장소</td>
              <td style={{ border: "1px solid var(--border)", padding: "6px 10px" }}>{(doc as PODoc).deliveryPlace}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Supplier / Buyer two-column */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid var(--border)", padding: "6px", background: "var(--bg-hover)", width: "50%" }}>공급자</th>
            <th style={{ border: "1px solid var(--border)", padding: "6px", background: "var(--bg-hover)", width: "50%" }}>공급받는자</th>
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
              <td style={{ border: "1px solid var(--border)", padding: "5px 8px" }}><strong>{label}:</strong> {sup}</td>
              <td style={{ border: "1px solid var(--border)", padding: "5px 8px" }}>{buy && <><strong>{label}:</strong> {buy}</>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
        <thead>
          <tr style={{ background: "var(--bg-hover)" }}>
            {["No.", "품명", "규격", "수량", "단위", "단가", "공급가액", "세액", "비고"].map((h) => (
              <th key={h} style={{ border: "1px solid var(--border)", padding: "5px 4px", textAlign: "center", fontSize: "11px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doc.items.filter((it) => it.name).map((it, i) => {
            const { supply: s, vat: v } = calcItem(it);
            return (
              <tr key={i}>
                <td style={{ border: "1px solid var(--border)", padding: "4px", textAlign: "center" }}>{i + 1}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px" }}>{it.name}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px" }}>{it.spec}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px", textAlign: "right" }}>{won(it.qty)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px", textAlign: "center" }}>{it.unit}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px", textAlign: "right" }}>{won(it.unitPrice)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px", textAlign: "right" }}>{won(s)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px", textAlign: "right" }}>{won(v)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px" }}>{it.remark}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 5 - doc.items.filter((it) => it.name).length) }).map((_, i) => (
            <tr key={"empty" + i}>
              {Array.from({ length: 9 }).map((__, j) => (
                <td key={j} style={{ border: "1px solid var(--border)", padding: "4px", height: "22px" }}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 600, width: "20%" }}>공급가액 합계</td>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", width: "30%", textAlign: "right" }}>{won(supply)}원</td>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 600, width: "20%" }}>세액 합계</td>
            <td style={{ border: "1px solid var(--border)", padding: "6px 10px", width: "30%", textAlign: "right" }}>{won(vat)}원</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ border: "1px solid var(--border)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 700, fontSize: "14px" }}>총 합계</td>
            <td colSpan={2} style={{ border: "1px solid var(--border)", padding: "6px 10px", textAlign: "right", fontWeight: 700, fontSize: "14px" }}>₩{won(grand)}</td>
          </tr>
        </tbody>
      </table>

      {doc.notes && (
        <div style={{ border: "1px solid var(--border)", padding: "8px 12px", marginBottom: "12px" }}>
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
            <div style={{ width: 60, height: 60, border: "1px dashed #999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--text-faint)" }}>직인</div>
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
    <div style={{ background: "var(--bg-card)", color: "var(--text)", padding: "16px", fontFamily: "'Noto Sans KR', sans-serif", fontSize: "11px", lineHeight: 1.4 }}>
      <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: 700, letterSpacing: "8px", marginBottom: "4px" }}>세금계산서</h2>
      <div style={{ textAlign: "center", fontSize: "12px", marginBottom: "12px" }}>
        이 금액을&nbsp;
        <span style={{ border: "1px solid var(--border)", padding: "1px 6px" }}>{doc.invoiceType === "영수" ? "✓" : " "} 영수</span>
        &nbsp;
        <span style={{ border: "1px solid var(--border)", padding: "1px 6px" }}>{doc.invoiceType === "청구" ? "✓" : " "} 청구</span>
        &nbsp;함
      </div>

      {/* Supplier / Buyer */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", tableLayout: "fixed" }}>
        <tbody>
          <tr>
            <td style={{ width: "10%", border: "1px solid var(--border)", background: "var(--bg-hover)", padding: "4px", textAlign: "center", fontWeight: 700, writingMode: "vertical-rl", fontSize: "13px", letterSpacing: "4px" }}>공급자</td>
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
                      <td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", width: "34%", fontWeight: 600 }}>{k}</td>
                      <td style={{ border: "1px solid var(--border)", padding: "3px 6px" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td style={{ width: "10%", border: "1px solid var(--border)", background: "var(--bg-hover)", padding: "4px", textAlign: "center", fontWeight: 700, writingMode: "vertical-rl", fontSize: "13px", letterSpacing: "4px" }}>공급받는자</td>
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
                      <td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", width: "34%", fontWeight: 600 }}>{k}</td>
                      <td style={{ border: "1px solid var(--border)", padding: "3px 6px" }}>{v}</td>
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
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 700, width: "20%" }}>합계금액</td>
            <td colSpan={3} style={{ border: "1px solid var(--border)", padding: "5px 8px", fontWeight: 700, fontSize: "13px" }}>{toKoreanAmount(grand)} (₩{won(grand)})</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>작성년월일</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", width: "30%" }}>{doc.date}</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>발행번호</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px" }}>{doc.docNumber}</td>
          </tr>
        </tbody>
      </table>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
        <thead>
          <tr style={{ background: "var(--bg-hover)" }}>
            {["월", "일", "품목", "규격", "수량", "단가", "공급가액", "세액", "비고"].map((h) => (
              <th key={h} style={{ border: "1px solid var(--border)", padding: "4px 3px", textAlign: "center", fontSize: "10px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doc.items.filter((it) => it.name).map((it, i) => {
            const d = new Date(doc.date);
            const { supply: s, vat: v } = calcItem(it);
            return (
              <tr key={i}>
                <td style={{ border: "1px solid var(--border)", padding: "4px 3px", textAlign: "center" }}>{String(d.getMonth() + 1).padStart(2, "0")}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 3px", textAlign: "center" }}>{String(d.getDate()).padStart(2, "0")}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px" }}>{it.name}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px" }}>{it.spec}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 3px", textAlign: "right" }}>{won(it.qty)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 3px", textAlign: "right" }}>{won(it.unitPrice)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 3px", textAlign: "right" }}>{won(s)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 3px", textAlign: "right" }}>{won(v)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px" }}>{it.remark}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 4 - doc.items.filter((it) => it.name).length) }).map((_, i) => (
            <tr key={"empty" + i}>
              {Array.from({ length: 9 }).map((__, j) => (
                <td key={j} style={{ border: "1px solid var(--border)", padding: "4px", height: "20px" }}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals row */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "12%" }}>합계</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", textAlign: "right", width: "22%" }}>{won(supply)}</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", textAlign: "right", width: "22%" }}>{won(vat)}</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "12%" }}>총합계</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px 8px", textAlign: "right", fontWeight: 700 }}>{won(grand)}</td>
          </tr>
        </tbody>
      </table>

      {/* Payment breakdown */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg-hover)" }}>
            {["현금", "수표", "어음", "외상미수금"].map((h) => (
              <th key={h} style={{ border: "1px solid var(--border)", padding: "4px", textAlign: "center", width: "25%" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid var(--border)", padding: "5px", textAlign: "right" }}>{doc.cash ? won(doc.cash) : ""}</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px", textAlign: "right" }}>{doc.check ? won(doc.check) : ""}</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px", textAlign: "right" }}>{doc.note ? won(doc.note) : ""}</td>
            <td style={{ border: "1px solid var(--border)", padding: "5px", textAlign: "right" }}>{doc.credit ? won(doc.credit) : ""}</td>
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

  const totals = calcTotals(items);

  return (
    <div className="p-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onClose} className="text-[var(--primary)] text-sm">← 목록</button>
        <div className="flex gap-2">
          <button onClick={() => printEl(printId.current)} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--bg-hover)", color: "var(--text-muted)", minHeight: 0 }}>🖨️ PDF</button>
          <button onClick={() => { setStatus(status === "confirmed" ? "draft" : "confirmed"); }}
            className="px-3 py-1.5 text-xs rounded-lg font-medium" style={{ background: status === "confirmed" ? "rgba(48,209,88,0.15)" : "var(--bg-hover)", color: status === "confirmed" ? "#30D158" : "var(--text-muted)", minHeight: 0 }}>
            {status === "confirmed" ? "✓ 확정됨" : "확정"}
          </button>
          <button onClick={save} className="px-3 py-1.5 text-xs rounded-lg font-semibold text-white" style={{ background: "var(--primary)", minHeight: 0 }}>저장</button>
        </div>
      </div>

      {/* Paper-style form */}
      <div className="rounded-lg overflow-hidden" style={{ border: "2px solid var(--border)" }}>
        <div style={{ background: "var(--bg-card)", color: "var(--text)", padding: "20px", fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif", fontSize: "12px" }}>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "12px", color: "var(--text)" }}>견 적 서</div>
          </div>

          {/* Grand total */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", background: "var(--bg-hover)", fontWeight: 700, width: "20%", fontSize: "13px" }}>합계금액</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", fontSize: "18px", fontWeight: 900, color: "var(--primary)" }}>₩{won(totals.grand)}</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", background: "var(--bg-hover)", fontWeight: 700, width: "15%" }}>견적번호</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", width: "25%", fontSize: "11px" }}>{docNumber}</td>
              </tr>
            </tbody>
          </table>

          {/* Doc info */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>견적일자</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 4px", width: "35%" }}>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ border: "none", outline: "none", width: "100%", fontSize: "12px", padding: "2px 4px" }} />
                </td>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>유효기간</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 4px", width: "35%" }}>
                  <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} style={{ border: "none", outline: "none", width: "100%", fontSize: "12px", padding: "2px 4px" }} />
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>결제조건</td>
                <td colSpan={3} style={{ border: "1px solid var(--border)", padding: "3px 4px" }}>
                  <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="현금, 30일 후 지급 등" style={{ border: "none", outline: "none", width: "100%", fontSize: "12px", padding: "2px 4px" }} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Supplier / Buyer */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
            <thead>
              <tr>
                <th colSpan={2} style={{ border: "1px solid var(--border)", padding: "5px", background: "var(--bg-hover)", width: "50%" }}>공급자</th>
                <th colSpan={2} style={{ border: "1px solid var(--border)", padding: "5px", background: "var(--bg-hover)", width: "50%" }}>공급받는자</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "상호", left: biz.companyName, right: buyerName, setRight: setBuyerName },
                { label: "사업자번호", left: biz.regNumber, right: buyerReg, setRight: setBuyerReg },
                { label: "대표자", left: biz.ceoName, right: buyerCeo, setRight: setBuyerCeo },
                { label: "주소", left: biz.address, right: buyerAddr, setRight: setBuyerAddr },
              ].map(({ label, left, right, setRight }) => (
                <tr key={label}>
                  <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>{label}</td>
                  <td style={{ border: "1px solid var(--border)", padding: "4px 8px", width: "35%", color: left ? "var(--text)" : "var(--text-ghost)" }}>{left || "사업자 정보를 설정하세요"}</td>
                  <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>{label}</td>
                  <td style={{ border: "1px solid var(--border)", padding: "2px 4px", width: "35%" }}>
                    <input value={right} onChange={e => setRight(e.target.value)} placeholder={`거래처 ${label}`} style={{ border: "none", outline: "none", width: "100%", fontSize: "11px", padding: "2px 4px" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
            <thead>
              <tr style={{ background: "var(--bg-hover)" }}>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, width: "5%" }}>No</th>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600 }}>품명</th>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, width: "12%" }}>규격</th>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, width: "8%" }}>수량</th>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, width: "13%", textAlign: "right" }}>단가</th>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, width: "15%", textAlign: "right" }}>공급가액</th>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, width: "13%", textAlign: "right" }}>세액</th>
                <th style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, width: "5%" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const { supply, vat } = calcItem(it);
                return (
                  <tr key={i}>
                    <td style={{ border: "1px solid var(--border)", padding: "3px 4px", textAlign: "center", color: "var(--text-faint)" }}>{i + 1}</td>
                    <td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}>
                      <input value={it.name} onChange={e => { const n = [...items]; n[i] = { ...it, name: e.target.value }; setItems(n); }} placeholder="품목명" style={{ border: "none", outline: "none", width: "100%", fontSize: "11px", padding: "2px" }} />
                    </td>
                    <td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}>
                      <input value={it.spec} onChange={e => { const n = [...items]; n[i] = { ...it, spec: e.target.value }; setItems(n); }} placeholder="규격" style={{ border: "none", outline: "none", width: "100%", fontSize: "11px", padding: "2px" }} />
                    </td>
                    <td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}>
                      <input type="number" value={it.qty} onChange={e => { const n = [...items]; n[i] = { ...it, qty: Number(e.target.value) }; setItems(n); }} style={{ border: "none", outline: "none", width: "100%", fontSize: "11px", padding: "2px", textAlign: "center" }} />
                    </td>
                    <td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}>
                      <input type="number" value={it.unitPrice} onChange={e => { const n = [...items]; n[i] = { ...it, unitPrice: Number(e.target.value) }; setItems(n); }} style={{ border: "none", outline: "none", width: "100%", fontSize: "11px", padding: "2px", textAlign: "right" }} />
                    </td>
                    <td style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "right", fontWeight: 500 }}>{won(supply)}</td>
                    <td style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "right", color: "var(--text-muted)" }}>{won(vat)}</td>
                    <td style={{ border: "1px solid var(--border)", padding: "2px", textAlign: "center" }}>
                      {items.length > 1 && <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} style={{ color: "var(--text-ghost)", fontSize: "11px", cursor: "pointer", border: "none", background: "none" }}>✕</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={() => setItems([...items, { ...EMPTY_ITEM }])} style={{ fontSize: "11px", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontWeight: 600 }}>+ 품목 추가</button>

          {/* Totals */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", marginBottom: "14px" }}>
            <tbody>
              <tr style={{ background: "var(--bg-hover)" }}>
                <td style={{ border: "1px solid var(--border)", padding: "6px 10px", fontWeight: 700, width: "25%" }}>공급가액 합계</td>
                <td style={{ border: "1px solid var(--border)", padding: "6px 10px", textAlign: "right", width: "25%" }}>₩{won(totals.supply)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "6px 10px", fontWeight: 700, width: "25%" }}>세액 (VAT 10%)</td>
                <td style={{ border: "1px solid var(--border)", padding: "6px 10px", textAlign: "right", width: "25%" }}>₩{won(totals.vat)}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: "1.5px solid var(--text)", padding: "8px 10px", fontWeight: 800, fontSize: "14px" }}>합 계</td>
                <td colSpan={2} style={{ border: "1.5px solid var(--text)", padding: "8px 10px", textAlign: "right", fontWeight: 900, fontSize: "16px", color: "var(--primary)" }}>₩{won(totals.grand)}</td>
              </tr>
            </tbody>
          </table>

          {/* Notes */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%", verticalAlign: "top" }}>특기사항</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 4px" }}>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="납기, 운송비 별도 등" rows={2} style={{ border: "none", outline: "none", width: "100%", fontSize: "11px", padding: "4px", resize: "none" }} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Stamp area */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{biz.companyName || "공급자"}</div>
              <div style={{ width: 60, height: 60, border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "var(--text-ghost)", marginTop: "4px", borderRadius: "50%" }}>직인</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-2 mt-3">
        <button onClick={save} className="flex-1 p-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>저장</button>
        {doc.id && <button onClick={del} className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)" }}>삭제</button>}
      </div>

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

  const totals = calcTotals(items);
  const inp = { border: "none" as const, outline: "none" as const, width: "100%", fontSize: "11px", padding: "2px 4px" };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onClose} className="text-[var(--primary)] text-sm">← 목록</button>
        <div className="flex gap-2">
          <button onClick={() => printEl(printId.current)} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--bg-hover)", color: "var(--text-muted)", minHeight: 0 }}>🖨️ PDF</button>
          <button onClick={save} className="px-3 py-1.5 text-xs rounded-lg font-semibold text-white" style={{ background: "var(--primary)", minHeight: 0 }}>저장</button>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: "2px solid var(--border)" }}>
        <div style={{ background: "var(--bg-card)", color: "var(--text)", padding: "20px", fontFamily: "'Noto Sans KR', sans-serif", fontSize: "12px" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "12px", color: "var(--text)" }}>발 주 서</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", background: "var(--bg-hover)", fontWeight: 700, width: "20%", fontSize: "13px" }}>합계금액</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", fontSize: "18px", fontWeight: 900, color: "var(--primary)" }}>₩{won(totals.grand)}</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", background: "var(--bg-hover)", fontWeight: 700, width: "15%" }}>발주번호</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "8px 12px", width: "25%", fontSize: "11px" }}>{docNumber}</td>
              </tr>
            </tbody>
          </table>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>발주일자</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 4px", width: "35%" }}><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>납기일</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 4px", width: "35%" }}><input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={inp} /></td>
              </tr>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>납품장소</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 4px" }}><input value={deliveryPlace} onChange={e => setDeliveryPlace(e.target.value)} placeholder="본사 창고" style={inp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>결제조건</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 4px" }}><input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="현금, 30일 어음" style={inp} /></td>
              </tr>
            </tbody>
          </table>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
            <thead><tr><th colSpan={2} style={{ border: "1px solid var(--border)", padding: "5px", background: "var(--bg-hover)", width: "50%" }}>발주자</th><th colSpan={2} style={{ border: "1px solid var(--border)", padding: "5px", background: "var(--bg-hover)", width: "50%" }}>공급업체</th></tr></thead>
            <tbody>
              {[{ label: "상호", left: biz.companyName, right: buyerName, set: setBuyerName }, { label: "사업자번호", left: biz.regNumber, right: buyerReg, set: setBuyerReg }, { label: "대표자", left: biz.ceoName, right: buyerCeo, set: setBuyerCeo }, { label: "주소", left: biz.address, right: buyerAddr, set: setBuyerAddr }].map(r => (
                <tr key={r.label}><td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>{r.label}</td><td style={{ border: "1px solid var(--border)", padding: "4px 8px", width: "35%" }}>{r.left || "—"}</td><td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>{r.label}</td><td style={{ border: "1px solid var(--border)", padding: "2px 4px", width: "35%" }}><input value={r.right} onChange={e => r.set(e.target.value)} placeholder={`${r.label}`} style={inp} /></td></tr>
              ))}
            </tbody>
          </table>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
            <thead><tr style={{ background: "var(--bg-hover)" }}>{["No","품명","규격","수량","단가","공급가액","세액",""].map(h => <th key={h} style={{ border: "1px solid var(--border)", padding: "5px 4px", fontWeight: 600, textAlign: h === "단가" || h === "공급가액" || h === "세액" ? "right" : "center", width: h === "No" ? "5%" : h === "" ? "5%" : undefined }}>{h}</th>)}</tr></thead>
            <tbody>{items.map((it, i) => { const { supply, vat } = calcItem(it); return (<tr key={i}><td style={{ border: "1px solid var(--border)", padding: "3px 4px", textAlign: "center", color: "var(--text-faint)" }}>{i+1}</td><td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}><input value={it.name} onChange={e => { const n=[...items]; n[i]={...it,name:e.target.value}; setItems(n); }} style={inp} /></td><td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}><input value={it.spec} onChange={e => { const n=[...items]; n[i]={...it,spec:e.target.value}; setItems(n); }} style={inp} /></td><td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}><input type="number" value={it.qty} onChange={e => { const n=[...items]; n[i]={...it,qty:Number(e.target.value)}; setItems(n); }} style={{...inp,textAlign:"center"}} /></td><td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}><input type="number" value={it.unitPrice} onChange={e => { const n=[...items]; n[i]={...it,unitPrice:Number(e.target.value)}; setItems(n); }} style={{...inp,textAlign:"right"}} /></td><td style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "right" }}>{won(supply)}</td><td style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "right", color: "var(--text-muted)" }}>{won(vat)}</td><td style={{ border: "1px solid var(--border)", padding: "2px", textAlign: "center" }}>{items.length > 1 && <button onClick={() => setItems(items.filter((_,idx) => idx!==i))} style={{ color: "var(--text-ghost)", fontSize: "11px", cursor: "pointer", border: "none", background: "none" }}>✕</button>}</td></tr>); })}</tbody>
          </table>
          <button onClick={() => setItems([...items, { ...EMPTY_ITEM }])} style={{ fontSize: "11px", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontWeight: 600 }}>+ 품목 추가</button>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", marginBottom: "14px" }}>
            <tbody>
              <tr style={{ background: "var(--bg-hover)" }}><td style={{ border: "1px solid var(--border)", padding: "6px 10px", fontWeight: 700, width: "25%" }}>공급가액</td><td style={{ border: "1px solid var(--border)", padding: "6px 10px", textAlign: "right", width: "25%" }}>₩{won(totals.supply)}</td><td style={{ border: "1px solid var(--border)", padding: "6px 10px", fontWeight: 700, width: "25%" }}>세액 (VAT)</td><td style={{ border: "1px solid var(--border)", padding: "6px 10px", textAlign: "right", width: "25%" }}>₩{won(totals.vat)}</td></tr>
              <tr><td colSpan={2} style={{ border: "1.5px solid var(--text)", padding: "8px 10px", fontWeight: 800, fontSize: "14px" }}>합 계</td><td colSpan={2} style={{ border: "1.5px solid var(--text)", padding: "8px 10px", textAlign: "right", fontWeight: 900, fontSize: "16px", color: "var(--primary)" }}>₩{won(totals.grand)}</td></tr>
            </tbody>
          </table>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}><tbody><tr><td style={{ border: "1px solid var(--border)", padding: "5px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%", verticalAlign: "top" }}>특기사항</td><td style={{ border: "1px solid var(--border)", padding: "3px 4px" }}><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="포장방법, 운송비 조건 등" rows={2} style={{ border: "none", outline: "none", width: "100%", fontSize: "11px", padding: "4px", resize: "none" }} /></td></tr></tbody></table>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{biz.companyName || "발주자"}</div><div style={{ width: 60, height: 60, border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "var(--text-ghost)", marginTop: "4px", borderRadius: "50%" }}>직인</div></div></div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={save} className="flex-1 p-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>저장</button>
        {doc.id && <button onClick={del} className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)" }}>삭제</button>}
      </div>
      <div id={printId.current} style={{ display: "none" }}><QuotePrintTemplate doc={buildDoc()} isPO={true} /></div>
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

  const inp = { border: "none" as const, outline: "none" as const, width: "100%", fontSize: "11px", padding: "2px 4px" };
  const ninp = { ...inp, textAlign: "right" as const };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onClose} className="text-[var(--primary)] text-sm">← 목록</button>
        <div className="flex gap-2">
          <button onClick={() => printEl(printId.current)} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--bg-hover)", color: "var(--text-muted)", minHeight: 0 }}>🖨️ PDF</button>
          <button onClick={save} className="px-3 py-1.5 text-xs rounded-lg font-semibold text-white" style={{ background: "var(--primary)", minHeight: 0 }}>저장</button>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: "2px solid var(--border)" }}>
        <div style={{ background: "var(--bg-card)", color: "var(--text)", padding: "20px", fontFamily: "'Noto Sans KR', sans-serif", fontSize: "12px" }}>
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "4px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "10px", color: "var(--text)" }}>세금계산서</div>
          </div>
          <div style={{ textAlign: "center", marginBottom: "14px", fontSize: "12px" }}>
            이 금액을&nbsp;
            {(["영수", "청구"] as const).map(t => (
              <label key={t} style={{ cursor: "pointer", margin: "0 4px", border: "1px solid var(--border)", padding: "1px 8px" }}>
                <input type="radio" checked={invoiceType === t} onChange={() => setInvoiceType(t)} style={{ marginRight: "3px" }} />{t}
              </label>
            ))}
            &nbsp;함
          </div>

          {/* Amount + docnum */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1.5px solid var(--text)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 700, width: "20%" }}>합계금액</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "6px 10px", fontSize: "16px", fontWeight: 900, color: "var(--primary)" }}>₩{won(grand)}</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "6px 10px", background: "var(--bg-hover)", fontWeight: 700, width: "15%" }}>발행번호</td>
                <td style={{ border: "1.5px solid var(--text)", padding: "6px 10px", fontSize: "11px" }}>{docNumber}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>작성일자</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 4px" }}><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>한글금액</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 8px", fontSize: "10px" }}>{toKoreanAmount(grand)}</td>
              </tr>
            </tbody>
          </table>

          {/* Supplier / Buyer — 국세청 style with vertical labels */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
            <tbody>
              <tr>
                <td rowSpan={6} style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", padding: "4px", textAlign: "center", fontWeight: 700, writingMode: "vertical-rl", fontSize: "13px", letterSpacing: "4px", width: "5%" }}>공급자</td>
                {[{ l: "등록번호", v: biz.regNumber }, { l: "상호", v: biz.companyName }].map(({ l, v }) => (
                  <><td key={l+"l"} style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600, width: "10%" }}>{l}</td><td key={l+"v"} style={{ border: "1px solid var(--border)", padding: "3px 6px", width: "30%" }}>{v || "—"}</td></>
                ))}
                <td rowSpan={6} style={{ border: "1px solid var(--border)", background: "var(--bg-hover)", padding: "4px", textAlign: "center", fontWeight: 700, writingMode: "vertical-rl", fontSize: "13px", letterSpacing: "4px", width: "5%" }}>공급받는자</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600, width: "10%" }}>등록번호</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 3px", width: "30%" }}><input value={buyerReg} onChange={e => setBuyerReg(e.target.value)} placeholder="000-00-00000" style={inp} /></td>
              </tr>
              {[
                { l: "성명(대표)", left: biz.ceoName, right: buyerCeo, set: setBuyerCeo },
                { l: "사업장", left: biz.address, right: buyerAddr, set: setBuyerAddr },
                { l: "업태", left: biz.bizType, right: buyerBizType, set: setBuyerBizType },
                { l: "종목", left: biz.bizItem, right: buyerBizItem, set: setBuyerBizItem },
              ].map((r, ri) => (
                <tr key={ri}>
                  {ri === 0 && <><td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600 }}>상호</td><td style={{ border: "1px solid var(--border)", padding: "3px 6px" }}>{biz.companyName || "—"}</td></>}
                  {ri === 1 && <><td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600 }}>{r.l}</td><td style={{ border: "1px solid var(--border)", padding: "3px 6px" }}>{r.left || "—"}</td></>}
                  {ri === 2 && <><td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600 }}>{r.l}</td><td style={{ border: "1px solid var(--border)", padding: "3px 6px" }}>{r.left || "—"}</td></>}
                  {ri === 3 && <><td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600 }}>{r.l}</td><td style={{ border: "1px solid var(--border)", padding: "3px 6px" }}>{r.left || "—"}</td></>}
                  {ri === 0 && <td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600 }}>상호</td>}
                  {ri !== 0 && <td style={{ border: "1px solid var(--border)", padding: "3px 6px", background: "var(--bg-hover)", fontWeight: 600 }}>{r.l}</td>}
                  <td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}><input value={ri === 0 ? buyerName : r.right} onChange={e => ri === 0 ? setBuyerName(e.target.value) : r.set(e.target.value)} style={inp} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Items */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
            <thead><tr style={{ background: "var(--bg-hover)" }}>{["월","일","품목","규격","수량","단가","공급가액","세액",""].map(h => <th key={h} style={{ border: "1px solid var(--border)", padding: "4px 3px", fontWeight: 600, textAlign: "center", fontSize: "10px" }}>{h}</th>)}</tr></thead>
            <tbody>{items.map((it, i) => { const { supply: s, vat: v } = calcItem(it); const d2 = new Date(date); return (
              <tr key={i}>
                <td style={{ border: "1px solid var(--border)", padding: "3px", textAlign: "center", width: "6%" }}>{String(d2.getMonth()+1).padStart(2,"0")}</td>
                <td style={{ border: "1px solid var(--border)", padding: "3px", textAlign: "center", width: "6%" }}>{String(d2.getDate()).padStart(2,"0")}</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 3px" }}><input value={it.name} onChange={e => { const n=[...items]; n[i]={...it,name:e.target.value}; setItems(n); }} style={inp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 3px", width: "10%" }}><input value={it.spec} onChange={e => { const n=[...items]; n[i]={...it,spec:e.target.value}; setItems(n); }} style={inp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 3px", width: "8%" }}><input type="number" value={it.qty} onChange={e => { const n=[...items]; n[i]={...it,qty:Number(e.target.value)}; setItems(n); }} style={{...inp,textAlign:"center"}} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 3px", width: "12%" }}><input type="number" value={it.unitPrice} onChange={e => { const n=[...items]; n[i]={...it,unitPrice:Number(e.target.value)}; setItems(n); }} style={ninp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 4px", textAlign: "right", width: "13%" }}>{won(s)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 4px", textAlign: "right", width: "11%", color: "var(--text-muted)" }}>{won(v)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px", textAlign: "center", width: "4%" }}>{items.length > 1 && <button onClick={() => setItems(items.filter((_,idx) => idx!==i))} style={{ color: "var(--text-ghost)", fontSize: "10px", cursor: "pointer", border: "none", background: "none" }}>✕</button>}</td>
              </tr>); })}</tbody>
          </table>
          <button onClick={() => setItems([...items, { ...EMPTY_ITEM }])} style={{ fontSize: "11px", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontWeight: 600 }}>+ 품목 추가</button>

          {/* Totals + payment */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", marginBottom: "10px" }}>
            <tbody>
              <tr style={{ background: "var(--bg-hover)" }}>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", fontWeight: 700 }}>공급가액</td>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", textAlign: "right" }}>₩{won(supply)}</td>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", fontWeight: 700 }}>세액</td>
                <td style={{ border: "1px solid var(--border)", padding: "5px 8px", textAlign: "right" }}>₩{won(vat)}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>현금</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 4px" }}><input type="number" value={cash || ""} onChange={e => setCash(Number(e.target.value)||0)} placeholder="0" style={ninp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>수표</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 4px" }}><input type="number" value={check || ""} onChange={e => setCheck(Number(e.target.value)||0)} placeholder="0" style={ninp} /></td>
              </tr>
              <tr>
                <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>어음</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 4px" }}><input type="number" value={note || ""} onChange={e => setNote(Number(e.target.value)||0)} placeholder="0" style={ninp} /></td>
                <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>외상미수금</td>
                <td style={{ border: "1px solid var(--border)", padding: "2px 4px" }}><input type="number" value={credit || ""} onChange={e => setCredit(Number(e.target.value)||0)} placeholder="0" style={ninp} /></td>
              </tr>
            </tbody>
          </table>

          {/* Stamp */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{biz.companyName || "공급자"}</div><div style={{ width: 60, height: 60, border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "var(--text-ghost)", marginTop: "4px", borderRadius: "50%" }}>직인</div></div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={save} className="flex-1 p-3 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>저장</button>
        {doc.id && <button onClick={del} className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)" }}>삭제</button>}
      </div>
      <div id={printId.current} style={{ display: "none" }}><TaxPrintTemplate doc={buildDoc()} /></div>
    </div>
  );
}

// ─── Document List — Korean paper-style ───────────────────────────────────────
function DocList<T extends { id: string; docNumber: string; date: string; status: string; buyerName: string; items: DocItem[]; supplier?: BizProfile; buyerReg?: string; buyerCeo?: string }>({
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
        <div className="space-y-4">
          {docs.map((doc) => {
            const { supply, vat, grand } = calcTotals(doc.items);
            return (
              <div key={doc.id} onClick={() => onEdit(doc)} className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg overflow-hidden" style={{ border: "2px solid var(--border)" }}>
                {/* Paper-style document */}
                <div style={{ background: "var(--bg-card)", color: "var(--text)", padding: "20px", fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif", fontSize: "11px" }}>
                  {/* Title */}
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "10px", color: "var(--text)" }}>{label}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-faint)", marginTop: "4px" }}>{doc.docNumber} | {doc.date}</div>
                  </div>

                  {/* Grand total highlight */}
                  <div style={{ textAlign: "right", marginBottom: "14px", padding: "10px 14px", background: "var(--bg-hover)", borderRadius: "6px", border: "1px solid #e0e0e0" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>합계금액 (VAT 포함)</span>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--primary)", letterSpacing: "-1px" }}>₩{won(grand)}</div>
                  </div>

                  {/* Supplier / Buyer compact */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "10px" }}>
                    <tbody>
                      <tr>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>공급자</td>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px", width: "35%" }}>{doc.supplier?.companyName || "—"}</td>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600, width: "15%" }}>공급받는자</td>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px", width: "35%" }}>{doc.buyerName || "—"}</td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>사업자번호</td>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px" }}>{doc.supplier?.regNumber || "—"}</td>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px", background: "var(--bg-hover)", fontWeight: 600 }}>사업자번호</td>
                        <td style={{ border: "1px solid var(--border)", padding: "4px 8px" }}>{doc.buyerReg || "—"}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Items table */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "10px" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-hover)" }}>
                        <th style={{ border: "1px solid var(--border)", padding: "4px 6px", fontWeight: 600 }}>품명</th>
                        <th style={{ border: "1px solid var(--border)", padding: "4px 6px", fontWeight: 600, width: "60px" }}>수량</th>
                        <th style={{ border: "1px solid var(--border)", padding: "4px 6px", fontWeight: 600, width: "80px", textAlign: "right" }}>단가</th>
                        <th style={{ border: "1px solid var(--border)", padding: "4px 6px", fontWeight: 600, width: "90px", textAlign: "right" }}>공급가액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.items.slice(0, 4).map((item, i) => {
                        const s = calcItem(item).supply;
                        return (
                          <tr key={i}>
                            <td style={{ border: "1px solid var(--border)", padding: "4px 6px" }}>{item.name}{item.spec ? ` (${item.spec})` : ""}</td>
                            <td style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "center" }}>{item.qty} {item.unit}</td>
                            <td style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "right" }}>{won(item.unitPrice)}</td>
                            <td style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "right" }}>{won(s)}</td>
                          </tr>
                        );
                      })}
                      {doc.items.length > 4 && (
                        <tr><td colSpan={4} style={{ border: "1px solid var(--border)", padding: "4px 6px", textAlign: "center", color: "var(--text-faint)" }}>... 외 {doc.items.length - 4}건</td></tr>
                      )}
                    </tbody>
                  </table>

                  {/* Totals row */}
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                    <tbody>
                      <tr style={{ background: "var(--bg-hover)" }}>
                        <td style={{ border: "1px solid var(--border)", padding: "5px 8px", fontWeight: 600, width: "25%" }}>공급가액</td>
                        <td style={{ border: "1px solid var(--border)", padding: "5px 8px", textAlign: "right", width: "25%" }}>{won(supply)}원</td>
                        <td style={{ border: "1px solid var(--border)", padding: "5px 8px", fontWeight: 600, width: "25%" }}>세액 (10%)</td>
                        <td style={{ border: "1px solid var(--border)", padding: "5px 8px", textAlign: "right", width: "25%" }}>{won(vat)}원</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Status + edit hint */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600, background: doc.status === "confirmed" ? "rgba(48,209,88,0.15)" : "var(--bg-hover)", color: doc.status === "confirmed" ? "var(--success)" : "var(--text-faint)" }}>
                      {doc.status === "confirmed" ? "✓ 확정" : "초안"}
                    </span>
                    <span style={{ fontSize: "9px", color: "var(--text-ghost)" }}>클릭하여 편집 →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

  function loadSampleData() {
    const biz = loadBizProfile();
    const supplier = biz.companyName ? biz : { companyName: "일프로 주식회사", regNumber: "123-45-67890", ceoName: "김사장", address: "서울시 강남구 역삼로 123", bizType: "서비스업", bizItem: "소프트웨어", phone: "02-1234-5678", fax: "" };

    const sampleQuotes: QuoteDoc[] = [
      {
        id: genId(), docNumber: "EST-20260408-001", date: "2026-04-08", validUntil: "2026-05-08", status: "confirmed",
        supplier: supplier as BizProfile, buyerName: "(주)한국제조", buyerReg: "234-56-78901", buyerCeo: "박진수", buyerAddr: "울산시 남구 공업로 45",
        items: [
          { name: "웹사이트 제작", spec: "반응형", qty: 1, unit: "건", unitPrice: 3000000, remark: "" },
          { name: "로고 디자인", spec: "AI 파일", qty: 1, unit: "건", unitPrice: 500000, remark: "" },
          { name: "월 유지보수", spec: "12개월", qty: 12, unit: "월", unitPrice: 200000, remark: "호스팅 포함" },
        ],
        notes: "계약금 50%, 잔금 50% (완료 시)", paymentTerms: "계좌이체",
      },
      {
        id: genId(), docNumber: "EST-20260410-002", date: "2026-04-10", validUntil: "2026-05-10", status: "draft",
        supplier: supplier as BizProfile, buyerName: "울산정밀(주)", buyerReg: "345-67-89012", buyerCeo: "최영호", buyerAddr: "울산시 북구 산업로 78",
        items: [
          { name: "ERP 시스템 구축", spec: "클라우드", qty: 1, unit: "식", unitPrice: 15000000, remark: "" },
          { name: "직원 교육", spec: "2회", qty: 2, unit: "회", unitPrice: 500000, remark: "현장 방문" },
          { name: "데이터 이전", spec: "기존 시스템", qty: 1, unit: "건", unitPrice: 2000000, remark: "" },
        ],
        notes: "납품 후 30일 이내 결제", paymentTerms: "계좌이체",
      },
      {
        id: genId(), docNumber: "EST-20260405-003", date: "2026-04-05", validUntil: "2026-04-20", status: "confirmed",
        supplier: supplier as BizProfile, buyerName: "카페 봄날", buyerReg: "456-78-90123", buyerCeo: "이서연", buyerAddr: "부산시 해운대구 해변로 12",
        items: [
          { name: "메뉴판 디자인", spec: "A3 양면", qty: 50, unit: "장", unitPrice: 3000, remark: "" },
          { name: "배너 제작", spec: "가로 2m", qty: 2, unit: "개", unitPrice: 80000, remark: "실외용" },
          { name: "SNS 콘텐츠 패키지", spec: "1개월", qty: 1, unit: "건", unitPrice: 500000, remark: "인스타+블로그" },
        ],
        notes: "시안 2회 수정 포함", paymentTerms: "현금",
      },
    ];

    const samplePOs: PODoc[] = [
      {
        id: genId(), docNumber: "PO-20260409-001", date: "2026-04-09", validUntil: "2026-04-30", status: "confirmed",
        supplier: supplier as BizProfile, buyerName: "신선식자재(주)", buyerReg: "567-89-01234", buyerCeo: "박서연", buyerAddr: "경기도 이천시 물류단지 5",
        items: [
          { name: "한우 등심", spec: "1++등급", qty: 20, unit: "kg", unitPrice: 48000, remark: "" },
          { name: "양파", spec: "국산", qty: 15, unit: "kg", unitPrice: 2500, remark: "" },
          { name: "대파", spec: "국산", qty: 5, unit: "단", unitPrice: 4000, remark: "" },
          { name: "마늘", spec: "국산 깐마늘", qty: 3, unit: "kg", unitPrice: 12000, remark: "" },
        ],
        notes: "매주 월요일 납품", paymentTerms: "월말 정산",
        deliveryDate: "2026-04-14", deliveryPlace: "서울시 강남구 역삼로 123 주방",
      },
      {
        id: genId(), docNumber: "PO-20260410-002", date: "2026-04-10", validUntil: "2026-05-10", status: "draft",
        supplier: supplier as BizProfile, buyerName: "울산종합유통", buyerReg: "678-90-12345", buyerCeo: "정동현", buyerAddr: "울산시 남구 유통로 33",
        items: [
          { name: "냅킨", spec: "300매입", qty: 10, unit: "박스", unitPrice: 15000, remark: "" },
          { name: "일회용 장갑", spec: "L사이즈", qty: 5, unit: "박스", unitPrice: 8000, remark: "" },
          { name: "세제", spec: "대용량 18L", qty: 2, unit: "통", unitPrice: 32000, remark: "" },
        ],
        notes: "", paymentTerms: "현금",
        deliveryDate: "2026-04-15", deliveryPlace: "매장 직접 수령",
      },
    ];

    const sampleTaxes: TaxDoc[] = [
      {
        id: genId(), docNumber: "TAX-20260401-001", date: "2026-04-01", status: "confirmed", invoiceType: "영수",
        supplier: supplier as BizProfile, buyerName: "(주)한국제조", buyerReg: "234-56-78901", buyerCeo: "박진수", buyerAddr: "울산시 남구 공업로 45", buyerBizType: "제조업", buyerBizItem: "금속가공",
        items: [
          { name: "웹사이트 제작 (1차)", spec: "", qty: 1, unit: "건", unitPrice: 1500000, remark: "계약금" },
        ],
        cash: 1650000, check: 0, note: 0, credit: 0,
      },
      {
        id: genId(), docNumber: "TAX-20260331-002", date: "2026-03-31", status: "confirmed", invoiceType: "청구",
        supplier: supplier as BizProfile, buyerName: "카페 봄날", buyerReg: "456-78-90123", buyerCeo: "이서연", buyerAddr: "부산시 해운대구 해변로 12", buyerBizType: "음식업", buyerBizItem: "카페",
        items: [
          { name: "메뉴판 디자인", spec: "A3 양면", qty: 50, unit: "장", unitPrice: 3000, remark: "" },
          { name: "배너 제작", spec: "가로 2m", qty: 2, unit: "개", unitPrice: 80000, remark: "" },
          { name: "SNS 콘텐츠 패키지", spec: "1개월", qty: 1, unit: "건", unitPrice: 500000, remark: "" },
        ],
        cash: 0, check: 0, note: 0, credit: 814000,
      },
    ];

    lsSave(LS_QUOTES, sampleQuotes);
    lsSave(LS_POS, samplePOs);
    lsSave(LS_TAXES, sampleTaxes);
    reload();
  }

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
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">비즈니스 문서</h4>
        <div className="flex gap-2">
          {quotes.length === 0 && pos.length === 0 && taxes.length === 0 && (
            <button onClick={loadSampleData}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: "var(--primary)", color: "white", minHeight: 0 }}>
              📦 샘플 데이터
            </button>
          )}
          <button
            onClick={() => setShowBizProfile(true)}
            className="text-xs px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-card)", minHeight: 0 }}
          >
            사업자 정보
          </button>
        </div>
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
