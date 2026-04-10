"use client";
import { useEffect, useState } from "react";

export interface BizProfile {
  companyName: string;
  regNumber: string; // 000-00-00000
  ceoName: string;
  address: string;
  bizType: string;   // 업태
  bizItem: string;   // 종목
  phone: string;
  fax: string;
  stampUrl: string;  // 인감/직인 이미지 URL
}

const EMPTY: BizProfile = {
  companyName: "", regNumber: "", ceoName: "", address: "",
  bizType: "", bizItem: "", phone: "", fax: "", stampUrl: "",
};

const DEFAULT_SAMPLE: BizProfile = {
  companyName: "일프로 주식회사",
  regNumber: "123-45-67890",
  ceoName: "김사장",
  address: "서울시 강남구 역삼로 123, 4층",
  bizType: "서비스업",
  bizItem: "소프트웨어 개발",
  phone: "02-1234-5678",
  fax: "02-1234-5679",
  stampUrl: "",
};

const LS_KEY = "ilpro_biz_profile";

export function loadBizProfile(): BizProfile {
  if (typeof window === "undefined") return DEFAULT_SAMPLE;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_SAMPLE;
    const parsed = { ...EMPTY, ...JSON.parse(raw) };
    // If user cleared all fields, return default
    return parsed.companyName ? parsed : DEFAULT_SAMPLE;
  } catch {
    return DEFAULT_SAMPLE;
  }
}

export default function BusinessProfile({ onClose }: { onClose?: () => void }) {
  const [form, setForm] = useState<BizProfile>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(loadBizProfile());
  }, []);

  function set(key: keyof BizProfile, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function formatRegNum(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return digits.slice(0, 3) + "-" + digits.slice(3);
    return digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5);
  }

  function handleSave() {
    localStorage.setItem(LS_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose?.();
    }, 800);
  }

  return (
    <div className="p-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        {onClose && (
          <button onClick={onClose} className="text-[var(--primary)] text-sm">← 닫기</button>
        )}
        <h4 className="text-base font-bold flex-1 text-center">사업자 정보 설정</h4>
        <div style={{ width: onClose ? 48 : 0 }} />
      </div>

      <div className="ios-fields">
        <div className="ios-field">
          <label>상호</label>
          <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="(주)일프로" />
        </div>
        <div className="ios-field">
          <label style={{ minWidth: 90 }}>사업자번호</label>
          <input
            value={form.regNumber}
            onChange={(e) => set("regNumber", formatRegNum(e.target.value))}
            placeholder="000-00-00000"
            inputMode="numeric"
          />
        </div>
        <div className="ios-field">
          <label>대표자명</label>
          <input value={form.ceoName} onChange={(e) => set("ceoName", e.target.value)} placeholder="홍길동" />
        </div>
        <div className="ios-field">
          <label>주소</label>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="서울시 강남구 테헤란로 123" />
        </div>
        <div className="ios-field">
          <label>업태</label>
          <input value={form.bizType} onChange={(e) => set("bizType", e.target.value)} placeholder="도소매" />
        </div>
        <div className="ios-field">
          <label>종목</label>
          <input value={form.bizItem} onChange={(e) => set("bizItem", e.target.value)} placeholder="철강재" />
        </div>
        <div className="ios-field">
          <label>전화번호</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="02-1234-5678" inputMode="tel" />
        </div>
        <div className="ios-field">
          <label>팩스</label>
          <input value={form.fax} onChange={(e) => set("fax", e.target.value)} placeholder="02-1234-5679 (선택)" />
        </div>
        <div className="ios-field">
          <label style={{ minWidth: 80 }}>직인 URL</label>
          <input value={form.stampUrl} onChange={(e) => set("stampUrl", e.target.value)} placeholder="https://... (선택)" />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full p-3 rounded-xl font-semibold text-sm text-white transition-colors"
        style={{ background: saved ? "var(--success)" : "var(--primary)" }}
      >
        {saved ? "저장 완료!" : "저장"}
      </button>
    </div>
  );
}
