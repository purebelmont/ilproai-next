"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("demo@ilpro.ai");
  const [password, setPassword] = useState("demo1234");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("이메일 또는 비밀번호가 맞지 않습니다."); setLoading(false); return; }
    }

    router.push("/dashboard");
  }

  async function demoLogin() {
    setLoading(true);
    setError("");
    // Try login first, if fails then register
    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@ilpro.ai",
      password: "demo1234",
    });
    if (error) {
      // Register demo account
      await supabase.auth.signUp({
        email: "demo@ilpro.ai",
        password: "demo1234",
        options: { data: { name: "데모 사장님" } },
      });
      // Try login again
      await supabase.auth.signInWithPassword({
        email: "demo@ilpro.ai",
        password: "demo1234",
      });
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--gray-50)] p-5">
      <div className="bg-white rounded-2xl p-8 w-full max-w-[400px] shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold">
            일프로<span className="text-[var(--primary)]">AI</span>
          </h1>
          <p className="text-sm text-[var(--gray-500)] mt-2">
            {mode === "register" ? "무료로 시작하세요" : "다시 오신 걸 환영합니다"}
          </p>
        </div>

        {error && (
          <div className="bg-[var(--danger)] text-white text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: mode === "reset" ? "none" : "block" }}>
          {mode === "register" && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[var(--gray-700)] mb-1">이름</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="맛있는 한식당" required
                className="w-full p-3 border border-[var(--gray-300)] rounded-lg text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[var(--gray-700)] mb-1">이메일</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="ceo@example.com" required
              className="w-full p-3 border border-[var(--gray-300)] rounded-lg text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--gray-700)] mb-1">비밀번호</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상" required minLength={6}
              className="w-full p-3 border border-[var(--gray-300)] rounded-lg text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full p-3 bg-[var(--primary)] text-white rounded-full font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "..." : mode === "register" ? "무료 가입하기" : "로그인"}
          </button>
        </form>

        {mode !== "reset" && (
          <p className="text-center text-sm text-[var(--gray-500)] mt-4">
            {mode === "register" ? (
              <>이미 계정이 있으신가요? <button onClick={() => setMode("login")} className="text-[var(--primary)]">로그인</button></>
            ) : (<>
              계정이 없으신가요? <button onClick={() => setMode("register")} className="text-[var(--primary)]">무료 가입</button>
              <span className="mx-2">·</span>
              <button onClick={() => { setMode("reset"); setResetSent(false); }} className="text-[var(--gray-400)]">비밀번호 찾기</button>
            </>)}
          </p>
        )}

        {mode === "reset" && (
          <div className="mt-4">
            {resetSent ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">📧</div>
                <div className="text-sm font-semibold text-[var(--gray-700)] mb-1">이메일을 확인하세요</div>
                <div className="text-xs text-[var(--gray-500)] mb-4">비밀번호 재설정 링크를 보냈습니다</div>
                <button onClick={() => { setMode("login"); setResetSent(false); }} className="text-sm text-[var(--primary)]">로그인으로 돌아가기</button>
              </div>
            ) : (
              <div>
                <div className="text-sm text-[var(--gray-500)] mb-3">가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.</div>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소" required
                  className="w-full p-3 border border-[var(--gray-300)] rounded-lg text-sm outline-none focus:border-[var(--primary)] mb-3"
                />
                <button onClick={async () => {
                  setLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/auth" });
                  setLoading(false);
                  if (error) { setError(error.message); } else { setResetSent(true); }
                }} disabled={loading || !email}
                  className="w-full p-3 bg-[var(--primary)] text-white rounded-full font-semibold text-sm disabled:opacity-50 mb-3">
                  {loading ? "..." : "재설정 링크 보내기"}
                </button>
                <button onClick={() => setMode("login")} className="w-full text-center text-sm text-[var(--gray-400)]">← 로그인으로 돌아가기</button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[var(--gray-200)]" />
          <span className="text-xs text-[var(--gray-500)]">또는</span>
          <div className="flex-1 h-px bg-[var(--gray-200)]" />
        </div>

        <button
          onClick={demoLogin} disabled={loading}
          className="w-full p-3 bg-[var(--gray-100)] text-[var(--gray-900)] rounded-full font-semibold text-sm"
        >
          데모 계정으로 바로 로그인
        </button>
      </div>
    </div>
  );
}
