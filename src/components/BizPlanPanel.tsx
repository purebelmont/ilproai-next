"use client";

import { useState, useRef } from "react";

const SECTIONS = [
  { id: "overview", label: "사업 개요", icon: "📋", prompt: "사업 개요를 작성해주세요. 사업의 비전, 미션, 핵심 가치를 포함하세요." },
  { id: "product", label: "제품/서비스", icon: "🛍️", prompt: "제품 또는 서비스 설명을 작성해주세요. 차별점과 경쟁력을 강조하세요." },
  { id: "market", label: "시장 분석", icon: "📊", prompt: "목표 시장, 시장 규모, 타겟 고객, 경쟁사 분석을 작성해주세요." },
  { id: "marketing", label: "마케팅 전략", icon: "📣", prompt: "마케팅 및 영업 전략을 작성해주세요. 고객 확보 방법, 채널, 가격 전략을 포함하세요." },
  { id: "finance", label: "재무 계획", icon: "💰", prompt: "매출 예측, 비용 구조, 손익분기점, 자금 조달 계획을 작성해주세요." },
  { id: "team", label: "팀 구성", icon: "👥", prompt: "팀 구성원, 역할, 핵심 역량을 작성해주세요." },
];

interface BizInfo {
  name: string;
  industry: string;
  description: string;
  target: string;
  funding: string;
}

