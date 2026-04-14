"use client";

export default function RecruitPage() {
  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "#fff", fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)", padding: "60px 24px 50px", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>울산 소상공인 · 중소기업 대상</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, marginBottom: 12, maxWidth: 600, margin: "0 auto 12px" }}>
          AI 경영 플랫폼<br />무료 테스트 참여자 모집
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 24 }}>
          PRO 전체 기능 3개월 무료 · 선착순 50개 업체
        </p>
        <a href="/auth" style={{ display: "inline-block", background: "#fff", color: "#7D2AE7", padding: "14px 36px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
          지금 무료 참여하기 →
        </a>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* 모집 개요 */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 32, margin: "40px 0", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>📋 모집 개요</h2>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "12px 16px", fontSize: 14, lineHeight: 1.8 }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>대상</span>
            <span>울산광역시 소재 소상공인 및 중소기업</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>기간</span>
            <span>2026년 4월 ~ 6월 <span style={{ color: "#30D158", fontWeight: 600 }}>(3개월 무료)</span></span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>내용</span>
            <span>일프로 AI 전체 기능 무료 사용 (PRO 포함, 월 ₩29,900 상당)</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>모집 인원</span>
            <span><strong style={{ color: "#FF9500" }}>선착순 50개 업체</strong></span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>비용</span>
            <span><strong style={{ color: "#30D158" }}>완전 무료</strong> (신용카드 불필요)</span>
          </div>
        </div>

        {/* 일프로 AI란? */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, marginTop: 48 }}>일프로 AI란?</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 24 }}>
          소상공인이 필요한 모든 경영 도구를 하나의 앱에서 제공합니다.<br />
          매출관리부터 AI SNS 콘텐츠 생성, 사업계획서 작성, 정부 지원사업 매칭까지 — 복잡한 것은 AI가 대신합니다.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: "💰", title: "매출·예약·고객 관리", desc: "엑셀 대신, 한 곳에서 매출/지출/예약/고객 관리" },
            { icon: "📸", title: "AI SNS 콘텐츠 생성", desc: "\"갈비탕 주말 이벤트\" 한 줄이면 AI가 게시물 작성" },
            { icon: "📄", title: "AI 사업계획서", desc: "사업 정보만 입력하면 6개 섹션 자동 생성" },
            { icon: "🔍", title: "정부 지원사업 매칭", desc: "29개 지원사업 + 17개 혁신센터 중 내 사업에 맞는 것 추천" },
            { icon: "🌐", title: "AI 홈페이지 빌더", desc: "5분 만에 내 가게 홈페이지 자동 생성" },
            { icon: "📎", title: "AI 지원서 작성", desc: "지원서 PDF 업로드 → AI가 항목별 내용 자동 작성" },
          ].map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* 무료 테스트 혜택 */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, marginTop: 48 }}>🎁 무료 테스트 혜택</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: "💎", title: "PRO 전체 기능 3개월 무료", desc: "₩89,700 상당의 PRO 기능을 무료로 사용" },
            { icon: "🤝", title: "1:1 온보딩 지원", desc: "담당자가 직접 사용법 안내 및 데이터 입력 도움" },
            { icon: "🛠️", title: "맞춤 기능 개선", desc: "피드백을 반영하여 우리 업종에 맞게 기능 개선" },
            { icon: "🏷️", title: "정식 출시 시 50% 할인", desc: "테스트 참여자 한정, 평생 50% 할인 혜택" },
          ].map((b, i) => (
            <div key={i} style={{ background: "linear-gradient(135deg, rgba(125,42,231,0.1), rgba(0,113,227,0.1))", borderRadius: 14, padding: 20, border: "1px solid rgba(125,42,231,0.2)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </div>

        {/* 참여 조건 */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, marginTop: 48 }}>✅ 참여 조건</h2>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)", fontSize: 14, lineHeight: 2.2 }}>
          <div>✓ 울산광역시 소재 사업자등록증 보유</div>
          <div>✓ 월 1회 이상 간단한 피드백 제공 (5분 설문)</div>
          <div>✓ 업종 무관 — 음식점, 뷰티, 교육, 제조, 서비스 등 모든 업종 환영</div>
          <div>✓ PC 또는 모바일에서 인터넷 사용 가능</div>
        </div>

        {/* 이런 분들에게 추천 */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, marginTop: 48 }}>💡 이런 사장님께 추천합니다</h2>
        <div style={{ fontSize: 14, lineHeight: 2.2, color: "rgba(255,255,255,0.7)" }}>
          <div>😫 매출을 엑셀로 정리하는데 매번 시간이 걸리시는 분</div>
          <div>📱 SNS에 뭘 올려야 할지 매번 고민이신 분</div>
          <div>📋 정부 지원사업에 관심은 있지만 어디서 찾아야 할지 모르시는 분</div>
          <div>🌐 가게 홈페이지가 없어서 아쉬우신 분</div>
          <div>📄 사업계획서 작성이 막막하신 분</div>
          <div>💼 직원 급여 관리를 체계적으로 하고 싶으신 분</div>
        </div>

        {/* 참여 방법 */}
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, marginTop: 48 }}>📌 참여 방법</h2>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { num: "1", title: "ilpro.ai 접속", desc: "PC 또는 모바일 브라우저" },
            { num: "2", title: "무료 가입", desc: "이메일로 30초 만에 완료" },
            { num: "3", title: "바로 사용 시작", desc: "PRO 기능 즉시 활성화" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #7D2AE7, #0071E3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 18, fontWeight: 800 }}>{s.num}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* 왜 참여해야 하나? */}
        <div style={{ background: "linear-gradient(135deg, rgba(125,42,231,0.15), rgba(0,113,227,0.15))", borderRadius: 20, padding: 32, margin: "48px 0", border: "1px solid rgba(125,42,231,0.2)", textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>왜 지금 참여해야 할까요?</h2>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 2 }}>
            현재 일프로 AI는 <strong style={{ color: "#FF9500" }}>테스트 기간</strong>입니다.<br />
            정식 출시 전, 실제 사장님들의 목소리를 반영하여<br />
            <strong style={{ color: "#A78BFA" }}>진짜 필요한 기능</strong>을 만들고 싶습니다.<br /><br />
            지금 참여하시면 무료로 모든 기능을 사용하시면서<br />
            "이런 기능이 있으면 좋겠다"는 의견을 주시면<br />
            <strong style={{ color: "#30D158" }}>우선적으로 반영</strong>해드립니다.
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
          <a href="/auth" style={{ display: "inline-block", background: "linear-gradient(135deg, #7D2AE7, #0071E3)", color: "#fff", padding: "16px 48px", borderRadius: 14, fontSize: 17, fontWeight: 700, textDecoration: "none" }}>
            무료 참여 신청하기 →
          </a>
          <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            신용카드 불필요 · 가입 즉시 사용 가능
          </div>
        </div>

        {/* 문의 */}
        <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          문의: contact@ilpro.ai · ilpro.ai<br />
          (재)울산창조경제혁신센터 연계 · © 2026 일프로 AI
        </div>
      </div>
    </div>
  );
}
