"use client";

import { useState, useEffect } from "react";
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

  // Check onboarding status and redirect accordingly
  async function redirectAfterAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single();
    if (profile?.onboarding_completed) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  }

  // Handle OAuth callback - detect session from URL hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        redirectAfterAuth();
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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
      router.push("/onboarding");
      return;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("이메일 또는 비밀번호가 맞지 않습니다."); setLoading(false); return; }
    }

    redirectAfterAuth();
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
    redirectAfterAuth();
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
                placeholder="이름" required autoComplete="off"
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
          onClick={async () => {
            setLoading(true);
            setError("");
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin + "/auth" },
            });
            if (error) { setError(error.message); setLoading(false); }
          }}
          disabled={loading}
          className="w-full p-3 bg-white border border-[var(--gray-300)] text-[var(--gray-700)] rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[var(--gray-50)] transition-colors mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google로 계속하기
        </button>

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