export default function BizPlanPanel({ userId }: { userId: string }) {
  const [step, setStep] = useState<"info" | "generating" | "done">("info");
  const [info, setInfo] = useState<BizInfo>({ name: "", industry: "", description: "", target: "", funding: "" });
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const [generating, setGenerating] = useState(false);
  const [currentGen, setCurrentGen] = useState("");
  const [copied, setCopied] = useState("");
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const copyAll = () => {
    const full = SECTIONS.map(s => `# ${s.label}\n\n${sections[s.id] || ""}`).join("\n\n---\n\n");
    const header = `# 사업계획서: ${info.name}\n\n업종: ${info.industry}\n\n---\n\n`;
    navigator.clipboard.writeText(header + full);
    setCopied("all");
    setTimeout(() => setCopied(""), 2000);
  };

  async function generateSection(sectionId: string, sectionPrompt: string, sectionLabel: string): Promise<string> {
    const fullPrompt = `당신은 전문 사업계획서 컨설턴트입니다. 아래 사업 정보를 바탕으로 "${sectionLabel}" 섹션을 작성해주세요.

사업명: ${info.name}
업종: ${info.industry}
사업 설명: ${info.description}
타겟 고객: ${info.target}
자금 규모: ${info.funding}

요청: ${sectionPrompt}

전문적이면서도 읽기 쉽게, 구체적인 수치와 예시를 포함하여 작성해주세요. 마크다운 형식으로 소제목, 불릿포인트를 활용해주세요.`;

    try {
      const res = await fetch("/api/sns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
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

    for (let i = 0; i < SECTIONS.length; i++) {
      const s = SECTIONS[i];
      setCurrentGen(s.label);
      setActiveSection(s.id);
      setProgress(Math.round(((i) / SECTIONS.length) * 100));
      await generateSection(s.id, s.prompt, s.label);
    }

    setProgress(100);
    setCurrentGen("");
    setGenerating(false);
    setStep("done");
    setActiveSection("overview");
  }

  async function regenerateSection(sectionId: string) {
    const s = SECTIONS.find(x => x.id === sectionId);
    if (!s) return;
    setGenerating(true);
    setCurrentGen(s.label);
    await generateSection(s.id, s.prompt, s.label);
    setCurrentGen("");
    setGenerating(false);
  }

  const canStart = info.name.trim() && info.industry.trim() && info.description.trim();

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {/* ═══ Step 1: 기본 정보 입력 ═══ */}
      {step === "info" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">사업계획서 작성</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>기본 정보를 입력하면 AI가 사업계획서를 자동 생성합니다</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>사업명 *</label>
              <input value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                placeholder="예: 일프로 AI 플랫폼"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>업종 *</label>
              <input value={info.industry} onChange={e => setInfo(p => ({ ...p, industry: e.target.value }))}
                placeholder="예: IT/소프트웨어, 음식점, 뷰티 등"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>사업 설명 *</label>
              <textarea value={info.description} onChange={e => setInfo(p => ({ ...p, description: e.target.value }))}
                placeholder="어떤 문제를 해결하나요? 어떤 서비스/제품인가요? 2~3줄로 설명해주세요."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>타겟 고객</label>
                <input value={info.target} onChange={e => setInfo(p => ({ ...p, target: e.target.value }))}
                  placeholder="예: 20~40대 소상공인"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--text-secondary)" }}>자금 규모</label>
                <input value={info.funding} onChange={e => setInfo(p => ({ ...p, funding: e.target.value }))}
                  placeholder="예: 5천만원, 1억원"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }} />
              </div>
            </div>
          </div>

          {/* 미리보기: 생성될 섹션 */}
          <div className="mt-6 mb-4">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>생성될 섹션</div>
            <div className="grid grid-cols-3 gap-2">
              {SECTIONS.map(s => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <span className="text-base">{s.icon}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={generateAll} disabled={!canStart}
            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 active:scale-[0.98] transition-all mt-2"
            style={{ background: "var(--primary)" }}>
            AI 사업계획서 생성하기
          </button>
        </div>
      )}

      {/* ═══ Step 2 & 3: 생성 중 / 완료 ═══ */}
      {(step === "generating" || step === "done") && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">{info.name}</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{info.industry}</p>
            </div>
            <div className="flex items-center gap-2">
              {step === "done" && (
                <button onClick={copyAll}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                  style={{ background: copied === "all" ? "var(--bg-hover)" : "var(--primary)", color: "#fff" }}>
                  {copied === "all" ? "✓ 복사됨" : "📋 전체 복사"}
                </button>
              )}
              <button onClick={() => { setStep("info"); setSections({}); }}
                className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
                style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                다시 작성
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {generating && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  {currentGen} 작성 중...
                </span>
                <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bg-hover)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--primary)" }} />
              </div>
            </div>
          )}

          {/* Section tabs + content */}
          <div className="flex gap-4">
            {/* Left: section nav */}
            <div className="shrink-0 w-[140px] space-y-1 hidden md:block">
              {SECTIONS.map(s => {
                const hasContent = !!sections[s.id];
                const isActive = activeSection === s.id;
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-[12px]"
                    style={{
                      background: isActive ? "rgba(var(--primary-rgb, 125,42,231), 0.15)" : "transparent",
                      color: isActive ? "var(--primary)" : hasContent ? "var(--text-secondary)" : "var(--text-muted)",
                      fontWeight: isActive ? 600 : 400,
                    }}>
                    <span>{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                    {hasContent && !isActive && <span className="ml-auto text-[9px]" style={{ color: "var(--success)" }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Mobile: horizontal tabs */}
            <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-5 px-5 w-[calc(100%+40px)]" style={{ scrollbarWidth: "none" }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: activeSection === s.id ? "var(--primary)" : "var(--bg-hover)",
                    color: activeSection === s.id ? "#fff" : "var(--text-muted)",
                  }}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* Right: content */}
            <div className="flex-1 min-w-0">
              {SECTIONS.filter(s => s.id === activeSection).map(s => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <span>{s.icon}</span> {s.label}
                    </h3>
                    {sections[s.id] && !generating && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => regenerateSection(s.id)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                          style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                          🔄 다시 생성
                        </button>
                        <button onClick={() => copy(sections[s.id], s.id)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                          style={{ background: copied === s.id ? "var(--bg-hover)" : "var(--primary)", color: "#fff" }}>
                          {copied === s.id ? "✓" : "📋"}
                        </button>
                      </div>
                    )}
                  </div>

                  {sections[s.id] ? (
                    <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                      {sections[s.id]}
                    </div>
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
    </div>
  );
}
