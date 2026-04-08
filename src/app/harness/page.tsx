"use client";

import { useState } from "react";

const MODELS = [
  { id: "qwen", name: "Qwen 7B", icon: "🏠", desc: "단순 작업: 리뷰, FAQ", cost: "₩0/건", costClass: "text-[#60A5FA]" },
  { id: "haiku", name: "Claude Haiku", icon: "⚡", desc: "중간 작업: 챗봇, 마케팅", cost: "₩7/건", costClass: "text-[#F59E0B]" },
  { id: "sonnet", name: "Claude Sonnet", icon: "🧠", desc: "복잡 작업: 웹사이트, 분석", cost: "₩50/건", costClass: "text-[#EF4444]" },
  { id: "exaone", name: "EXAONE 7.8B", icon: "🇰🇷", desc: "한국어 특화 작업", cost: "₩0/건", costClass: "text-[#60A5FA]" },
];

const PIPELINE = [
  { icon: "📥", label: "사용자 입력", desc: "텍스트 요청" },
  { icon: "🔀", label: "작업 분류", desc: "리뷰? 웹사이트? 챗봇?" },
  { icon: "📝", label: "프롬프트 생성", desc: "템플릿 + 업종 정보" },
  { icon: "🧠", label: "AI 모델 호출", desc: "최적 모델 자동 선택" },
  { icon: "🔍", label: "출력 검증", desc: "JSON 파싱 + 스키마" },
  { icon: "✅", label: "응답 전달", desc: "구조화된 데이터" },
];

const FALLBACK_STEPS = [
  { num: "1", status: "fail", label: "Qwen 7B (로컬) 시도", result: "타임아웃", color: "#EF4444" },
  { num: "2", status: "fail", label: "Claude Haiku (API) 대체", result: "JSON 오류", color: "#EF4444" },
  { num: "3", status: "ok", label: "프롬프트 보강 후 재시도", result: "성공 ✓", color: "#34D399" },
  { num: "✓", status: "done", label: "사용자에게 정상 응답 전달", result: "200ms", color: "#60A5FA" },
];

const GUARDRAILS = [
  { label: "입력 검증", desc: "XSS, 인젝션 필터링", status: "통과" },
  { label: "사용량 제한", desc: "사용자별, 플랜별 제한", status: "정상" },
  { label: "출력 필터링", desc: "개인정보 제거, 유해성 검사", status: "안전" },
  { label: "스키마 강제", desc: "TypeScript 인터페이스 검증", status: "유효" },
];

