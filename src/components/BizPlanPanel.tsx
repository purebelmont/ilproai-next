"use client";

import { useState, useMemo } from "react";
import { SUPPORT_PROGRAMS, type SupportProgram } from "@/data/support-programs";

// ──── 간단한 마크다운 → HTML 변환 ────

function md(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h4 class="bp-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="bp-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.slice(1, -1).split('|').map(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
      const rows = match.trim().split('\n').filter(r => !r.match(/^\|[\s-|]+\|$/));
      if (rows.length === 0) return '';
      const first = rows[0];
      const rest = rows.slice(1).join('\n');
      return `<table class="bp-table"><thead>${first.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>')}</thead><tbody>${rest}</tbody></table>`;
    })
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul class="bp-ul">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, ' ');
}

// ──── 사업계획서 섹션 ────

const PLAN_SECTIONS = [
  { id: "overview", label: "사업 개요", icon: "📋", prompt: "사업 개요를 작성해주세요. 사업의 비전, 미션, 핵심 가치를 포함하세요." },
  { id: "product", label: "제품/서비스", icon: "🛍️", prompt: "제품 또는 서비스 설명을 작성해주세요. 차별점과 경쟁력을 강조하세요." },
  { id: "market", label: "시장 분석", icon: "📊", prompt: "목표 시장, 시장 규모, 타겟 고객, 경쟁사 분석을 작성해주세요." },
  { id: "marketing", label: "마케팅 전략", icon: "📣", prompt: "마케팅 및 영업 전략을 작성해주세요. 고객 확보 방법, 채널, 가격 전략을 포함하세요." },
  { id: "finance", label: "재무 계획", icon: "💰", prompt: "매출 예측, 비용 구조, 손익분기점, 자금 조달 계획을 작성해주세요." },
  { id: "team", label: "팀 구성", icon: "👥", prompt: "팀 구성원, 역할, 핵심 역량을 작성해주세요." },
];

// ──── 지원사업 데모 데이터 ────


// ──── 적합도 계산 ────

function calcMatch(program: SupportProgram, info: BizInfo): number {
  let score = 0;
  const text = `${info.name} ${info.industry} ${info.description} ${info.target} ${info.funding}`.toLowerCase();

  // 업종 매칭
  if (/it|소프트웨어|ai|플랫폼|앱|개발|ict|테크/.test(text)) {
    if (program.tags.some(t => ["ICT", "AI", "기술개발", "R&D", "혁신", "기술창업"].includes(t))) score += 30;
  }
  if (/음식|카페|식당|요식|외식|베이커리/.test(text)) {
    if (program.tags.some(t => ["소상공인", "운영자금"].includes(t))) score += 30;
  }
  if (/제조|공장|생산|부품/.test(text)) {
    if (program.tags.some(t => ["제조업", "소공인", "스마트공장", "제조"].includes(t))) score += 30;
  }
  if (/뷰티|미용|살롱|네일|헤어/.test(text)) {
    if (program.tags.some(t => ["소상공인", "운영자금"].includes(t))) score += 30;
  }

  // 창업 단계 매칭
  if (/예비|준비|계획|시작/.test(text)) {
    if (program.tags.some(t => ["예비창업", "초기창업", "교육"].includes(t))) score += 20;
  }
  if (/초기|1년|2년|3년/.test(text)) {
    if (program.tags.some(t => ["초기창업", "사업화"].includes(t))) score += 20;
  }

  // 대상 매칭
  if (/청년|20대|30대/.test(text) && program.tags.includes("청년")) score += 20;
  if (/여성/.test(text) && program.tags.includes("여성")) score += 25;
  if (/대학|연구/.test(text) && program.tags.includes("대학연계")) score += 20;
  if (/지역|지방/.test(text) && program.tags.includes("지역")) score += 15;

  // 자금 규모 매칭
  if (info.funding) {
    const fundNum = parseInt(info.funding.replace(/[^0-9]/g, "")) || 0;
    const amtText = program.amount;
    if (fundNum <= 7000 && amtText.includes("7천만")) score += 15;
    if (fundNum <= 10000 && amtText.includes("1억")) score += 10;
    if (fundNum > 10000 && /[2-9]억|10억/.test(amtText)) score += 10;
  }

  // 기본 점수 (모든 프로그램에 최소 점수)
  score += 10;

  return Math.min(score, 95);
}

// ──── Types ────

interface BizInfo {
  name: string;
  industry: string;
  description: string;
  target: string;
  funding: string;
}

