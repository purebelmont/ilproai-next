import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-white">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6" style={{ letterSpacing: "-0.04em" }}>
        말하면 됩니다
      </h1>
      <p className="text-lg text-[var(--gray-500)] mb-10 max-w-md">
        연락처, 일정, 메모, 견적서, 매출장부, 급여까지<br />
        사장님의 모든 업무를 한곳에서.
      </p>
      <div className="flex gap-3">
        <Link
          href="/auth"
          className="px-8 py-3 bg-[var(--primary)] text-white rounded-full font-semibold text-sm"
        >
          시작하기
        </Link>
        <Link
          href="/auth"
          className="px-8 py-3 bg-[var(--gray-100)] text-[var(--gray-900)] rounded-full font-semibold text-sm"
        >
          데모 체험
        </Link>
      </div>
      <p className="text-xs text-[var(--gray-400)] mt-6">무료 · 카드 필요 없음 · 30초 가입</p>
    </div>
  );
}
