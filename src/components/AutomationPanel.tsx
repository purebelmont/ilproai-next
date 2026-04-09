"use client";

import { useState } from "react";
import Link from "next/link";

interface Automation {
  id: string;
  icon: string;
  name: string;
  desc: string;
  model: string;
  cost: string;
  status: "off" | "setup" | "active";
  steps: string[];
  apiNeeded?: string;
}

const AUTOMATIONS: Automation[] = [
  {
    id: "review", icon: "⭐", name: "AI 리뷰 답글",
    desc: "네이버/구글 리뷰가 들어오면 AI가 자동으로 맞춤 답글 생성",
    model: "Qwen 7B → Claude Haiku", cost: "₩0~7/건",
    status: "off",
    steps: ["가게 정보 입력", "리뷰 플랫폼 연결", "답글 톤 설정", "자동 답글 활성화"],
  },
  {
    id: "chatbot", icon: "💬", name: "AI 챗봇",
    desc: "카카오톡으로 고객 문의가 오면 24시간 AI가 자동 응대",
    model: "Claude Haiku", cost: "₩7/건",
    status: "off",
    steps: ["가게 정보 입력", "FAQ 등록 (선택)", "카카오 채널 연결", "챗봇 활성화"],
    apiNeeded: "카카오 비즈메시지 API",
  },
  {
    id: "marketing", icon: "📣", name: "AI 마케팅",
    desc: "SNS 게시글을 AI가 자동 생성 → 인스타/블로그 동시 게시",
    model: "Claude Sonnet", cost: "₩50/건",
    status: "off",
    steps: ["가게 정보 입력", "SNS 계정 연결", "게시 주기 설정", "자동 게시 활성화"],
    apiNeeded: "Meta Graph API",
  },
  {
    id: "reminder", icon: "📢", name: "알림 자동화",
    desc: "예약 확인, 리마인더, 감사 메시지를 카카오 알림톡으로 자동 발송",
    model: "템플릿 기반", cost: "₩7/건",
    status: "off",
    steps: ["가게 정보 입력", "알림 템플릿 선택", "카카오 알림톡 연결", "자동 발송 활성화"],
    apiNeeded: "카카오 알림톡 API",
  },
  {
    id: "tax", icon: "📄", name: "세금계산서 자동화",
    desc: "견적서 확정 시 전자세금계산서 자동 발행 → 장부 자동 반영",
    model: "규칙 기반 + AI 검증", cost: "₩100/건",
    status: "off",
    steps: ["사업자 정보 입력", "팝빌 API 연결", "자동 발행 조건 설정", "활성화"],
    apiNeeded: "팝빌 API",
  },
  {
    id: "insight", icon: "💡", name: "AI 인사이트",
    desc: "매출/예약/리뷰 데이터를 분석하여 자동화 추천 및 매출 예측",
    model: "Claude Sonnet", cost: "₩50/분석",
    status: "off",
    steps: ["데이터 1개월 이상 축적", "분석 주기 설정", "알림 받기 활성화"],
  },
];

