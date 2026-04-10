"use client";

import Link from "next/link";
import { useState } from "react";

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  icon: string;
  readTime: string;
  date: string;
  tags: string[];
  image: string;
  content: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ai-review-reply",
    category: "리뷰",
    title: "리뷰 답글, 이제 AI가 대신 써줘요",
    subtitle: "손님이 남긴 리뷰에 맞춤 답글을 AI가 자동으로 만들어줍니다.",
    icon: "⭐",
    readTime: "3분",
    date: "2026-04-01",
    tags: ["리뷰", "자동화", "네이버"],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    content: `## 리뷰 답글 쓸 시간이 없으시죠?

하루 종일 장사하고 나면 녹초가 됩니다. 그런데 네이버에 리뷰가 쌓여 있어요. 답글을 달고 싶지만 시간이 없어서 매일 미루게 됩니다.

답글 없는 리뷰가 쌓이면 새 손님은 "여기 관리 안 하나?" 하고 다른 곳을 찾아갑니다.

### AI가 대신 써줍니다

리뷰가 들어오면 AI가 알맞은 답글을 만들어줘요. 칭찬에는 감사 인사를, 불만에는 정중한 사과를 담아서요. 사장님은 한번 읽어보고 보내기만 누르면 됩니다.

- 답글 쓰는 시간이 **하루 1시간에서 5분**으로 줄었어요
- 모든 리뷰에 답글이 달리니 새 손님도 안심하고 방문해요
- 단골이 눈에 띄게 늘었어요

### 비용은 거의 안 들어요

한 건에 몇 원이면 됩니다. 한 달에 커피 한 잔 값도 안 돼요.`,
  },
  {
    slug: "sns-auto-marketing",
    category: "마케팅",
    title: "SNS 게시물, AI가 한번에 만들어줘요",
    subtitle: "업종만 고르면 인스타, 블로그, 페이스북 글이 한꺼번에 나와요.",
    icon: "📣",
    readTime: "3분",
    date: "2026-04-02",
    tags: ["SNS", "마케팅", "인스타그램"],
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    content: `## "인스타에 뭘 올리지?" 매일 고민되시죠?

사진은 찍었는데 글을 뭐라고 써야 할지 모르겠고, 해시태그는 뭘 달아야 할지 모르겠고. 결국 "내일 올려야지" 하다가 일주일이 지나버려요.

### 업종만 고르면 끝이에요

"음식점"을 선택하면 AI가 바로 만들어줘요. 인스타 글, 블로그 글, 페이스북 글까지 한 번에. 해시태그도 자동으로 달아줘요.

읽어보면 "이거 내가 직접 쓴 것 같은데?" 싶을 정도로 자연스러워요. 마음에 안 드는 부분만 살짝 고치면 바로 올릴 수 있어요.

### 무료로 체험해보세요

회원가입만 하면 바로 써볼 수 있어요. 사진 한 장 들고 시도해보세요!`,
  },
  {
    slug: "reservation-management",
    category: "예약",
    title: "수첩 대신 폰으로 예약 관리하세요",
    subtitle: "예약을 한곳에 정리하고, 노쇼도 줄일 수 있어요.",
    icon: "📋",
    readTime: "3분",
    date: "2026-04-03",
    tags: ["예약", "운영", "노쇼방지"],
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    content: `## "6시 예약이 4명이었나, 6명이었나..."

전화로 받은 예약은 수첩에, 카톡으로 받은 예약은 어디에 적었는지 기억도 안 나고. 손님이 오면 "예약하셨나요?" 물어보면서 식은땀을 흘리게 됩니다.

### 폰 하나면 예약이 한눈에 보여요

예약을 입력하면 캘린더에 깔끔하게 정리돼요. 오늘 예약이 몇 건인지, 몇 명이 오는지 한눈에 보입니다.

- 날짜별, 시간별로 예약이 정리돼요
- 단골 손님인지 바로 알 수 있어요
- 예약 전날 손님에게 자동으로 알림이 가요

### 노쇼가 확 줄어요

예약 전날 카카오톡으로 "내일 예약 잊지 마세요!" 메시지가 자동으로 나가요. 이것만으로 노쇼가 40%나 줄었어요.

### 무료로 쓸 수 있어요

예약 관리는 무료예요. 오늘부터 수첩은 서랍에 넣어두세요.`,
  },
  {
    slug: "revenue-analytics",
    category: "매출",
    title: "이번 달 얼마 벌었는지 바로 알 수 있어요",
    subtitle: "매출을 기록하면 AI가 알아서 분석해줍니다.",
    icon: "📊",
    readTime: "3분",
    date: "2026-04-04",
    tags: ["매출", "분석", "리포트"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    content: `## 한 달이 끝나야 "아, 적자였구나" 알게 되시죠?

카드 매출은 이쪽 통장, 현금은 저쪽, 식자재비는 또 다른 곳... 정확히 얼마 남았는지 모르고 지내다가 세무사한테 서류 넘기고 나서야 알게 돼요.

### 매출만 적으면 나머지는 AI가 해줘요

점심 끝나고 매출 입력, 저녁 끝나고 매출 입력. 이게 전부예요.

- 이번 달 얼마 벌었는지 바로 보여줘요
- 어느 요일이 잘 되는지 알려줘요
- "화요일 매출이 계속 낮으니 이벤트 해보세요" 같은 조언도 해줘요

### 세무사한테 보내기도 쉬워요

리포트를 바로 뽑아서 카톡으로 보내면 됩니다. 밤새 서류 정리할 필요 없어요.`,
  },
  {
    slug: "quote-automation",
    category: "견적",
    title: "견적서, 2분이면 만들 수 있어요",
    subtitle: "품목과 가격만 넣으면 깔끔한 견적서가 바로 나와요.",
    icon: "💼",
    readTime: "3분",
    date: "2026-04-05",
    tags: ["견적서", "PDF", "영업"],
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    content: `## 견적서 하나 만드는데 30분씩 걸리시죠?

거래처에서 "견적서 보내주세요" 하면 엑셀 열어서 품목 쓰고, 부가세 계산하고, PDF로 바꾸고... 한참 걸려요.

### 품목이랑 가격만 넣으면 끝이에요

부가세는 자동으로 계산돼요. 합계도 자동. PDF 파일도 버튼 한 번이면 만들어져요. 거래처에 바로 보낼 수 있어요.

### 지난번 견적서 다시 쓰기도 쉬워요

같은 거래처에 비슷한 견적을 보내야 할 때, 이전 걸 복사해서 가격만 바꾸면 돼요.

### 무료예요

견적서 기능은 무료로 쓸 수 있어요.`,
  },
  {
    slug: "ai-chatbot",
    category: "고객응대",
    title: "밤에 오는 문의도 AI가 답해줘요",
    subtitle: "카카오톡 AI 챗봇이 24시간 고객 문의를 자동으로 처리합니다.",
    icon: "💬",
    readTime: "3분",
    date: "2026-04-06",
    tags: ["챗봇", "카카오톡", "고객응대"],
    image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80",
    content: `## 카톡 답장 못 해서 손님을 놓치신 적 있으시죠?

밤 10시에 "내일 예약 되나요?" 카톡이 왔는데, 이미 퇴근해서 못 봤어요. 다음 날 답장했지만 그 손님은 이미 다른 데를 예약했어요.

### AI가 5초 안에 답해줘요

"영업시간이 몇 시예요?", "주차 되나요?", "예약할게요" — 이런 자주 묻는 질문은 AI가 바로 답해줘요. 사장님은 편하게 쉬시면 돼요.

아침에 일어나서 "어젯밤에 예약 3건 들어왔네" 확인만 하면 됩니다.

### 어려운 질문은 사장님한테 넘겨줘요

"특별 메뉴 가능한가요?" 같이 AI가 모르는 건 사장님한테 알림을 보내요. AI가 할 수 있는 건 AI가, 사람이 해야 할 건 사람이.

### 비용은 얼마나 들까요?

문의 하나에 7원. 하루 20건이면 한 달에 4,200원이에요. 이 돈으로 놓칠 뻔한 손님을 잡을 수 있어요.`,
  },
  {
    slug: "website-builder",
    category: "홈페이지",
    title: "내 가게 홈페이지, 5분이면 만들어져요",
    subtitle: "가게 정보만 알려주면 AI가 멋진 홈페이지를 만들어줍니다.",
    icon: "🌐",
    readTime: "3분",
    date: "2026-04-07",
    tags: ["홈페이지", "AI", "웹사이트"],
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
    content: `## "홈페이지 만들려면 몇백만원 들잖아요"

웹 업체에 물어보니 300만원. 너무 비싸서 포기하셨죠?

그런데 요즘 손님들은 네이버만 보는 게 아니에요. 구글에서 검색하고, 인스타에서 찾아요. 내 가게 홈페이지가 있으면 이런 손님들도 만날 수 있어요.

### 가게 이름만 알려주세요

일프로AI에서 가게 이름, 업종, 간단한 소개만 입력하면 AI가 홈페이지를 뚝딱 만들어줘요. 핸드폰에서도 예쁘게 보이고, 주소도 생겨요.

### 내 마음대로 고칠 수 있어요

색깔 바꾸고, 메뉴 추가하고. 전문 지식 없어도 돼요. 몇 번 터치하면 원하는 대로 바뀌어요.

### 따로 돈 낼 거 없어요

홈페이지 주소, 관리 비용 전부 포함이에요. 추가로 낼 건 없습니다.`,
  },
  {
    slug: "payroll-management",
    category: "급여",
    title: "직원 급여 계산, 이제 고민 끝",
    subtitle: "시급, 주휴수당, 세금 공제까지 자동으로 계산해줘요.",
    icon: "👥",
    readTime: "3분",
    date: "2026-04-08",
    tags: ["급여", "인사관리", "파트타임"],
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
    content: `## 매달 급여일만 되면 머리 아프시죠?

정규직은 야근수당 붙여야 하고, 파트타임은 시급이 다 다르고, 주휴수당은 매번 헷갈리고. 엑셀로 한 시간 넘게 씨름해도 "이거 맞나?" 불안해요.

### 직원 한 번만 등록하면 돼요

이름, 시급(또는 월급)만 넣어두면 매달 자동으로 계산해줘요.

- 시급 곱하기 일한 시간 = 자동 계산
- 주휴수당도 알아서 붙여줘요
- 세금 공제도 자동이에요

### 급여 명세서도 보내줘요

직원한테 "이번 달 얼마예요?" 물어볼 필요 없어요. 급여 명세서를 카톡으로 보내줍니다.

### 무료로 쓸 수 있어요!`,
  },
  {
    slug: "crm-contact-management",
    category: "고객관리",
    title: "단골 손님을 잊지 않는 방법",
    subtitle: "거래처, 단골, 직원 연락처를 깔끔하게 정리하고 관리하세요.",
    icon: "👤",
    readTime: "3분",
    date: "2026-04-09",
    tags: ["CRM", "고객관리", "연락처"],
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    content: `## 폰에 "김과장", "식자재아저씨" 이렇게 저장하고 계시죠?

6개월 지나면 누가 누군지 기억도 안 나요. "식자재아저씨가 어디였더라..."

### 사업용 연락처를 따로 만드세요

거래처, 단골, 직원을 그룹별로 정리할 수 있어요. 메모도 남길 수 있고요.

- "김철수 — 매주 목요일 갈비탕 4인분"
- "박서연 — 채소 매주 월요일 납품"

### 단골이 예약하면 바로 알 수 있어요

등록된 손님이 예약하면 "저번에 단체석 쓰셨던 분이네" 바로 보여요. 손님도 기억해주니까 기분이 좋잖아요.

### 무료로 쓸 수 있어요`,
  },
  {
    slug: "tax-invoice-automation",
    category: "세무",
    title: "세금계산서, 버튼 하나면 끝이에요",
    subtitle: "견적서에서 바로 세금계산서를 만들 수 있어요.",
    icon: "📄",
    readTime: "3분",
    date: "2026-04-10",
    tags: ["세금계산서", "세무"],
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    content: `## 세금계산서 한 건에 10분씩 걸리시죠?

홈택스 들어가서 사업자번호 입력하고, 품목 적고... 한 달에 20건이면 3시간이에요.

### 견적서를 확정하면 자동으로 만들어져요

견적서 상태를 "확정"으로 바꾸면, 거래처 정보랑 품목이 자동으로 채워져서 세금계산서가 나와요.

### 실수 걱정 없어요

보내기 전에 한번 확인할 수 있어요. 금액이 맞는지 체크하고 보내면 돼요.

### 매출장부에도 자동으로 기록돼요

따로 적을 필요 없어요. 전부 연결되어 있어요.`,
  },
  {
    slug: "notification-automation",
    category: "알림",
    title: "예약 알림을 자동으로 보내세요",
    subtitle: "예약 확인, 방문 감사 메시지가 카카오톡으로 자동 발송돼요.",
    icon: "📢",
    readTime: "3분",
    date: "2026-04-11",
    tags: ["알림톡", "카카오", "리마인더"],
    image: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&q=80",
    content: `## 예약했는데 안 오는 손님, 속상하시죠?

노쇼가 하루에 한 테이블이면 한 달에 수십만원 손해예요.

### 알림 한 통이면 노쇼가 확 줄어요

예약 전날 카카오톡으로 자동 알림이 나가요:

- 예약할 때 → "예약이 확인되었어요"
- 전날 → "내일 예약 잊지 마세요"
- 다녀간 후 → "감사합니다, 리뷰 남겨주세요"
- 한 달 후 → "또 오세요, 할인 쿠폰 드려요"

### 이것만으로 달라져요

- 노쇼가 절반 넘게 줄었어요
- 리뷰를 남기는 손님이 3배 늘었어요
- 다시 찾아오는 손님도 많아졌어요

### 비용은 메시지 한 건에 7원이에요`,
  },
  {
    slug: "ai-business-insight",
    category: "AI",
    title: "내 가게 데이터, AI가 분석해줘요",
    subtitle: "매출 흐름, 인기 메뉴, 개선할 점을 AI가 알려줍니다.",
    icon: "💡",
    readTime: "3분",
    date: "2026-04-12",
    tags: ["AI", "인사이트", "경영분석"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    content: `## "장사가 잘 되는 건지 안 되는 건지 모르겠어요"

매일 바쁘게 일하지만, 실제로 얼마나 잘 되고 있는지는 잘 모르겠어요.

### AI가 알아서 분석해줘요

매출, 예약, 고객 정보가 쌓이면 AI가 자동으로 살펴봐요.

**이런 걸 알려줘요:**
- "금요일이 매출이 제일 좋아요"
- "비 오는 날은 매출이 30% 줄어요"
- "이번 주 매출이 지난주보다 많이 떨어졌어요"

**이렇게 도와줘요:**
- "화요일에 할인 이벤트 해보세요"
- "답글 안 단 리뷰 5개 있어요"
- "파트타임 시간을 바꾸면 비용을 아낄 수 있어요"

### 오래 쓸수록 더 똑똑해져요

한 달 쓰면 기본적인 흐름을 알려주고, 반년 쓰면 꽤 정확하게 예측해줘요.`,
  },
];

const CATEGORIES = ["전체", "리뷰", "마케팅", "예약", "매출", "견적", "고객응대", "홈페이지", "급여", "고객관리", "세무", "알림", "AI"];

export default function BlogPage() {
  const [category, setCategory] = useState("전체");
  const filtered = category === "전체" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === category);

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(250,250,250,0.9)", borderBottom: "1px solid #eee" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
              style={{ background: "#111" }}>일</div>
            <span className="text-sm font-semibold text-[#111]">블로그</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[#888] hover:text-[#111] transition-colors px-4 py-2" style={{ textDecoration: "none" }}>홈</Link>
            <Link href="/auth" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#111", textDecoration: "none" }}>
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111] mb-2">소상공인을 위한 쉬운 가이드</h1>
          <p className="text-[#888] text-base">어렵지 않아요. 하나씩 따라하면 돼요.</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: category === cat ? "#111" : "transparent",
                color: category === cat ? "white" : "#888",
                border: category === cat ? "1px solid #111" : "1px solid #ddd",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {category === "전체" && (
          <Link href={`/blog/${BLOG_POSTS[11].slug}`} className="block mb-10 group" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl overflow-hidden flex flex-col md:flex-row" style={{ background: "#111" }}>
              <div className="md:w-1/2 aspect-[16/9] md:aspect-auto relative overflow-hidden" style={{ minHeight: 280 }}>
                <img src={BLOG_POSTS[11].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                <span className="text-xs text-[#666] mb-3 uppercase tracking-wider">{BLOG_POSTS[11].category} &middot; {BLOG_POSTS[11].readTime}</span>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">{BLOG_POSTS[11].title}</h2>
                <p className="text-sm text-[#999] mb-6">{BLOG_POSTS[11].subtitle}</p>
                <span className="text-sm text-[#666] group-hover:text-white transition-colors">읽어보기 →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Blog grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group rounded-xl overflow-hidden transition-all hover:shadow-lg"
              style={{ background: "white", border: "1px solid #eee", textDecoration: "none" }}>
              {/* Image */}
              <div className="aspect-[16/10] relative overflow-hidden">
                <img src={post.image} alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Text */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-[#888]">{post.category}</span>
                  <span className="text-[11px] text-[#ccc]">&middot;</span>
                  <span className="text-[11px] text-[#888]">{post.readTime}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#111] mb-1.5 leading-snug group-hover:text-[#555] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[#999] line-clamp-2">{post.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center py-12 rounded-2xl" style={{ background: "#111" }}>
          <h3 className="text-lg font-bold text-white mb-2">지금 바로 시작하세요</h3>
          <p className="text-sm text-[#666] mb-6">무료로 기본 기능을 모두 쓸 수 있어요</p>
          <Link href="/auth" className="inline-block px-6 py-3 rounded-lg text-sm font-semibold text-[#111]" style={{ background: "white", textDecoration: "none" }}>
            무료 회원가입
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-[#bbb]" style={{ borderTop: "1px solid #eee" }}>
        &copy; 2026 일프로AI
      </footer>
    </div>
  );
}