export default function HarnessPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState({ time: "—", model: "—", cost: "—", task: "—" });
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [processing, setProcessing] = useState(-1);
  const [selectedModel, setSelectedModel] = useState("haiku");

  function runDemo() {
    if (!input.trim()) return;
    setOutput("");
    setActiveNodes([]);
    setProcessing(0);

    const isReview = input.match(/리뷰|답글|review/i);
    const isWebsite = input.match(/홈페이지|웹사이트|website/i);
    const isAnalysis = input.match(/매출|분석|analysis/i);

    const steps = [
      "📥 입력 수신 중...\n",
      "🔀 작업 유형 분류 중...\n",
      "📝 프롬프트 생성 중...\n",
      "🧠 AI 모델 호출 중...\n",
      "🔍 출력 검증 중...\n",
      "✅ 완료!\n\n",
    ];

    let step = 0;
    let text = "";

    const interval = setInterval(() => {
      if (step < steps.length) {
        text += steps[step];
        setOutput(text);
        setProcessing(step);
        setActiveNodes(Array.from({ length: step }, (_, i) => i));
        step++;
      } else {
        clearInterval(interval);
        setProcessing(-1);
        setActiveNodes([0, 1, 2, 3, 4, 5]);

        let result: any;
        if (isReview) {
          result = { task: "리뷰_답글", model: "qwen2.5:7b", reply: "안녕하세요, 소중한 리뷰 감사합니다! 맛있게 드셨다니 정말 기쁩니다. 더 좋은 서비스로 보답하겠습니다. 또 방문해주세요!", confidence: 0.92, cost: "₩0", latency_ms: 340 };
          setMeta({ time: "0.34초", model: "Qwen 7B (로컬)", cost: "₩0", task: "리뷰 답글" });
        } else if (isWebsite) {
          result = { task: "웹사이트_생성", model: "claude-sonnet", content: { hero: { title: "네일샵", subtitle: "아름다움을 완성하는 곳" }, services: ["젤네일 - 50,000원", "패디큐어 - 40,000원"] }, confidence: 0.95, cost: "₩50", latency_ms: 2100 };
          setMeta({ time: "2.1초", model: "Claude Sonnet", cost: "₩50", task: "웹사이트 생성" });
        } else if (isAnalysis) {
          result = { task: "데이터_분석", model: "claude-sonnet", insights: ["이번 달 매출 ₩12,500,000 (전월 대비 +8%)", "화요일 점심 시간대가 피크", "노쇼율 15% → 알림톡 자동화 추천"], recommendation: "Tier 2 알림 자동화 시 월 ₩200,000 절약", cost: "₩50", latency_ms: 1800 };
          setMeta({ time: "1.8초", model: "Claude Sonnet", cost: "₩50", task: "데이터 분석" });
        } else {
          result = { task: "챗봇", model: "claude-haiku", response: "안녕하세요! 무엇을 도와드릴까요?", confidence: 0.88, cost: "₩7", latency_ms: 250 };
          setMeta({ time: "0.25초", model: "Claude Haiku", cost: "₩7", task: "챗봇" });
        }
        text += "── 결과 ──\n\n" + JSON.stringify(result, null, 2);
        setOutput(text);
      }
    }, 400);
  }

  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", color: "#E2E8F0" }}>
      {/* 헤더 */}
      <div className="text-center pt-10 pb-6 px-5">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ background: "linear-gradient(135deg, #A78BFA, #60A5FA, #34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI 하네스 시스템
        </h1>
        <p className="text-[#64748B] text-sm">ilpro.ai의 AI 엔진 — 프롬프트, 라우팅, 파싱, 폴백, 서빙</p>
        <a href="/dashboard" className="inline-block mt-3 text-xs px-4 py-2 rounded-lg" style={{ background: "#1E1E2E", color: "#94A3B8" }}>← 대시보드로</a>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 pb-16">

        {/* ═══ 파이프라인 ═══ */}
        <div className="rounded-2xl p-6 mb-5" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
          <div className="text-[11px] font-bold text-[#64748B] tracking-widest uppercase mb-4">요청 파이프라인</div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-x-auto pb-2">
            {PIPELINE.map((node, i) => (
              <div key={i} className="flex md:flex-row flex-col items-center gap-3">
                <div className={`rounded-xl p-4 min-w-[130px] text-center transition-all duration-300 ${processing === i ? "ring-2 ring-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.2)]" : activeNodes.includes(i) ? "ring-2 ring-[#34D399] shadow-[0_0_20px_rgba(52,211,153,0.15)]" : ""}`}
                  style={{ background: "#1A1A2E", border: "1px solid #2D2D44" }}>
                  <div className="text-2xl mb-1">{node.icon}</div>
                  <div className="text-[11px] font-semibold text-[#94A3B8]">{node.label}</div>
                  <div className="text-[10px] text-[#475569] mt-1">{node.desc}</div>
                </div>
                {i < PIPELINE.length - 1 && <span className="text-[#334155] text-lg md:rotate-0 rotate-90">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 모듈 그리드 ═══ */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">

          {/* 프롬프트 템플릿 */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1E1E2E" }}>
              <div className="text-sm font-bold flex items-center gap-2">📝 프롬프트 템플릿</div>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "#34D39920", color: "#34D399" }}>실제 사용</span>
            </div>
            <div className="p-5">
              <div className="rounded-xl p-4 font-mono text-[11px] leading-[1.8] overflow-x-auto" style={{ background: "#0A0A0F", border: "1px solid #1E1E2E" }}>
                <div className="text-[#475569]">// 리뷰 답글 템플릿</div>
                <div className="text-[#94A3B8]">당신은 한국 소상공인 AI입니다.</div>
                <div className="text-[#94A3B8]">가게: <span className="text-[#A78BFA]">{"{{business_name}}"}</span></div>
                <div className="text-[#94A3B8]">업종: <span className="text-[#A78BFA]">{"{{business_type}}"}</span></div>
                <div className="text-[#94A3B8]">리뷰: <span className="text-[#A78BFA]">{"{{review_text}}"}</span></div>
                <div className="text-[#94A3B8]">따뜻하고 전문적인 답글을 한국어로 작성.</div>
                <div className="text-[#94A3B8]">출력: JSON <span className="text-[#A78BFA]">{`{"reply": "..."}`}</span></div>
              </div>
              <div className="text-[10px] text-[#475569] mt-3">5개 템플릿: 리뷰답글, 웹사이트생성, 견적서, 챗봇, 마케팅</div>
            </div>
          </div>

          {/* 스마트 라우터 */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1E1E2E" }}>
              <div className="text-sm font-bold flex items-center gap-2">🔀 스마트 라우터</div>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "#34D39920", color: "#34D399" }}>실제 사용</span>
            </div>
            <div className="p-5 space-y-2">
              {MODELS.map(m => (
                <button key={m.id} onClick={() => setSelectedModel(m.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${selectedModel === m.id ? "ring-1 ring-[#7D2AE7]" : ""}`}
                  style={{ background: selectedModel === m.id ? "#7D2AE710" : "#0A0A0F", border: "1px solid #1E1E2E" }}>
                  <span className="text-xl">{m.icon}</span>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold">{m.name}</div>
                    <div className="text-[10px] text-[#475569]">{m.desc}</div>
                  </div>
                  <div className={`text-[11px] font-bold ${m.costClass}`}>{m.cost}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 폴백 체인 */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1E1E2E" }}>
              <div className="text-sm font-bold flex items-center gap-2">🔄 폴백 체인</div>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "#F59E0B20", color: "#F59E0B" }}>장애 대응</span>
            </div>
            <div className="p-5 space-y-2">
              {FALLBACK_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#0A0A0F", border: "1px solid #1E1E2E" }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: s.color + "20", color: s.color }}>{s.num}</div>
                  <div className="flex-1 text-[12px]">{s.label}</div>
                  <div className="text-[10px] font-semibold" style={{ color: s.color }}>{s.result}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 가드레일 */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1E1E2E" }}>
              <div className="text-sm font-bold flex items-center gap-2">🛡️ 가드레일</div>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "#34D39920", color: "#34D399" }}>안전</span>
            </div>
            <div className="p-5 space-y-2">
              {GUARDRAILS.map((g, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#0A0A0F", border: "1px solid #1E1E2E" }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: "#34D39920", color: "#34D399" }}>✓</div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold">{g.label}</div>
                    <div className="text-[10px] text-[#475569]">{g.desc}</div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#34D399]">{g.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 비용 최적화 ═══ */}
        <div className="rounded-2xl p-6 mb-5" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
          <div className="text-sm font-bold mb-4 flex items-center gap-2">💰 비용 최적화 (월 1,000명 기준)</div>
          {[
            { label: "API만 사용", width: "100%", color: "#EF4444", amount: "₩1,000,000" },
            { label: "스마트 라우팅", width: "40%", color: "#F59E0B", amount: "₩400,000" },
            { label: "+ 로컬 모델", width: "15%", color: "#34D399", amount: "₩150,000" },
            { label: "+ 파인튜닝", width: "5%", color: "#60A5FA", amount: "₩50,000" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-4 py-2.5" style={{ borderBottom: i < 3 ? "1px solid #1E1E2E" : "none" }}>
              <div className="text-[13px] min-w-[100px]">{row.label}</div>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1E1E2E" }}>
                <div className="h-full rounded-full" style={{ width: row.width, background: row.color }} />
              </div>
              <div className="text-[13px] font-bold min-w-[90px] text-right" style={{ color: row.color }}>{row.amount}</div>
            </div>
          ))}
          <div className="text-center mt-4 text-[12px] font-bold text-[#34D399]">하네스 풀 적용 시 95% 비용 절감</div>
        </div>

        {/* ═══ 라이브 데모 ═══ */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1E1E2E" }}>
            <div className="text-base font-bold">🎮 라이브 데모</div>
            <div className="text-[11px] text-[#475569]">입력하면 파이프라인이 동작합니다</div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-5 flex flex-col" style={{ borderRight: "1px solid #1E1E2E" }}>
              <div className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase mb-2">입력</div>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                placeholder={"이렇게 입력해보세요:\n• 맛있는한식당 리뷰 답글 써줘: 갈비탕이 맛있었어요\n• 네일샵 홈페이지 만들어줘\n• 이번 달 매출 분석해줘"}
                className="flex-1 rounded-xl p-4 text-[13px] outline-none resize-none min-h-[180px]"
                style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", color: "#E2E8F0" }} />
              <div className="flex gap-2 mt-3">
                <button onClick={runDemo} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: "#7D2AE7" }}>
                  하네스 실행 →
                </button>
                <button onClick={() => { setInput(""); setOutput(""); setActiveNodes([]); setProcessing(-1); setMeta({ time: "—", model: "—", cost: "—", task: "—" }); }}
                  className="px-5 py-2.5 rounded-xl text-[13px] text-[#94A3B8]" style={{ background: "#1E1E2E" }}>
                  초기화
                </button>
              </div>
            </div>
            <div className="flex-1 p-5 flex flex-col">
              <div className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase mb-2">하네스 출력</div>
              <div className="flex-1 rounded-xl p-4 text-[13px] leading-[1.7] overflow-y-auto whitespace-pre-wrap min-h-[180px]"
                style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", color: "#94A3B8" }}>
                {output || "여기에 결과가 표시됩니다..."}
              </div>
              <div className="flex gap-4 mt-3 text-[11px] text-[#475569]">
                <span>⏱ {meta.time}</span>
                <span>🧠 {meta.model}</span>
                <span>💰 {meta.cost}</span>
                <span>📋 {meta.task}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 아키텍처 코드 ═══ */}
        <div className="rounded-2xl p-6" style={{ background: "#111118", border: "1px solid #1E1E2E" }}>
          <div className="text-base font-bold mb-4">💻 하네스 구현 코드</div>
          <div className="rounded-xl p-5 font-mono text-[11px] leading-[1.9] overflow-x-auto" style={{ background: "#0A0A0F", border: "1px solid #1E1E2E" }}>
            <div className="text-[#475569]">// AI 하네스 — ilpro.ai의 핵심 엔진</div>
            <br/>
            <div><span className="text-[#C084FC]">async function</span> <span className="text-[#60A5FA]">runHarness</span>(input: <span className="text-[#F472B6]">UserInput</span>) {"{"}</div>
            <br/>
            <div className="text-[#475569]">  // 1단계: 작업 분류</div>
            <div>  <span className="text-[#C084FC]">const</span> task = <span className="text-[#60A5FA]">classifyTask</span>(input.text);</div>
            <div className="text-[#475569]">  // → "리뷰_답글" | "웹사이트_생성" | "챗봇" | "견적서"</div>
            <br/>
            <div className="text-[#475569]">  // 2단계: 최적 모델 선택</div>
            <div>  <span className="text-[#C084FC]">const</span> model = <span className="text-[#60A5FA]">selectModel</span>(task, user.plan);</div>
            <div className="text-[#475569]">  // → 무료: Qwen 로컬 / 프로: Claude Haiku/Sonnet</div>
            <br/>
            <div className="text-[#475569]">  // 3단계: 프롬프트 생성</div>
            <div>  <span className="text-[#C084FC]">const</span> prompt = <span className="text-[#60A5FA]">buildPrompt</span>(task, {"{"}</div>
            <div>    business: input.businessInfo,</div>
            <div>    context: input.text,</div>
            <div>    outputFormat: <span className="text-[#34D399]">"json"</span>,</div>
            <div>  {"}"});</div>
            <br/>
            <div className="text-[#475569]">  // 4단계: 폴백 체인으로 호출</div>
            <div>  <span className="text-[#C084FC]">for</span> (<span className="text-[#C084FC]">const</span> attempt <span className="text-[#C084FC]">of</span> fallbackChain) {"{"}</div>
            <div>    <span className="text-[#C084FC]">try</span> {"{"}</div>
            <div>      <span className="text-[#C084FC]">const</span> raw = <span className="text-[#C084FC]">await</span> <span className="text-[#60A5FA]">callModel</span>(attempt, prompt);</div>
            <br/>
            <div className="text-[#475569]">      // 5단계: 출력 검증</div>
            <div>      <span className="text-[#C084FC]">const</span> parsed = <span className="text-[#60A5FA]">parseOutput</span>(raw, task.schema);</div>
            <br/>
            <div className="text-[#475569]">      // 6단계: 안전 검사</div>
            <div>      <span className="text-[#60A5FA]">checkGuardrails</span>(parsed.data);</div>
            <br/>
            <div className="text-[#475569]">      // 7단계: 사용량 기록</div>
            <div>      <span className="text-[#60A5FA]">logUsage</span>({"{"} model, cost, latency {"}"});</div>
            <br/>
            <div>      <span className="text-[#C084FC]">return</span> parsed.data;</div>
            <div>    {"}"} <span className="text-[#C084FC]">catch</span> (e) {"{"}</div>
            <div>      <span className="text-[#C084FC]">continue</span>; <span className="text-[#475569]">// 다음 모델로 폴백</span></div>
            <div>    {"}"}</div>
            <div>  {"}"}</div>
            <div>{"}"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