export default function AutomationPanel({ userId, plan }: { userId: string; plan: string }) {
  const isPro = plan === "pro" || plan === "team";
  const [automations, setAutomations] = useState<Automation[]>(AUTOMATIONS);
  const [selected, setSelected] = useState<Automation | null>(null);
  const [setupStep, setSetupStep] = useState(0);

  function toggleAutomation(id: string) {
    if (!isPro) return;
    setAutomations(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === "active" ? "off" : "active" } : a
    ));
  }

  function startSetup(auto: Automation) {
    setSelected(auto);
    setSetupStep(0);
  }

  function nextStep() {
    if (!selected) return;
    if (setupStep < selected.steps.length - 1) {
      setSetupStep(s => s + 1);
    } else {
      // Complete setup
      setAutomations(prev => prev.map(a =>
        a.id === selected.id ? { ...a, status: "active" } : a
      ));
      setSelected(null);
      setSetupStep(0);
    }
  }

  // Setup wizard view
  if (selected) {
    return (
      <div className="p-5">
        <button onClick={() => setSelected(null)} className="text-sm font-medium mb-4" style={{ color: "var(--primary)" }}>← 돌아가기</button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "var(--primary-light)" }}>{selected.icon}</div>
          <div>
            <h3 className="text-lg font-bold">{selected.name} 설정</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selected.desc}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {selected.steps.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i <= setupStep ? "var(--primary)" : "var(--border)" }} />
          ))}
        </div>

        {/* Current step */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-[11px] font-bold tracking-wider uppercase mb-2" style={{ color: "var(--primary)" }}>
            {setupStep + 1}단계 / {selected.steps.length}
          </div>
          <div className="text-base font-bold mb-4">{selected.steps[setupStep]}</div>

          {/* Step content */}
          {setupStep === 0 && (
            <div>
              <div className="ios-fields">
                <div className="ios-field"><label>가게 이름</label><input placeholder="맛있는한식당" /></div>
                <div className="ios-field"><label>업종</label>
                  <select><option>음식점/카페</option><option>서비스/뷰티</option><option>매장/쇼핑</option><option>사무실/B2B</option><option>병원/의원</option><option>학원/교육</option><option>기타</option></select>
                </div>
                <div className="ios-field"><label>전화번호</label><input placeholder="052-123-4567" /></div>
                <div className="ios-field"><label>주소</label><input placeholder="울산 남구 삼산동 123" /></div>
              </div>
            </div>
          )}

          {setupStep === 1 && selected.apiNeeded && (
            <div>
              <div className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-hover)" }}>
                <div className="text-sm font-semibold mb-2">필요한 API: {selected.apiNeeded}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  API 키가 없어도 괜찮아요. 나중에 연결할 수 있습니다.
                </div>
              </div>
              <div className="ios-fields">
                <div className="ios-field"><label>API 키</label><input placeholder="선택 사항 — 나중에 입력 가능" /></div>
              </div>
            </div>
          )}

          {setupStep === 1 && !selected.apiNeeded && (
            <div className="rounded-xl p-4" style={{ background: "var(--bg-hover)" }}>
              <div className="text-sm">이 단계는 자동으로 설정됩니다.</div>
            </div>
          )}

          {setupStep >= 2 && (
            <div className="rounded-xl p-4" style={{ background: "var(--bg-hover)" }}>
              <div className="text-sm font-semibold mb-2">설정 옵션</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked /> 자동 실행 활성화
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked /> 실행 결과 알림 받기
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" /> 수동 확인 후 전송 (안전 모드)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* AI 모델 정보 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: "var(--text-muted)" }}>AI 엔진 정보</div>
          <div className="flex gap-4 text-xs">
            <span>🧠 {selected.model}</span>
            <span>💰 {selected.cost}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {setupStep > 0 && (
            <button onClick={() => setSetupStep(s => s - 1)}
              className="flex-1 py-3 text-sm font-medium rounded-xl" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
              이전
            </button>
          )}
          <button onClick={nextStep}
            className="flex-1 py-3 text-sm font-semibold rounded-xl text-white" style={{ background: "var(--primary)" }}>
            {setupStep === selected.steps.length - 1 ? "활성화 완료" : "다음"}
          </button>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="p-5">
      <div className="mb-5">
        <h4 className="text-lg font-bold">AI 자동화</h4>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>하네스 시스템이 최적 AI 모델을 자동 선택하여 업무를 자동화합니다</p>
      </div>

      {/* PRO 배너 (무료 사용자) */}
      {!isPro && (
        <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">PRO</span>
            </div>
            <div className="text-white font-bold text-base mb-1">AI 자동화로 업무를 줄이세요</div>
            <div className="text-white/70 text-xs mb-3">리뷰 답글, 챗봇, 마케팅, 알림을 AI가 대신합니다</div>
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#7D2AE7]">
              PRO 시작하기 — ₩29,900/월
            </button>
          </div>
        </div>
      )}

      {/* 활성화된 자동화 요약 */}
      {automations.some(a => a.status === "active") && (
        <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-xs font-bold mb-2" style={{ color: "var(--text-muted)" }}>활성화된 자동화</div>
          <div className="flex gap-2 flex-wrap">
            {automations.filter(a => a.status === "active").map(a => (
              <span key={a.id} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                {a.icon} {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 자동화 목록 */}
      <div className="space-y-3">
        {automations.map(auto => (
          <div key={auto.id} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: auto.status === "active" ? "var(--primary-light)" : "var(--bg-hover)" }}>
                  {auto.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold">{auto.name}</span>
                    {auto.status === "active" && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#34D39920", color: "#34D399" }}>활성</span>
                    )}
                  </div>
                  <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{auto.desc}</div>
                  <div className="flex gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span>🧠 {auto.model}</span>
                    <span>💰 {auto.cost}</span>
                    {auto.apiNeeded && <span>🔗 {auto.apiNeeded}</span>}
                  </div>
                </div>
              </div>

              {/* 설정 단계 미리보기 */}
              <div className="mt-3 flex gap-1">
                {auto.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="text-[9px] px-2 py-0.5 rounded-md" style={{ background: auto.status === "active" ? "var(--primary-light)" : "var(--bg-hover)", color: auto.status === "active" ? "var(--primary)" : "var(--text-muted)" }}>
                      {step}
                    </div>
                    {i < auto.steps.length - 1 && <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>→</span>}
                  </div>
                ))}
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 mt-3">
                {auto.id === "marketing" && (
                  <Link href="/sns"
                    className="flex-1 py-2 text-xs font-semibold rounded-lg text-center text-white"
                    style={{ background: "linear-gradient(135deg, #E1306C, #833AB4, #405DE6)", textDecoration: "none" }}>
                    📣 SNS 데모 체험
                  </Link>
                )}
                {auto.status === "active" ? (
                  <>
                    <button onClick={() => startSetup(auto)}
                      className="flex-1 py-2 text-xs font-medium rounded-lg" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                      설정 변경
                    </button>
                    <button onClick={() => toggleAutomation(auto.id)}
                      className="px-4 py-2 text-xs font-medium rounded-lg text-[var(--danger)]" style={{ background: "var(--bg-hover)" }}>
                      비활성화
                    </button>
                  </>
                ) : isPro ? (
                  <button onClick={() => startSetup(auto)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg text-white" style={{ background: "var(--primary)" }}>
                    설정하기
                  </button>
                ) : (
                  <button className="flex-1 py-2 text-xs font-semibold rounded-lg text-white"
                    style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}
                    onClick={() => alert("PRO 플랜으로 업그레이드하면 AI 자동화를 사용할 수 있습니다.\n₩29,900/월")}>
                    🔒 PRO 전용
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SNS 자동화 데모 배너 */}
      <Link href="/sns" className="block rounded-2xl p-5 mt-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #E1306C, #833AB4, #405DE6)", textDecoration: "none" }}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-10" style={{ background: "white", transform: "translate(-30%, 30%)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📣</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">무료 데모</span>
          </div>
          <div className="text-white font-bold text-base mb-1">AI SNS 자동화 체험하기</div>
          <div className="text-white/70 text-xs mb-3">업종만 선택하면 인스타·블로그·페이스북 게시물을 AI가 즉시 생성합니다</div>
          <div className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#833AB4]">
            지금 체험하기 →
          </div>
        </div>
      </Link>

      {/* 하네스 시스템 링크 */}
      <a href="/harness" className="block rounded-xl p-4 mt-3 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none" }}>
        <div className="text-xs font-bold" style={{ color: "var(--primary)" }}>⚙️ AI 하네스 시스템 보기</div>
        <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>어떻게 AI가 최적 모델을 선택하는지 확인하세요</div>
      </a>
    </div>
  );
}
