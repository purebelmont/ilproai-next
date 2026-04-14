"use client";

import { useState } from "react";

export default function ProposalPage() {
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const downloadPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    const el = document.getElementById("proposal-content");
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, width: 800 });
    const doc = new jsPDF("p", "mm", "a4");
    const margin = 10;
    const imgW = doc.internal.pageSize.getWidth() - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;
    const pageH = doc.internal.pageSize.getHeight() - margin * 2;
    let pos = 0;
    while (pos < imgH) {
      if (pos > 0) doc.addPage();
      doc.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", margin, margin - pos, imgW, imgH);
      pos += pageH;
    }
    doc.save("일프로AI_제안서.pdf");
  };

  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "#fff" }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,26,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/dashboard" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← 대시보드</a>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setLang(lang === "ko" ? "en" : "ko")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            {lang === "ko" ? "English" : "한국어"}
          </button>
          <button onClick={downloadPdf} style={{ background: "#7D2AE7", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            PDF 다운로드
          </button>
        </div>
      </div>

      {/* Proposal content */}
      <div id="proposal-content" style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px", fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>

        {/* ═══ Cover ═══ */}
        <div style={{ textAlign: "center", padding: "80px 0 60px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#7D2AE7", letterSpacing: 3, marginBottom: 16 }}>BUSINESS PROPOSAL</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            {lang === "ko" ? "소상공인을 위한" : "All-in-One AI Platform"}<br />
            {lang === "ko" ? "올인원 AI 경영 자동화 플랫폼" : "for Small Businesses"}
          </h1>
          <div style={{ width: 60, height: 4, background: "linear-gradient(90deg, #7D2AE7, #0071E3)", margin: "24px auto", borderRadius: 2 }} />
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>
            {lang === "ko"
              ? "매출관리, 예약, SNS 콘텐츠, 사업계획서, 정부지원사업까지 — AI가 사장님의 경영을 도와드립니다"
              : "Revenue management, reservations, SNS content, business plans, and government support — AI handles your business operations"}
          </p>
          <div style={{ marginTop: 40, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            ilpro.ai · {new Date().toLocaleDateString("ko-KR")}
          </div>
        </div>

        {/* ═══ Problem ═══ */}
        <Section title={lang === "ko" ? "문제 인식" : "The Problem"} num="01">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: "😫", title: lang === "ko" ? "분산된 도구" : "Scattered Tools", desc: lang === "ko" ? "매출은 엑셀, 예약은 전화, 고객은 수첩 — 각각 다른 도구를 사용" : "Revenue in Excel, bookings by phone, customers in notebooks — different tools for everything" },
              { icon: "📊", title: lang === "ko" ? "데이터 부재" : "No Data Insights", desc: lang === "ko" ? "월 매출이 얼마인지, 어느 요일에 손님이 많은지 파악 불가" : "Can't track monthly revenue or identify peak days" },
              { icon: "📱", title: lang === "ko" ? "SNS 마케팅 어려움" : "Marketing Struggles", desc: lang === "ko" ? "SNS 게시물 작성에 매번 1-2시간 소요, 어떻게 써야할지 모름" : "1-2 hours per SNS post, unsure what to write" },
              { icon: "📋", title: lang === "ko" ? "지원사업 정보 부족" : "Missing Opportunities", desc: lang === "ko" ? "나에게 맞는 정부 지원사업이 뭔지 모르고, 신청서 작성도 어려움" : "Unaware of matching government programs, applications are complex" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ Solution ═══ */}
        <Section title={lang === "ko" ? "솔루션: 일프로 AI" : "Solution: ilpro AI"} num="02">
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 24 }}>
            {lang === "ko"
              ? "일프로 AI는 소상공인이 필요한 모든 경영 도구를 하나의 플랫폼에서 제공합니다. 복잡한 설정 없이 가입 즉시 사용 가능하며, AI가 반복 업무를 자동화해드립니다."
              : "ilpro AI provides all essential business tools in one platform. Start immediately with no complex setup — AI automates repetitive tasks for you."}
          </p>
          <div style={{ background: "linear-gradient(135deg, rgba(125,42,231,0.15), rgba(0,113,227,0.15))", borderRadius: 16, padding: 32, border: "1px solid rgba(125,42,231,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, background: "linear-gradient(135deg, #7D2AE7, #0071E3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {lang === "ko" ? "하나의 앱으로 전부" : "Everything in One App"}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
              {lang === "ko" ? "매출 · 예약 · 고객 · SNS · 사업계획서 · 지원사업" : "Revenue · Bookings · CRM · SNS · Business Plans · Grants"}
            </div>
          </div>
        </Section>

        {/* ═══ Features ═══ */}
        <Section title={lang === "ko" ? "주요 기능" : "Key Features"} num="03">
          {/* Free Tier */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#30D158", marginBottom: 12, letterSpacing: 1 }}>
              {lang === "ko" ? "✦ 무료 기능" : "✦ FREE TIER"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { icon: "💰", name: lang === "ko" ? "매출장부" : "Revenue Ledger" },
                { icon: "📋", name: lang === "ko" ? "예약관리" : "Reservations" },
                { icon: "👤", name: lang === "ko" ? "고객관리 (CRM)" : "Customer CRM" },
                { icon: "📅", name: lang === "ko" ? "일정관리" : "Calendar" },
                { icon: "📝", name: lang === "ko" ? "메모" : "Notes" },
                { icon: "✅", name: lang === "ko" ? "할일관리" : "Todo List" },
                { icon: "📎", name: lang === "ko" ? "문서함" : "File Storage" },
                { icon: "💼", name: lang === "ko" ? "견적서 (PDF)" : "Quotes (PDF)" },
                { icon: "👥", name: lang === "ko" ? "급여관리" : "Payroll" },
                { icon: "📊", name: lang === "ko" ? "리포트 (월/년)" : "Reports (M/Y)" },
                { icon: "✨", name: lang === "ko" ? "AI 추천" : "AI Insights" },
                { icon: "📥", name: lang === "ko" ? "데이터 내보내기" : "CSV Export" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, fontSize: 12, fontWeight: 500 }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span> {f.name}
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tier */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#7D2AE7", marginBottom: 12, letterSpacing: 1 }}>
              {lang === "ko" ? "✦ PRO 기능 — AI 자동화" : "✦ PRO TIER — AI Automation"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              {[
                {
                  icon: "🌐", name: lang === "ko" ? "AI 홈페이지 빌더" : "AI Website Builder",
                  desc: lang === "ko" ? "5분 만에 내 가게 홈페이지를 AI가 자동 생성. 커스텀 도메인 지원 (가게명.ilpro.ai)" : "AI builds your business website in 5 minutes. Custom domain support.",
                },
                {
                  icon: "📸", name: lang === "ko" ? "AI SNS 콘텐츠 생성" : "AI SNS Content Generator",
                  desc: lang === "ko" ? '"갈비탕 주말 이벤트 홍보" 한 줄만 입력하면 AI가 인스타그램/블로그/페이스북 게시물을 자동 작성. 동영상(릴스) 시나리오도 자동 생성.' : 'Type one line like "BBQ weekend event" and AI creates Instagram/Blog/Facebook posts. Auto-generates Reels scripts too.',
                },
                {
                  icon: "📄", name: lang === "ko" ? "AI 사업계획서 작성" : "AI Business Plan Writer",
                  desc: lang === "ko" ? "사업 정보만 입력하면 6개 섹션(사업개요, 제품, 시장분석, 마케팅, 재무, 팀)을 AI가 전문적으로 작성. PDF/HTML 다운로드." : "Enter business info, AI writes 6 sections (overview, product, market, marketing, finance, team). PDF/HTML download.",
                },
                {
                  icon: "🔍", name: lang === "ko" ? "정부 지원사업 추천" : "Gov. Grant Finder",
                  desc: lang === "ko" ? "29개 중앙부처 지원사업 + 17개 창조경제혁신센터 프로그램 중 내 사업에 맞는 것을 적합도(%)로 추천. 공고 페이지 + 신청 페이지 바로가기." : "29 central programs + 17 regional innovation centers. AI matches by relevance (%). Direct links to application pages.",
                },
                {
                  icon: "📎", name: lang === "ko" ? "AI 지원서 작성" : "AI Application Writer",
                  desc: lang === "ko" ? "지원서 양식(PDF)을 업로드하면 AI가 항목을 분석하고, 각 항목에 맞는 내용을 자동 작성. PDF 다운로드 가능." : "Upload application form (PDF), AI analyzes fields and writes content for each. Download as PDF.",
                },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: 20, background: "rgba(125,42,231,0.08)", borderRadius: 16, border: "1px solid rgba(125,42,231,0.15)" }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ How It Works ═══ */}
        <Section title={lang === "ko" ? "이렇게 사용합니다" : "How It Works"} num="04">
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { num: "1", title: lang === "ko" ? "무료 가입" : "Free Sign Up", desc: lang === "ko" ? "이메일로 30초 만에 가입" : "Sign up in 30 seconds" },
              { num: "2", title: lang === "ko" ? "데이터 입력" : "Enter Data", desc: lang === "ko" ? "매출, 예약, 고객 정보 입력 시작" : "Start entering revenue, bookings, customers" },
              { num: "3", title: lang === "ko" ? "AI 활용" : "Use AI", desc: lang === "ko" ? "SNS 콘텐츠, 사업계획서 AI로 자동 생성" : "Auto-generate SNS content, business plans" },
              { num: "4", title: lang === "ko" ? "성장" : "Grow", desc: lang === "ko" ? "데이터 기반 의사결정으로 매출 성장" : "Data-driven decisions for revenue growth" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #7D2AE7, #0071E3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 20, fontWeight: 800 }}>{s.num}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ Pricing ═══ */}
        <Section title={lang === "ko" ? "가격 정책" : "Pricing"} num="05">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 32, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{lang === "ko" ? "무료" : "FREE"}</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>₩0</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>{lang === "ko" ? "영원히 무료" : "Forever free"}</div>
              <div style={{ textAlign: "left", fontSize: 13, lineHeight: 2.2, color: "rgba(255,255,255,0.6)" }}>
                ✓ {lang === "ko" ? "매출장부 / 예약관리" : "Revenue / Reservations"}<br />
                ✓ {lang === "ko" ? "고객관리 (CRM)" : "Customer CRM"}<br />
                ✓ {lang === "ko" ? "일정 / 메모 / 할일" : "Calendar / Notes / Todos"}<br />
                ✓ {lang === "ko" ? "견적서 (PDF)" : "Quotes (PDF)"}<br />
                ✓ {lang === "ko" ? "급여관리" : "Payroll"}<br />
                ✓ {lang === "ko" ? "리포트 (월/년)" : "Reports (M/Y)"}<br />
                ✓ {lang === "ko" ? "AI 추천" : "AI Insights"}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(125,42,231,0.2), rgba(0,113,227,0.2))", borderRadius: 20, padding: 32, border: "2px solid #7D2AE7", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#7D2AE7", padding: "4px 16px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>RECOMMENDED</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#A78BFA", marginBottom: 8 }}>PRO</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>₩29,900</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>{lang === "ko" ? "/ 월" : "/ month"}</div>
              <div style={{ textAlign: "left", fontSize: 13, lineHeight: 2.2, color: "rgba(255,255,255,0.6)" }}>
                ✓ {lang === "ko" ? "무료 기능 전부 포함" : "All free features"}<br />
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>+ AI 홈페이지 빌더</span><br />
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>+ AI SNS 콘텐츠 생성</span><br />
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>+ AI 사업계획서</span><br />
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>+ 정부 지원사업 추천</span><br />
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>+ AI 지원서 작성</span><br />
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>+ PDF/HTML 다운로드</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ Why ilpro ═══ */}
        <Section title={lang === "ko" ? "왜 일프로 AI인가?" : "Why ilpro AI?"} num="06">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { num: "10+", label: lang === "ko" ? "경영 도구를 하나로" : "Business tools in one" },
              { num: "29", label: lang === "ko" ? "정부 지원사업 추천" : "Government programs" },
              { num: "5분", label: lang === "ko" ? "AI 사업계획서 작성" : "AI business plan" },
              { num: "1줄", label: lang === "ko" ? "SNS 게시물 생성" : "SNS post generation" },
              { num: "₩0", label: lang === "ko" ? "시작 비용" : "To get started" },
              { num: "24/7", label: lang === "ko" ? "언제든지 사용 가능" : "Available anytime" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: 20, background: "rgba(255,255,255,0.04)", borderRadius: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #7D2AE7, #0071E3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ CTA ═══ */}
        <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            {lang === "ko" ? "지금 무료로 시작하세요" : "Start Free Today"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
            {lang === "ko" ? "신용카드 없이, 5초 만에 가입" : "No credit card required. Sign up in 5 seconds."}
          </p>
          <a href="/auth" style={{ display: "inline-block", background: "linear-gradient(135deg, #7D2AE7, #0071E3)", color: "#fff", padding: "14px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
            {lang === "ko" ? "무료 시작하기 →" : "Get Started Free →"}
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          ilpro.ai · contact@ilpro.ai · © 2026
        </div>
      </div>
    </div>
  );
}

function Section({ title, num, children }: { title: string; num: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#7D2AE7", opacity: 0.5 }}>{num}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>
      {children}
    </div>
  );
}
