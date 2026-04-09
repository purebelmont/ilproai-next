import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 30%, #1b2838 60%, #0a0a1a 100%)" }}>

      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, #0071E3 0%, transparent 70%)", animation: "float1 8s ease-in-out infinite" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #5856D6 0%, transparent 70%)", animation: "float2 10s ease-in-out infinite" }} />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full opacity-15 blur-[100px]"
        style={{ background: "radial-gradient(circle, #30D158 0%, transparent 70%)", animation: "float3 12s ease-in-out infinite" }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Top navigation bar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>일</div>
          <span className="text-sm font-bold text-white/80">일프로AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors" style={{ textDecoration: "none" }}>
            블로그
          </Link>
          <Link href="/auth"
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>
            로그인
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-sm font-bold tracking-widest text-white/40 uppercase">ilpro.ai</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white"
          style={{ letterSpacing: "-0.04em", lineHeight: 1.1 }}>
          사장님 업무를<br />
          <span className="bg-gradient-to-r from-[#0071E3] via-[#5856D6] to-[#30D158] bg-clip-text text-transparent">
            줄여드립니다
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
          연락처, 일정, 메모, 견적서, 매출장부, 급여까지<br />
          사장님의 모든 업무를 AI가 한곳에서 처리합니다.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 w-full max-w-sm mx-auto sm:max-w-none">
          <Link href="/auth"
            className="px-8 py-4 rounded-full font-semibold text-base text-white transition-all hover:scale-105 active:scale-95 text-center"
            style={{ background: "linear-gradient(135deg, #0071E3 0%, #5856D6 100%)", boxShadow: "0 0 30px rgba(0,113,227,0.4)" }}>
            무료로 시작하기
          </Link>
          <Link href="/auth"
            className="px-8 py-4 rounded-full font-semibold text-base text-white/80 border border-white/20 hover:border-white/40 transition-all hover:scale-105 active:scale-95 text-center"
            style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
            데모 체험
          </Link>
        </div>

        <p className="text-xs text-white/30">무료 · 카드 필요 없음 · 30초 가입</p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-12 max-w-lg mx-auto">
          {["👤 연락처", "📅 캘린더", "📋 예약", "📝 메모", "✅ 할일", "💰 매출장부", "💼 견적서", "👥 급여", "📊 리포트"].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs text-white/50 border border-white/10"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(transparent, rgba(10,10,26,0.8))" }} />

      <style>{`
        @keyframes float1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -40px) scale(1.1); } }
        @keyframes float2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-40px, 30px) scale(1.15); } }
        @keyframes float3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, 20px) scale(0.9); } }
      `}</style>
    </div>
  );
}