export default function BizPlanPanel({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"plan" | "support" | "apply">("plan");

  // 사업계획서 state
  const [step, setStep] = useState<"info" | "generating" | "done">("info");
  const [info, setInfo] = useState<BizInfo>({ name: "", industry: "", description: "", target: "", funding: "" });
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const [generating, setGenerating] = useState(false);
  const [currentGen, setCurrentGen] = useState("");
  const [copied, setCopied] = useState("");
  const [progress, setProgress] = useState(0);

  // 지원사업 state
  const [supportResults, setSupportResults] = useState<SupportProgram[]>([]);
  const [supportSearched, setSupportSearched] = useState(false);
  const [supportFilter, setSupportFilter] = useState<string>("all");

  // 지원서 작성 state
  const [applyStep, setApplyStep] = useState<"upload" | "analyzing" | "fields" | "generating" | "done">("upload");
  const [uploadedText, setUploadedText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [detectedFields, setDetectedFields] = useState<{ id: string; label: string; hint: string }[]>([]);
  const [fieldContents, setFieldContents] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState("");
  const [applyGenerating, setApplyGenerating] = useState(false);
  const [applyCurrentGen, setApplyCurrentGen] = useState("");
  const [applyProgress, setApplyProgress] = useState(0);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const copyAll = () => {
    const full = PLAN_SECTIONS.map(s => `# ${s.label}\n\n${sections[s.id] || ""}`).join("\n\n---\n\n");
    const header = `# 사업계획서: ${info.name}\n\n업종: ${info.industry}\n\n---\n\n`;
    navigator.clipboard.writeText(header + full);
    setCopied("all");
    setTimeout(() => setCopied(""), 2000);
  };

  function buildHtml() {
    const body = PLAN_SECTIONS.map(s => `
      <div style="page-break-inside:avoid;margin-bottom:32px;">
        <h2 style="font-size:20px;font-weight:700;color:#7D2AE7;margin-bottom:12px;border-bottom:2px solid #7D2AE7;padding-bottom:6px;">${s.icon} ${s.label}</h2>
        <div style="font-size:14px;line-height:1.8;color:#333;">${md(sections[s.id] || "")}</div>
      </div>`).join("");

    return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>사업계획서 - ${info.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans KR',sans-serif; color:#222; padding:40px; max-width:800px; margin:0 auto; }
  h4 { font-size:16px; font-weight:700; margin:18px 0 8px; color:#333; }
  strong { color:#222; }
  table { width:100%; border-collapse:collapse; margin:12px 0 20px; font-size:13px; }
  th { text-align:left; padding:10px 12px; font-weight:600; background:#f4f0ff; border-bottom:2px solid #7D2AE7; color:#333; }
  td { padding:8px 12px; border-bottom:1px solid #eee; }
  tr:hover td { background:#faf8ff; }
  ul { list-style:none; padding:0; margin:8px 0; }
  li { padding:4px 0 4px 18px; position:relative; }
  li::before { content:"•"; position:absolute; left:0; color:#7D2AE7; font-weight:bold; }
  @media print { body { padding:20px; } }
</style></head><body>
  <div style="text-align:center;margin-bottom:40px;padding:30px 0;border-bottom:3px solid #7D2AE7;">
    <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;">사업계획서</h1>
    <div style="font-size:22px;font-weight:700;color:#7D2AE7;margin-bottom:12px;">${info.name}</div>
    <div style="font-size:14px;color:#888;">업종: ${info.industry} | 타겟: ${info.target || "-"} | 자금: ${info.funding || "-"}</div>
    <div style="font-size:12px;color:#aaa;margin-top:8px;">${new Date().toLocaleDateString("ko-KR")}</div>
  </div>
  ${body}
  <div style="text-align:center;padding:20px 0;margin-top:40px;border-top:1px solid #eee;color:#aaa;font-size:11px;">
    일프로 AI · ilpro.ai
  </div>
</body></html>`;
  }

  function downloadHtml() {
    const html = buildHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `사업계획서_${info.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const html = buildHtml();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  }

  async function generateSection(sectionId: string, sectionLabel: string): Promise<string> {
    try {
      const res = await fetch("/api/bizplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionLabel, name: info.name, industry: info.industry, description: info.description, target: info.target, funding: info.funding }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setSections(prev => ({ ...prev, [sectionId]: full }));
        }
      }
      return full;
    } catch {
      return "생성 중 오류가 발생했습니다. 다시 시도해주세요.";
    }
  }

  async function generateAll() {
    setStep("generating");
    setGenerating(true);
    setProgress(0);
    for (let i = 0; i < PLAN_SECTIONS.length; i++) {
      const s = PLAN_SECTIONS[i];
      setCurrentGen(s.label);
      setActiveSection(s.id);
      setProgress(Math.round((i / PLAN_SECTIONS.length) * 100));
      await generateSection(s.id, s.label);
    }
    setProgress(100);
    setCurrentGen("");
    setGenerating(false);
    setStep("done");
    setActiveSection("overview");
  }

  async function regenerateSection(sectionId: string) {
    const s = PLAN_SECTIONS.find(x => x.id === sectionId);
    if (!s) return;
    setGenerating(true);
    setCurrentGen(s.label);
    await generateSection(s.id, s.label);
    setCurrentGen("");
    setGenerating(false);
  }

  function searchSupport() {
    const results = SUPPORT_PROGRAMS.map(p => ({
      ...p,
      match: calcMatch(p, info),
    })).sort((a, b) => b.match - a.match);
    setSupportResults(results);
    setSupportSearched(true);
  }

  // ──── 지원서 분석 — 텍스트에서 번호매김 항목을 직접 추출 ────
  function analyzeDocument(text: string) {
    setApplyStep("analyzing");
    setTimeout(() => {
      const fields: { id: string; label: string; hint: string }[] = [];

      // 1단계: 텍스트에서 "X-Y. 제목" 또는 "X. 제목" 패턴 추출 (HWP 실제 구조)
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      const sectionPattern = /^(\d+[-.]?\d*\.?\s*)(.{2,40})$/;
      const kwPattern = /^[○●◎▶■□]\s*(.+)$/;

      for (const line of lines) {
        // "1-1. 필요성" / "2-1. 수익성" 패턴
        const m = line.match(sectionPattern);
        if (m) {
          const label = m[2].trim();
          // 작성 안내 문구 등 제외
          if (label.length >= 2 && label.length <= 30 && !/유의사항|page|작성|양식|서약|동의서|별지|제\d+호/.test(label)) {
            fields.push({ id: label.replace(/[\s/]/g, "_"), label, hint: findHintForLabel(label) });
          }
        }
        // "○ 아이디어를 개발하게 된 배경..." — 서술 가이드 추출 (hint에 활용)
      }

      // 2단계: 패턴으로 못 찾았으면 키워드 매칭 폴백
      if (fields.length < 2) {
        const kwMap: [RegExp, string, string][] = [
          [/필요성/i, "필요성", "아이디어를 개발하게 된 배경, 내용 및 용도"],
          [/혁신성/i, "혁신성", "제품의 기술력, 우수성, 기존 유사 기술과 차이점"],
          [/안전성|안전문제/i, "안전성", "산업·재난현장에서 안전문제를 해결할 수 있는지"],
          [/수익성|비즈니스.*모델|BM/i, "수익성(비즈니스 모델)", "비즈니스 모델 유형, 수익모델, 마케팅 전략"],
          [/시장성/i, "시장성", "국내외 시장 현황, 수요처, 경쟁사 비교, 매출 가능성"],
          [/확장성/i, "확장성", "다수 산업분야 활용 가능 여부, 현장적용 가능성"],
          [/계획.*구체성|개발.*목표/i, "계획 구체성", "개발 목표, 기간의 타당성, 목표달성 전략"],
          [/기술개발.*역량|팀.*역량/i, "기술개발 역량(팀 역량)", "기술개발 능력, 사업화 의지 및 계획"],
          [/사업\s*개요|사업\s*소개/i, "사업 개요", "사업의 배경, 목적, 핵심 내용"],
          [/제품|서비스|솔루션/i, "제품/서비스", "제품 또는 서비스의 구체적 내용과 특징"],
          [/시장\s*분석|목표\s*시장/i, "시장 분석", "목표 시장 규모, 타겟 고객 분석"],
          [/마케팅|판매.*전략/i, "마케팅 전략", "고객 확보 방법, 채널 전략, 가격 정책"],
          [/사업화.*전략|수익.*모델/i, "사업화 전략", "수익 창출 구조, 매출 계획"],
          [/재무|자금.*계획|자금.*용도/i, "자금 계획", "필요 자금 규모, 용도별 계획"],
          [/팀|인력|조직/i, "팀 구성", "핵심 인력의 경력, 역할, 전문성"],
          [/일정|추진.*계획|로드맵/i, "추진 일정", "단계별 추진 계획, 마일스톤"],
          [/기대.*효과|성과.*지표/i, "기대 효과", "정량적/정성적 기대 성과"],
          [/특허|지식.*재산|IP/i, "지식재산권", "보유 특허, 출원 예정, 기술 보호 전략"],
        ];
        for (const [regex, label, hint] of kwMap) {
          if (regex.test(text) && !fields.find(f => f.label === label)) {
            fields.push({ id: label.replace(/[\s/()]/g, "_"), label, hint });
          }
        }
      }

      // 3단계: 아무것도 못 찾았으면 기본
      if (fields.length === 0) {
        fields.push(
          { id: "사업_개요", label: "사업 개요", hint: "사업의 배경과 목적" },
          { id: "제품_서비스", label: "제품/서비스", hint: "제품의 내용과 특징" },
          { id: "시장_분석", label: "시장 분석", hint: "시장 규모와 타겟 고객" },
          { id: "사업화_전략", label: "사업화 전략", hint: "수익 모델과 매출 계획" },
          { id: "팀_구성", label: "팀 구성", hint: "핵심 인력과 역할" },
        );
      }

      // 디버그: 추출된 텍스트와 감지된 항목 확인
      console.log("=== 추출된 텍스트 (처음 2000자) ===");
      console.log(text.substring(0, 2000));
      console.log("=== 감지된 항목 ===", fields);

      setDetectedFields(fields);
      setActiveField(fields[0]?.id || "");
      setApplyStep("fields");
    }, 1500);
  }

  // 항목명에서 힌트(작성 가이드) 자동 생성
  function findHintForLabel(label: string): string {
    const hints: Record<string, string> = {
      "필요성": "아이디어를 개발하게 된 배경, 내용 및 용도, 공모전 분야와의 관련성",
      "혁신성": "제품의 특징적인 기술력, 우수성, 기존 유사 기술과의 차이점",
      "안전성": "산업·재난현장에서 실질적으로 안전문제를 해결할 수 있는지",
      "수익성": "비즈니스 모델 유형, 향후 수익모델, 마케팅 전략",
      "시장성": "국내외 시장 현황 및 수요처, 경쟁사 분석, 매출 가능성",
      "확장성": "다수 산업분야 활용 가능 여부, 제품 구현 및 현장적용 가능성",
      "계획 구체성": "개발고도화 목표, 기간의 타당성, 목표달성을 위한 전략",
      "기술개발 역량": "기술개발 및 사업화에 대한 의지, 기술개발 능력, 기술 자립성",
    };
    for (const [key, hint] of Object.entries(hints)) {
      if (label.includes(key)) return hint;
    }
    return `${label}에 대한 구체적인 내용을 서술하세요`;
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  // PDF에서 텍스트 추출 (pdf.js — worker 비활성화로 즉시 실행)
  async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";

    const pdf = await pdfjsLib.getDocument({ data: buffer, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true } as any).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n");
  }

  async function handleFile(file: File) {
    setUploadedFileName(file.name);

    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setUploadedText(text);
        analyzeDocument(text);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
      // PDF: pdf.js로 텍스트 추출
      setApplyStep("analyzing");
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          console.log("PDF 파싱 시작...");
          const buffer = e.target?.result as ArrayBuffer;
          console.log("버퍼 크기:", buffer.byteLength);
          const text = await extractTextFromPdf(buffer);
          console.log("추출된 텍스트 길이:", text.length);
          console.log("추출된 텍스트 (처음 1000자):", text.substring(0, 1000));
          setUploadedText(text);
          analyzeDocument(text);
        } catch (err: any) {
          console.error("PDF 파싱 에러:", err);
          setUploadedText("[PDF 텍스트 추출 실패: " + (err?.message || err) + "]");
          analyzeDocument(file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("PDF 파일만 업로드 가능합니다. HWP 파일은 PDF로 변환 후 업로드해주세요.");
    }
  }

  async function generateFieldContent(fieldId: string, fieldLabel: string, fieldHint: string) {
    const prompt = `당신은 정부 지원사업 신청서 전문 컨설턴트입니다.

아래 사업 정보를 바탕으로 지원서의 "${fieldLabel}" 항목을 작성해주세요.

사업명: ${info.name || "미정"}
업종: ${info.industry || "미정"}
사업 설명: ${info.description || "미정"}
타겟 고객: ${info.target || "미정"}
자금 규모: ${info.funding || "미정"}

작성 가이드: ${fieldHint}

정부 지원사업 심사위원이 높은 점수를 줄 수 있도록, 구체적 수치와 데이터를 포함하여 전문적으로 작성해주세요.
마크다운 형식으로 소제목과 불릿포인트를 활용해주세요.`;

    try {
      const res = await fetch("/api/bizplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: fieldLabel, name: info.name, industry: info.industry, description: info.description, target: info.target, funding: info.funding }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setFieldContents(prev => ({ ...prev, [fieldId]: full }));
        }
      }
    } catch {
      setFieldContents(prev => ({ ...prev, [fieldId]: "생성 중 오류가 발생했습니다." }));
    }
  }

  async function generateAllFields() {
    setApplyStep("generating");
    setApplyGenerating(true);
    setApplyProgress(0);
    for (let i = 0; i < detectedFields.length; i++) {
      const f = detectedFields[i];
      setApplyCurrentGen(f.label);
      setActiveField(f.id);
      setApplyProgress(Math.round((i / detectedFields.length) * 100));
      await generateFieldContent(f.id, f.label, f.hint);
    }
    setApplyProgress(100);
    setApplyCurrentGen("");
    setApplyGenerating(false);
    setApplyStep("done");
    setActiveField(detectedFields[0]?.id || "");
  }

  function copyAllFields() {
    const full = detectedFields.map(f => `# ${f.label}\n\n${fieldContents[f.id] || ""}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(full);
    setCopied("allFields");
    setTimeout(() => setCopied(""), 2000);
  }

  function downloadApplyHtml() {
    const body = detectedFields.map(f => `
      <div style="page-break-inside:avoid;margin-bottom:32px;">
        <h2 style="font-size:18px;font-weight:700;color:#0071E3;margin-bottom:10px;border-bottom:2px solid #0071E3;padding-bottom:6px;">${f.label}</h2>
        <div style="font-size:13px;line-height:1.9;color:#333;">${md(fieldContents[f.id] || "")}</div>
      </div>`).join("");
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>지원서 - ${info.name || "사업"}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Noto Sans KR',sans-serif;color:#222;padding:40px;max-width:800px;margin:0 auto}
h4{font-size:15px;font-weight:700;margin:16px 0 6px;color:#333}strong{color:#222}
table{width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:12px}th{text-align:left;padding:8px 10px;font-weight:600;background:#EBF5FF;border-bottom:2px solid #0071E3;color:#333}
td{padding:7px 10px;border-bottom:1px solid #eee}ul{list-style:none;padding:0}li{padding:3px 0 3px 16px;position:relative}li::before{content:"•";position:absolute;left:0;color:#0071E3;font-weight:bold}
@media print{body{padding:20px}}</style></head><body>
<div style="text-align:center;margin-bottom:36px;padding:24px 0;border-bottom:3px solid #0071E3">
<h1 style="font-size:24px;margin-bottom:6px">지원사업 신청서</h1>
<div style="font-size:18px;font-weight:700;color:#0071E3;margin-bottom:8px">${info.name || "사업명"}</div>
<div style="font-size:13px;color:#888">${new Date().toLocaleDateString("ko-KR")}</div>
</div>${body}
<div style="text-align:center;padding:16px 0;margin-top:32px;border-top:1px solid #eee;color:#aaa;font-size:10px">일프로 AI · ilpro.ai</div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `지원서_${info.name || "사업"}.html`; a.click();
  }

  const DEMO_SAMPLES: BizInfo[] = [
    { name: "일프로 AI 플랫폼", industry: "IT/소프트웨어", description: "소상공인을 위한 올인원 AI 경영 도구. 매출관리, SNS 자동화, 홈페이지 빌더를 하나의 플랫폼에서 제공", target: "20~50대 소상공인", funding: "1억원" },
    { name: "프레시밀 키친", industry: "음식점/밀키트", description: "건강한 재료로 만든 프리미엄 밀키트 구독 서비스. 영양사가 설계한 주간 식단을 집까지 배달", target: "30~40대 맞벌이 가정", funding: "5천만원" },
    { name: "펫케어 플러스", industry: "반려동물 서비스", description: "AI 기반 반려동물 건강관리 앱. 증상 체크, 병원 예약, 사료 추천까지 한 번에", target: "20~40대 반려인", funding: "8천만원" },
    { name: "그린팩토리", industry: "제조/친환경", description: "재생 플라스틱을 활용한 친환경 포장재 제조. ESG 경영을 실천하는 기업에게 지속가능한 패키징 솔루션 제공", target: "친환경 포장이 필요한 중소기업", funding: "3억원" },
    { name: "에듀브릿지", industry: "교육/에듀테크", description: "AI 튜터가 학생 수준에 맞춰 문제를 출제하고 약점을 분석해주는 맞춤형 학습 플랫폼", target: "중·고등학생 및 학부모", funding: "2억원" },
  ];

  function startDemo() {
    const sample = DEMO_SAMPLES[Math.floor(Math.random() * DEMO_SAMPLES.length)];
    setInfo(sample);
    // 바로 생성 시작 (setTimeout으로 state 업데이트 후 실행)
    setTimeout(() => {
      setStep("generating");
      setGenerating(true);
      setProgress(0);
      (async () => {
        for (let i = 0; i < PLAN_SECTIONS.length; i++) {
          const s = PLAN_SECTIONS[i];
          setCurrentGen(s.label);
          setActiveSection(s.id);
          setProgress(Math.round((i / PLAN_SECTIONS.length) * 100));
          // generateSection uses info from closure, so we need to call API with sample directly
          try {
            const res = await fetch("/api/bizplan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ section: s.label, name: sample.name, industry: sample.industry, description: sample.description, target: sample.target, funding: sample.funding }),
            });
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let full = "";
            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                full += decoder.decode(value, { stream: true });
                setSections(prev => ({ ...prev, [s.id]: full }));
              }
            }
          } catch { /* ignore */ }
        }
        setProgress(100);
        setCurrentGen("");
        setGenerating(false);
        setStep("done");
        setActiveSection("overview");
      })();
    }, 0);
  }

  const canStart = info.name.trim() && info.industry.trim() && info.description.trim();
  const categories = ["all", ...Array.from(new Set(SUPPORT_PROGRAMS.map(p => p.category)))];
  const filteredResults = supportFilter === "all" ? supportResults : supportResults.filter(p => p.category === supportFilter);

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <style>{`
        .bp-content .bp-h3 { font-size: 15px; font-weight: 700; margin: 20px 0 8px; color: var(--text); }
        .bp-content .bp-h4 { font-size: 13px; font-weight: 700; margin: 16px 0 6px; color: var(--primary); }
        .bp-content .bp-table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 12px; }
        .bp-content .bp-table th { text-align: left; padding: 8px 10px; font-weight: 600; color: var(--text); background: var(--bg-hover); border-bottom: 2px solid var(--border); }
        .bp-content .bp-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); }
        .bp-content .bp-table tr:last-child td { border-bottom: none; }
        .bp-content .bp-table tr:hover td { background: var(--bg-hover); }
        .bp-content .bp-ul { list-style: none; padding: 0; margin: 8px 0; }
        .bp-content .bp-ul li { padding: 4px 0 4px 16px; position: relative; }
        .bp-content .bp-ul li::before { content: "•"; position: absolute; left: 0; color: var(--primary); font-weight: bold; }
        .bp-content strong { color: var(--text); }
      `}</style>
      {/* ═══ Top Tabs ═══ */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: "var(--bg-hover)" }}>
        <button onClick={() => setTab("plan")}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: tab === "plan" ? "var(--primary)" : "transparent", color: tab === "plan" ? "#fff" : "var(--text-muted)" }}>
          📄 사업계획서
        </button>
        <button onClick={() => { setTab("support"); if (!supportSearched && canStart) searchSupport(); }}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: tab === "support" ? "var(--primary)" : "transparent", color: tab === "support" ? "#fff" : "var(--text-muted)" }}>
          🔍 지원사업
        </button>
        <button onClick={() => setTab("apply")}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: tab === "apply" ? "var(--primary)" : "transparent", color: tab === "apply" ? "#fff" : "var(--text-muted)" }}>
          📎 지원서 작성
        </button>
      </div>

      {/* ═══════════════════════════ */}
      {/* ═══ 사업계획서 TAB ═══ */}
      {/* ═══════════════════════════ */}
      {tab === "plan" && (
        <>
          {/* Step 1: 기본 정보 입력 */}
          {step === "info" && (
            <div>
              <div className="mb-5">
                <h2 className="text-lg font-bold mb-1">사업계획서 작성</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>기본 정보를 입력하면 AI가 자동 생성합니다</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>사업명 *</label>
                  <input value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                    placeholder="예: 일프로 AI 플랫폼"
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>업종 *</label>
                  <input value={info.industry} onChange={e => setInfo(p => ({ ...p, industry: e.target.value }))}
                    placeholder="예: IT/소프트웨어, 음식점, 뷰티 등"
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>사업 설명 *</label>
                  <textarea value={info.description} onChange={e => setInfo(p => ({ ...p, description: e.target.value }))}
                    placeholder="어떤 문제를 해결하나요? 어떤 서비스/제품인가요?"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>타겟 고객</label>
                    <input value={info.target} onChange={e => setInfo(p => ({ ...p, target: e.target.value }))}
                      placeholder="예: 20~40대 소상공인"
                      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>자금 규모</label>
                    <input value={info.funding} onChange={e => setInfo(p => ({ ...p, funding: e.target.value }))}
                      placeholder="예: 5천만원"
                      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 mb-4">
                {PLAN_SECTIONS.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={generateAll} disabled={!canStart}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 active:scale-[0.98] transition-all"
                  style={{ background: "var(--primary)" }}>
                  AI 사업계획서 생성하기
                </button>
                {!canStart && (
                  <button onClick={startDemo}
                    className="px-5 py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-all"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                    🎲 데모
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2 & 3: 생성 중 / 완료 */}
          {(step === "generating" || step === "done") && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">{info.name}</h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{info.industry}</p>
                </div>
                <div className="flex items-center gap-2">
                  {step === "done" && (<>
                    <button onClick={downloadPdf}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                      style={{ background: "#E53935", color: "#fff" }}>
                      PDF 다운로드
                    </button>
                    <button onClick={downloadHtml}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                      style={{ background: "#0095F6", color: "#fff" }}>
                      HTML 다운로드
                    </button>
                    <button onClick={copyAll}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                      style={{ background: copied === "all" ? "var(--bg-hover)" : "var(--primary)", color: "#fff" }}>
                      {copied === "all" ? "✓ 복사됨" : "📋 복사"}
                    </button>
                  </>)}
                  <button onClick={() => { setStep("info"); setSections({}); }}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                    다시 작성
                  </button>
                </div>
              </div>

              {generating && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{currentGen} 작성 중...</span>
                    <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bg-hover)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--primary)" }} />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="shrink-0 w-[140px] space-y-1 hidden md:block">
                  {PLAN_SECTIONS.map(s => {
                    const has = !!sections[s.id];
                    const active = activeSection === s.id;
                    return (
                      <button key={s.id} onClick={() => setActiveSection(s.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-[12px]"
                        style={{
                          background: active ? "rgba(125,42,231,0.15)" : "transparent",
                          color: active ? "var(--primary)" : has ? "var(--text-secondary)" : "var(--text-muted)",
                          fontWeight: active ? 600 : 400,
                        }}>
                        <span>{s.icon}</span>
                        <span className="truncate">{s.label}</span>
                        {has && !active && <span className="ml-auto text-[9px]" style={{ color: "var(--success)" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-5 px-5 w-[calc(100%+40px)]" style={{ scrollbarWidth: "none" }}>
                  {PLAN_SECTIONS.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                      style={{ background: activeSection === s.id ? "var(--primary)" : "var(--bg-hover)", color: activeSection === s.id ? "#fff" : "var(--text-muted)" }}>
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  {PLAN_SECTIONS.filter(s => s.id === activeSection).map(s => (
                    <div key={s.id}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold flex items-center gap-2"><span>{s.icon}</span> {s.label}</h3>
                        {sections[s.id] && !generating && (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => regenerateSection(s.id)} className="text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>🔄 다시 생성</button>
                            <button onClick={() => copy(sections[s.id], s.id)} className="text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ background: copied === s.id ? "var(--bg-hover)" : "var(--primary)", color: "#fff" }}>{copied === s.id ? "✓" : "📋"}</button>
                          </div>
                        )}
                      </div>
                      {sections[s.id] ? (
                        <div className="bp-content rounded-xl p-5 text-sm leading-relaxed" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: md(sections[s.id]) }} />
                      ) : (
                        <div className="rounded-xl p-8 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                          {generating && currentGen === s.label ? (
                            <div>
                              <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ border: "2px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 0.8s linear infinite" }} />
                              <div className="text-xs" style={{ color: "var(--text-muted)" }}>작성 중...</div>
                              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                          ) : (
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>대기 중</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════ */}
      {/* ═══ 지원사업 추천 TAB ═══ */}
      {/* ═══════════════════════════ */}
      {tab === "support" && (
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-bold mb-1">지원사업 추천</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>사업 정보를 기반으로 맞춤 지원사업을 찾아드립니다</p>
          </div>

          {/* 사업 정보 요약 + 검색 */}
          <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {canStart ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{info.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{info.industry} · {info.target || "타겟 미설정"} · {info.funding || "자금 미설정"}</div>
                </div>
                <button onClick={searchSupport}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                  style={{ background: "var(--primary)", color: "#fff" }}>
                  🔍 다시 검색
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>사업 정보를 먼저 입력하세요</div>
                <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>사업계획서 탭에서 기본 정보를 입력하면 맞춤 추천이 가능합니다</div>
                <button onClick={() => setTab("plan")}
                  className="text-[11px] font-semibold px-4 py-2 rounded-lg"
                  style={{ background: "var(--primary)", color: "#fff" }}>
                  사업 정보 입력하기
                </button>
              </div>
            )}
          </div>

          {/* 검색 결과 */}
          {supportSearched && canStart && (
            <>
              {/* 카테고리 필터 */}
              <div className="flex gap-1.5 overflow-x-auto mb-4 pb-1" style={{ scrollbarWidth: "none" }}>
                {categories.map(c => (
                  <button key={c} onClick={() => setSupportFilter(c)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                    style={{
                      background: supportFilter === c ? "var(--primary)" : "var(--bg-hover)",
                      color: supportFilter === c ? "#fff" : "var(--text-muted)",
                    }}>
                    {c === "all" ? `전체 (${supportResults.length})` : `${c} (${supportResults.filter(p => p.category === c).length})`}
                  </button>
                ))}
              </div>

              {/* 결과 리스트 */}
              <div className="space-y-3">
                {filteredResults.map(program => (
                  <div key={program.id} className="rounded-xl p-4 transition-all hover:scale-[1.01]"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">{program.name}</span>
                          {program.match >= 60 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: program.match >= 80 ? "#30D158" : "#FF9500" }}>
                              {program.match >= 80 ? "추천" : "관심"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{program.org}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                          <span>💰 {program.amount}</span>
                          <span>📅 {program.deadline}</span>
                          <span>👤 {program.target}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <a href={program.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                            style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                            📄 공고 보기 ↗
                          </a>
                          <a href={program.formUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                            style={{ background: "var(--primary)", color: "#fff" }}>
                            📎 {program.formType.includes("온라인") ? "신청하기" : "양식 다운로드"} ↗
                          </a>
                          {program.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                      {/* 적합도 게이지 */}
                      <div className="shrink-0 text-center" style={{ width: 52 }}>
                        <div className="relative w-12 h-12 mx-auto">
                          <svg width="48" height="48" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--bg-hover)" strokeWidth="4" />
                            <circle cx="24" cy="24" r="20" fill="none"
                              stroke={program.match >= 70 ? "#30D158" : program.match >= 40 ? "#FF9500" : "var(--text-muted)"}
                              strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={`${program.match * 1.256} 125.6`}
                              transform="rotate(-90 24 24)" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">{program.match}%</div>
                        </div>
                        <div className="text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>적합도</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg text-center" style={{ background: "var(--bg-hover)" }}>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  실제 지원사업 정보는 K-startup, 소상공인시장진흥공단 등에서 최신 공고를 확인하세요.
                  위 데이터는 참고용 샘플입니다.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════ */}
      {/* ═══ 지원서 작성 TAB ═══ */}
      {/* ═══════════════════════════ */}
      {tab === "apply" && (
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-bold mb-1">지원서 작성</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>지원서 양식을 업로드하면 AI가 내용을 분석하고 작성해드립니다</p>
          </div>

          {/* Step 1: Upload */}
          {applyStep === "upload" && (
            <div>
              {/* Drag & Drop Zone */}
              <div onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}
                className="rounded-2xl p-10 text-center transition-all cursor-pointer hover:opacity-80"
                style={{ border: "2px dashed var(--border)", background: "var(--bg-card)" }}
                onClick={() => document.getElementById("apply-file-input")?.click()}>
                <div className="text-4xl mb-3">📄</div>
                <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>지원서 양식(PDF)을 여기에 드래그하세요</div>
                <div className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>PDF 파일만 지원 · HWP는 PDF로 변환 후 업로드</div>
                <input id="apply-file-input" type="file" className="hidden" accept=".pdf,.txt,.md" onChange={handleFileSelect} />
                <div className="inline-block px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--primary)" }}>파일 선택</div>
              </div>

              {/* Or paste text */}
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>또는 직접 붙여넣기</span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>
                <textarea value={uploadedText} onChange={e => setUploadedText(e.target.value)}
                  placeholder="지원서 양식의 항목들을 여기에 붙여넣으세요...&#10;&#10;예시:&#10;1. 사업 개요&#10;2. 제품/서비스 설명&#10;3. 시장 분석&#10;4. 사업화 전략..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
                {uploadedText.trim() && (
                  <button onClick={() => analyzeDocument(uploadedText)}
                    className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all"
                    style={{ background: "var(--primary)" }}>
                    분석하기
                  </button>
                )}
              </div>

              {/* Demo button */}
              <button onClick={() => {
                const demoText = "1. 사업 개요\n2. 문제 인식 및 해결 과제\n3. 제품/서비스 설명\n4. 차별화 전략 및 경쟁 우위\n5. 목표 시장 분석\n6. 마케팅 및 판매 전략\n7. 사업화 전략 및 수익 모델\n8. 자금 소요 및 조달 계획\n9. 팀 구성 및 역량\n10. 추진 일정 및 로드맵\n11. 기대 효과 및 성과 지표";
                setUploadedText(demoText);
                setUploadedFileName("예비창업패키지_신청서.pdf");
                analyzeDocument(demoText);
              }}
                className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
                style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                🎲 데모: 예비창업패키지 양식으로 체험
              </button>
            </div>
          )}

          {/* Step 2: Analyzing */}
          {applyStep === "analyzing" && (
            <div className="text-center py-16">
              <div className="w-10 h-10 rounded-full mx-auto mb-4" style={{ border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 0.8s linear infinite" }} />
              <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>지원서를 분석하고 있습니다...</div>
              {uploadedFileName && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{uploadedFileName}</div>}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Step 3: Fields detected — confirm & generate */}
          {applyStep === "fields" && (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">✅</span>
                  <span className="text-sm font-bold">{detectedFields.length}개 항목을 감지했습니다</span>
                </div>
                {uploadedFileName && <div className="text-xs" style={{ color: "var(--text-muted)" }}>파일: {uploadedFileName}</div>}
              </div>

              <div className="space-y-2 mb-4">
                {detectedFields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--primary)", color: "#fff" }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold">{f.label}</div>
                      <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{f.hint}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business info reminder */}
              {!canStart && (
                <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(255,159,0,0.1)", border: "1px solid rgba(255,159,0,0.2)" }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: "#FF9F00" }}>사업 정보를 입력하면 더 정확한 내용이 생성됩니다</div>
                  <button onClick={() => setTab("plan")} className="text-[11px] font-medium" style={{ color: "var(--primary)" }}>사업 정보 입력하러 가기 →</button>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setApplyStep("upload"); setUploadedText(""); setUploadedFileName(""); setDetectedFields([]); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                  다시 업로드
                </button>
                <button onClick={generateAllFields}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all"
                  style={{ background: "var(--primary)" }}>
                  전체 항목 AI 작성하기
                </button>
              </div>
            </div>
          )}

          {/* Step 4 & 5: Generating / Done */}
          {(applyStep === "generating" || applyStep === "done") && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold">{uploadedFileName || "지원서 작성"}</h3>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{detectedFields.length}개 항목</div>
                </div>
                <div className="flex items-center gap-2">
                  {applyStep === "done" && (<>
                    <button onClick={() => { const w = window.open("", "_blank"); if (w) { w.document.write((() => { const b = detectedFields.map(f => `<div style="page-break-inside:avoid;margin-bottom:32px"><h2 style="font-size:18px;font-weight:700;color:#0071E3;border-bottom:2px solid #0071E3;padding-bottom:6px">${f.label}</h2><div style="font-size:13px;line-height:1.9;color:#333">${md(fieldContents[f.id] || "")}</div></div>`).join(""); return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>지원서</title><style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Noto Sans KR',sans-serif;padding:40px;max-width:800px;margin:0 auto}h4{font-size:15px;font-weight:700;margin:16px 0 6px}table{width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:12px}th{text-align:left;padding:8px 10px;background:#EBF5FF;border-bottom:2px solid #0071E3}td{padding:7px 10px;border-bottom:1px solid #eee}ul{list-style:none;padding:0}li{padding:3px 0 3px 16px;position:relative}li::before{content:"•";position:absolute;left:0;color:#0071E3}</style></head><body><div style="text-align:center;margin-bottom:36px;padding:24px 0;border-bottom:3px solid #0071E3"><h1 style="font-size:24px;margin-bottom:6px">지원사업 신청서</h1><div style="font-size:18px;font-weight:700;color:#0071E3">${info.name || "사업명"}</div><div style="font-size:13px;color:#888;margin-top:4px">${new Date().toLocaleDateString("ko-KR")}</div></div>${b}</body></html>`; })()); w.document.close(); setTimeout(() => w.print(), 500); } }}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#E53935", color: "#fff" }}>PDF</button>
                    <button onClick={downloadApplyHtml}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#0095F6", color: "#fff" }}>HTML</button>
                    <button onClick={copyAllFields}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: copied === "allFields" ? "var(--bg-hover)" : "var(--primary)", color: "#fff" }}>
                      {copied === "allFields" ? "✓" : "📋"}</button>
                  </>)}
                  <button onClick={() => { setApplyStep("upload"); setUploadedText(""); setUploadedFileName(""); setDetectedFields([]); setFieldContents({}); }}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>새로</button>
                </div>
              </div>

              {/* Progress */}
              {applyGenerating && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{applyCurrentGen} 작성 중...</span>
                    <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{applyProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bg-hover)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${applyProgress}%`, background: "var(--primary)" }} />
                  </div>
                </div>
              )}

              {/* Field tabs + content */}
              <div className="flex gap-4">
                <div className="shrink-0 w-[160px] space-y-1 hidden md:block">
                  {detectedFields.map((f, i) => {
                    const has = !!fieldContents[f.id];
                    const active = activeField === f.id;
                    return (
                      <button key={f.id} onClick={() => setActiveField(f.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-[11px]"
                        style={{ background: active ? "rgba(0,113,227,0.15)" : "transparent", color: active ? "#0071E3" : has ? "var(--text-secondary)" : "var(--text-muted)", fontWeight: active ? 600 : 400 }}>
                        <span className="w-4 text-center text-[10px] font-bold shrink-0">{i + 1}</span>
                        <span className="truncate">{f.label}</span>
                        {has && !active && <span className="ml-auto text-[9px]" style={{ color: "var(--success)" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-5 px-5 w-[calc(100%+40px)]" style={{ scrollbarWidth: "none" }}>
                  {detectedFields.map((f, i) => (
                    <button key={f.id} onClick={() => setActiveField(f.id)}
                      className="shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-all"
                      style={{ background: activeField === f.id ? "#0071E3" : "var(--bg-hover)", color: activeField === f.id ? "#fff" : "var(--text-muted)" }}>
                      {i + 1}. {f.label.length > 6 ? f.label.slice(0, 6) + "…" : f.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  {detectedFields.filter(f => f.id === activeField).map(f => (
                    <div key={f.id}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold">{f.label}</h3>
                        {fieldContents[f.id] && !applyGenerating && (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setFieldContents(prev => ({ ...prev, [f.id]: "" })); generateFieldContent(f.id, f.label, f.hint); }}
                              className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>🔄</button>
                            <button onClick={() => copy(fieldContents[f.id], f.id)}
                              className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: copied === f.id ? "var(--bg-hover)" : "var(--primary)", color: "#fff" }}>
                              {copied === f.id ? "✓" : "📋"}</button>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] mb-3 px-1" style={{ color: "var(--text-muted)" }}>{f.hint}</div>
                      {fieldContents[f.id] ? (
                        <div className="bp-content rounded-xl p-5 text-sm leading-relaxed" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: md(fieldContents[f.id]) }} />
                      ) : (
                        <div className="rounded-xl p-8 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                          {applyGenerating && applyCurrentGen === f.label ? (
                            <div>
                              <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ border: "2px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 0.8s linear infinite" }} />
                              <div className="text-xs" style={{ color: "var(--text-muted)" }}>작성 중...</div>
                            </div>
                          ) : (
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>대기 중</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
