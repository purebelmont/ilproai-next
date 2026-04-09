"use client";

import Link from "next/link";
import { useState } from "react";

export type BlogPost = {
  slug: string;
  category: string;
  categoryColor: string;
  title: string;
  subtitle: string;
  icon: string;
  readTime: string;
  date: string;
  tags: string[];
  content: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ai-review-reply",
    category: "자동화",
    categoryColor: "#7D2AE7",
    title: "네이버 리뷰 답글, AI가 대신 써드립니다",
    subtitle: "리뷰 하나하나 답글 달기 힘드셨죠? AI가 톤에 맞춰 자동으로 답변을 생성합니다.",
    icon: "⭐",
    readTime: "3분",
    date: "2026-04-01",
    tags: ["리뷰", "자동화", "네이버"],
    content: `## 리뷰 답글, 왜 중요한가요?

네이버 플레이스, 구글 리뷰에 달리는 고객 리뷰는 **신규 고객 유입의 핵심**입니다. 하지만 하루에 들어오는 리뷰 5~10건에 일일이 답글을 다는 건 사장님에게 큰 부담이죠.

### 일프로AI의 해결책

일프로AI의 **AI 리뷰 답글 자동화**는:

- **긍정 리뷰**: 감사 인사 + 재방문 유도 멘트를 자동 생성
- **부정 리뷰**: 진심 어린 사과 + 개선 의지를 담은 답글 작성
- **중립 리뷰**: 추가 정보 제공 + 재방문 기대감 조성

### 실제 효과

울산의 한 음식점은 AI 리뷰 답글 도입 후:
- 리뷰 답글률: **30% → 100%**
- 평균 답글 시간: **6시간 → 5분**
- 재방문율: **15% 증가**

### 비용은?

건당 **₩0~7원**. 하루 10건이면 월 **₩2,100원**도 안 됩니다. 직원 한 명 시급의 1/10도 안 되는 비용으로 고객 관리가 완벽해집니다.

> 💡 일프로AI PRO 플랜(₩29,900/월)에 포함된 기능입니다.`,
  },
  {
    slug: "sns-auto-marketing",
    category: "마케팅",
    categoryColor: "#E1306C",
    title: "인스타·블로그 게시물, AI가 자동으로 만들어줍니다",
    subtitle: "업종과 분위기만 선택하면 인스타그램, 블로그, 페이스북 게시물이 한 번에 생성됩니다.",
    icon: "📣",
    readTime: "4분",
    date: "2026-04-02",
    tags: ["SNS", "마케팅", "인스타그램", "블로그"],
    content: `## SNS 마케팅, 안 하면 뒤처집니다

2026년 소비자의 **78%**가 가게를 방문하기 전에 SNS를 검색합니다. 하지만 매일 게시물을 올리기엔 시간이 없죠.

### 일프로AI SNS 자동화

**업종만 선택하면** AI가 플랫폼별 최적화된 콘텐츠를 생성합니다:

- **인스타그램**: 감성적인 캡션 + 해시태그 30개
- **네이버 블로그**: SEO 최적화된 1,000자 이상의 포스팅
- **페이스북**: 공유하고 싶은 스토리형 게시물
- **트위터/X**: 임팩트 있는 단문 홍보

### A/B 테스트까지

같은 내용을 **3가지 톤**(친근한, 전문적인, 유머러스한)으로 생성해서 어떤 게 더 반응이 좋은지 테스트할 수 있습니다.

### 무료 체험 가능

회원가입만 하면 **무료로 SNS 콘텐츠 생성을 체험**할 수 있습니다. 지금 바로 [대시보드](/dashboard)에서 시도해보세요!`,
  },
  {
    slug: "reservation-management",
    category: "운영",
    categoryColor: "#FF6B35",
    title: "종이 예약장은 이제 그만! 디지털 예약 관리",
    subtitle: "전화·카톡으로 받는 예약을 한 곳에서 관리하고, 노쇼도 줄여보세요.",
    icon: "📋",
    readTime: "3분",
    date: "2026-04-03",
    tags: ["예약", "운영", "노쇼방지"],
    content: `## 예약 관리의 현실

"사장님, 오늘 6시 예약이 몇 명이었죠?" — 이런 질문에 종이 수첩을 뒤적이고 계신가요?

### 일프로AI 예약 관리

- **한 눈에 보는 예약 현황**: 날짜별, 시간별 예약을 캘린더로 확인
- **예약 상태 관리**: 확인 대기 → 확인 완료 → 방문 완료
- **고객 정보 연동**: 연락처, 이전 방문 기록 자동 연결
- **인원 파악**: 오늘 총 예약 인원수를 실시간 확인

### 노쇼 방지

PRO 플랜의 **알림 자동화**와 연동하면:
- 예약 1일 전 자동 리마인더 발송
- 예약 당일 아침 확인 메시지 발송
- 노쇼율 **평균 40% 감소**

### 무료로 시작하세요

예약 관리는 **무료 플랜**에 포함되어 있습니다. 지금 바로 사용해보세요.`,
  },
  {
    slug: "revenue-analytics",
    category: "매출",
    categoryColor: "#30D158",
    title: "이번 달 매출, 정확히 알고 계세요?",
    subtitle: "매출·지출을 기록하면 AI가 트렌드를 분석하고 위험 신호를 알려줍니다.",
    icon: "📊",
    readTime: "4분",
    date: "2026-04-04",
    tags: ["매출", "분석", "리포트"],
    content: `## 감이 아닌 데이터로 경영하세요

많은 소상공인이 "이번 달 잘 됐다", "저번 달보다 안 된 것 같다"는 느낌으로 경영합니다. 하지만 **정확한 숫자**를 알아야 올바른 결정을 내릴 수 있습니다.

### 매출장부 + AI 리포트

**매출장부**에 수입/지출을 기록하면:

- **월별 매출 추이** 자동 차트 생성
- **요일별 매출 패턴** 분석 (어느 요일이 잘 되는지)
- **지출 비율** 모니터링 (식자재비가 매출의 몇 %인지)
- **순이익 실시간 계산**

### AI 인사이트 (PRO)

데이터가 1개월 이상 쌓이면 AI가 자동으로:

- 📈 **매출 예측**: 다음 달 예상 매출 계산
- ⚠️ **위험 신호 감지**: 지출 급증, 매출 하락 조기 경고
- 💡 **개선 제안**: "화요일 프로모션을 도입하면 매출 15% 증가 예상"

### 세무사 공유

리포트를 PDF로 내보내서 세무사에게 바로 공유할 수 있습니다.`,
  },
  {
    slug: "quote-automation",
    category: "영업",
    categoryColor: "#007AFF",
    title: "견적서, 2분이면 완성됩니다",
    subtitle: "항목만 입력하면 프로페셔널한 PDF 견적서를 즉시 생성합니다.",
    icon: "💼",
    readTime: "3분",
    date: "2026-04-05",
    tags: ["견적서", "PDF", "영업"],
    content: `## 견적서 때문에 고생하지 마세요

엑셀로 견적서를 만들고, PDF로 변환하고, 카톡으로 보내고… 견적서 하나에 30분씩 쓰고 계셨다면, 이제 **2분**이면 됩니다.

### 일프로AI 견적서 기능

1. **항목 추가**: 품명, 수량, 단가만 입력
2. **자동 계산**: 소계, 부가세, 합계 자동 계산
3. **PDF 생성**: 사업자 정보가 담긴 프로페셔널한 견적서
4. **즉시 전송**: 카카오톡, 이메일로 바로 발송

### 견적서 관리

- **상태 추적**: 초안 → 발송 → 확정 → 완료
- **이력 관리**: 거래처별 견적서 히스토리 한 눈에
- **재사용**: 이전 견적서를 복사해서 빠르게 수정

### 세금계산서 연동 (PRO)

견적서가 확정되면 **전자세금계산서를 자동 발행**할 수 있습니다. 팝빌 API와 연동되어 국세청에 바로 신고됩니다.

> 견적서 기능은 **무료 플랜**에서 사용 가능합니다.`,
  },
  {
    slug: "ai-chatbot",
    category: "자동화",
    categoryColor: "#7D2AE7",
    title: "새벽 2시 고객 문의도 AI가 응대합니다",
    subtitle: "카카오톡 AI 챗봇이 24시간 고객 문의를 자동으로 처리합니다.",
    icon: "💬",
    readTime: "4분",
    date: "2026-04-06",
    tags: ["챗봇", "카카오톡", "고객응대"],
    content: `## 놓치는 문의 = 놓치는 매출

"영업시간이 몇 시예요?", "주차 가능한가요?", "예약하고 싶은데요" — 이런 문의가 밤 10시에 카톡으로 옵니다. 다음 날 아침에 답하면? 이미 다른 가게에 갔습니다.

### AI 챗봇이 해결합니다

일프로AI 챗봇은:

- **24시간 즉시 응답**: 새벽이든 휴일이든 5초 안에 답변
- **정확한 정보 제공**: 가게 정보, 메뉴, 가격, 위치를 학습
- **예약 접수**: 날짜/시간/인원을 확인하고 예약까지 처리
- **FAQ 자동 응답**: 자주 묻는 질문 20가지를 설정

### 사람이 필요할 때

복잡한 문의는 **사장님에게 자동 전달**합니다. AI가 처리할 수 있는 건 AI가, 사람이 필요한 건 사람이 — 효율적인 분업입니다.

### 도입 비용

- 건당 **₩7원** (하루 평균 20건이면 월 ₩4,200원)
- 카카오 비즈메시지 API 연결 필요
- PRO 플랜(₩29,900/월)에 포함`,
  },
  {
    slug: "website-builder",
    category: "홈페이지",
    categoryColor: "#0071E3",
    title: "5분만에 내 가게 홈페이지를 만드세요",
    subtitle: "가게 정보만 입력하면 AI가 모바일 최적화된 홈페이지를 자동 생성합니다.",
    icon: "🌐",
    readTime: "3분",
    date: "2026-04-07",
    tags: ["홈페이지", "AI", "웹사이트"],
    content: `## 홈페이지, 아직 없으세요?

네이버 스마트플레이스만으로는 부족합니다. **내 가게만의 홈페이지**가 있으면:

- 구글 검색에 노출
- 브랜드 신뢰도 상승
- 메뉴/서비스를 자유롭게 소개
- 예약/문의 폼 운영

### 일프로AI 홈페이지 빌더

**가게 이름, 업종, 설명만 입력**하면 AI가 자동으로:

1. 디자인 템플릿 선택
2. 콘텐츠 생성 (소개, 메뉴, 오시는 길)
3. 모바일 최적화
4. **{가게이름}.ilpro.ai** 도메인 자동 부여

### 커스터마이징

생성된 홈페이지를 원하는 대로 수정할 수 있습니다:
- 색상, 폰트 변경
- 사진 교체
- 섹션 추가/삭제
- 영업시간, 연락처 수정

### 가격

PRO 플랜(₩29,900/월)에 포함. 별도 호스팅 비용 없음.`,
  },
  {
    slug: "payroll-management",
    category: "인사",
    categoryColor: "#AF52DE",
    title: "직원 급여 계산, 1분이면 끝납니다",
    subtitle: "정규직·파트타임 급여를 자동 계산하고, 이체 내역까지 관리합니다.",
    icon: "👥",
    readTime: "3분",
    date: "2026-04-08",
    tags: ["급여", "인사관리", "파트타임"],
    content: `## 급여 계산의 고통

파트타임 3명, 정규직 2명 — 시급 다르고, 근무시간 다르고, 야근수당에 주휴수당까지… 매달 반나절씩 급여 계산에 쓰고 계신가요?

### 일프로AI 급여 관리

**직원 등록 한 번이면** 매달 자동 계산:

- **정규직**: 기본급 + 야근 + 상여금
- **파트타임**: 시급 × 근무시간 자동 계산
- **공제 항목**: 4대보험, 소득세 자동 반영
- **주휴수당**: 주 15시간 이상 근무 시 자동 계산

### 급여 명세서

각 직원에게 **카톡/이메일로 급여 명세서**를 자동 발송할 수 있습니다.

### 매출장부 연동

급여 지급 시 **매출장부에 자동 기록**되어 별도로 지출 입력할 필요 없습니다.

> 급여 관리는 **무료 플랜**에서 사용 가능합니다.`,
  },
  {
    slug: "crm-contact-management",
    category: "고객관리",
    categoryColor: "#0071E3",
    title: "단골 고객을 VIP로 만드는 연락처 관리",
    subtitle: "거래처, 단골, 직원 연락처를 그룹별로 관리하고, 고객 히스토리를 추적하세요.",
    icon: "👤",
    readTime: "3분",
    date: "2026-04-09",
    tags: ["CRM", "고객관리", "연락처"],
    content: `## 연락처, 아직 폰에만 저장하세요?

"김 사장님 번호가 뭐였지?" — 폰 연락처를 뒤지는 대신, **일프로AI에서 한 번에 관리**하세요.

### 스마트 연락처 관리

- **그룹 분류**: 거래처, 단골, 직원, 파트너 등
- **즐겨찾기**: 자주 연락하는 사람을 상단에 고정
- **메모 기능**: "매주 목요일 갈비탕 주문", "채소 월요일 납품"
- **검색**: 이름, 회사명, 전화번호로 즉시 검색

### 예약·매출 연동

연락처에 등록된 고객이 예약하면:
- 이전 방문 기록 자동 표시
- 선호 메뉴/서비스 확인
- 특이사항 메모 공유

### 거래처 관리

B2B 사업자를 위한 기능:
- 거래처별 견적서/납품 이력
- 담당자 연락처 + 직급
- 미수금 알림

> 연락처 관리는 **무료 플랜**에서 사용 가능합니다.`,
  },
  {
    slug: "tax-invoice-automation",
    category: "세무",
    categoryColor: "#FF9500",
    title: "전자세금계산서, 버튼 하나로 발행하세요",
    subtitle: "견적서 확정 시 전자세금계산서를 자동 발행하고, 매출장부에 자동 반영됩니다.",
    icon: "📄",
    readTime: "3분",
    date: "2026-04-10",
    tags: ["세금계산서", "세무", "자동화"],
    content: `## 세금계산서 발행, 얼마나 걸리세요?

홈택스 접속 → 로그인 → 공급받는자 입력 → 품목 입력 → 발행… 건당 10분. 월 20건이면 **3시간 이상**을 세금계산서에 쓰고 있는 겁니다.

### 일프로AI 세금계산서 자동화

견적서가 **확정** 상태가 되면:

1. 사업자 정보 자동 입력 (내 사업자 + 거래처)
2. 품목, 금액, 부가세 자동 계산
3. **팝빌 API**를 통해 국세청에 자동 신고
4. 매출장부에 자동 기록

### 안전장치

- 발행 전 미리보기 확인 가능
- "수동 확인 후 발행" 모드 지원
- 발행 이력 및 상태 추적

### 비용

- 건당 **₩100원**
- PRO 플랜(₩29,900/월) 필요
- 팝빌 API 키 연결 필요

> 월 20건 기준: ₩2,000원으로 3시간의 시간 절약`,
  },
  {
    slug: "notification-automation",
    category: "자동화",
    categoryColor: "#7D2AE7",
    title: "예약 리마인더, 카카오 알림톡으로 자동 발송",
    subtitle: "예약 확인, 방문 감사, 재방문 유도 메시지를 자동으로 보내세요.",
    icon: "📢",
    readTime: "3분",
    date: "2026-04-11",
    tags: ["알림톡", "카카오", "리마인더"],
    content: `## 노쇼를 줄이는 가장 쉬운 방법

예약 부도(노쇼)율 전국 평균 **15~20%**. 4인 테이블 하나가 빈다면 하루 매출 ₩80,000 손실입니다.

### 알림 자동화로 노쇼 방지

일프로AI가 **카카오 알림톡**으로 자동 발송:

| 시점 | 메시지 내용 |
|------|------------|
| 예약 접수 시 | "예약이 확인되었습니다" |
| 방문 1일 전 | "내일 예약 리마인더" |
| 방문 당일 아침 | "오늘 방문 안내" |
| 방문 후 1일 | "감사합니다. 리뷰 부탁드려요" |
| 방문 후 30일 | "다시 만나고 싶어요 — 재방문 쿠폰" |

### 실제 효과

- 노쇼율: **20% → 8%** (60% 감소)
- 리뷰 작성율: **5% → 18%** (3.6배 증가)
- 재방문율: **12% 증가**

### 비용

- 건당 **₩7원** (카카오 알림톡 비용)
- PRO 플랜(₩29,900/월)에 포함`,
  },
  {
    slug: "ai-business-insight",
    category: "AI",
    categoryColor: "#5856D6",
    title: "사장님의 AI 경영 비서를 소개합니다",
    subtitle: "매출, 예약, 리뷰 데이터를 종합 분석하여 경영 인사이트를 제공합니다.",
    icon: "💡",
    readTime: "5분",
    date: "2026-04-12",
    tags: ["AI", "인사이트", "경영분석"],
    content: `## 대기업만 데이터 분석을 할 수 있나요?

아닙니다. 일프로AI가 있으면 **동네 음식점도 데이터 기반 경영**을 할 수 있습니다.

### AI 인사이트가 알려주는 것

매출, 예약, 고객 데이터가 쌓이면 AI가 자동으로 분석합니다:

#### 📈 매출 예측
- "다음 주 예상 매출: ₩12,500,000"
- "금요일이 평균 매출 최고 요일"
- "비 오는 날 매출 30% 감소 패턴 발견"

#### ⚠️ 위험 감지
- "이번 주 매출이 지난주 대비 25% 감소"
- "식자재비 비율이 45%로 업계 평균(35%) 초과"
- "3번 연속 노쇼 고객 발견"

#### 💡 개선 제안
- "화요일 점심 할인 이벤트 제안 — 예상 매출 20% 증가"
- "리뷰 미답변 5건 — 답글 작성 시 재방문율 15% 증가 기대"
- "파트타임 근무시간 재배치 제안 — 인건비 8% 절감 가능"

### AI 추천 기능

대시보드의 **✨ AI 추천** 버튼을 누르면, 지금 당장 해야 할 일을 우선순위별로 알려줍니다:

- 🔴 **긴급**: 미확인 예약, 급한 할일
- 🟠 **중요**: 오늘 일정, 매출 이상 징후
- 🔵 **추천**: 미발송 견적서, SNS 마케팅
- 🟢 **참고**: 매출 현황, 좋은 소식

### 데이터가 쌓일수록 똑똑해집니다

1개월: 기본 트렌드 분석
3개월: 시즌별 패턴 파악
6개월: 정확한 매출 예측
12개월: 전년 대비 성장률 + 맞춤 전략

> AI 인사이트는 PRO 플랜(₩29,900/월)에 포함. 분석당 ₩50원.`,
  },
];

const CATEGORIES = ["전체", "자동화", "마케팅", "운영", "매출", "영업", "홈페이지", "인사", "고객관리", "세무", "AI"];

export default function BlogPage() {
  const [category, setCategory] = useState("전체");
  const filtered = category === "전체" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === category);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg, #F9F9FB)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.85)", borderBottom: "1px solid var(--border, #E5E5EA)" }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>일</div>
            <span className="text-base font-bold" style={{ color: "var(--text, #1D1D1F)" }}>일프로AI 블로그</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "#7D2AE7", textDecoration: "none" }}>
              무료로 시작하기
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: "var(--text, #1D1D1F)" }}>
            소상공인을 위한 AI 업무자동화 가이드
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted, #56565A)" }}>
            일프로AI가 어떻게 시간과 비용을 절약해주는지 알아보세요
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{
                background: category === cat ? "#7D2AE7" : "var(--bg-card, white)",
                color: category === cat ? "white" : "var(--text-muted, #56565A)",
                border: category === cat ? "none" : "1px solid var(--border, #E5E5EA)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {category === "전체" && (
          <Link href={`/blog/${BLOG_POSTS[11].slug}`} className="block mb-8 group" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)", minHeight: 240 }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="relative p-8 md:p-10">
                <span className="text-xs px-2 py-1 rounded-full font-semibold bg-white/20 text-white mb-4 inline-block">추천 아티클</span>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{BLOG_POSTS[11].title}</h2>
                <p className="text-sm text-white/70 mb-4 max-w-lg">{BLOG_POSTS[11].subtitle}</p>
                <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">읽어보기 →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ background: "var(--bg-card, white)", border: "1px solid var(--border, #E5E5EA)", textDecoration: "none" }}>
              {/* Color bar */}
              <div className="h-1.5" style={{ background: post.categoryColor }} />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{post.icon}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: post.categoryColor }}>
                    {post.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-2 group-hover:text-[#7D2AE7] transition-colors" style={{ color: "var(--text, #1D1D1F)" }}>
                  {post.title}
                </h3>
                <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-muted, #56565A)" }}>
                  {post.subtitle}
                </p>
                <div className="flex items-center justify-between text-[10px]" style={{ color: "var(--text-muted, #56565A)" }}>
                  <span>{post.date}</span>
                  <span>{post.readTime} 읽기</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center rounded-2xl p-8" style={{ background: "linear-gradient(135deg, rgba(125,42,231,0.08), rgba(0,113,227,0.08))", border: "1px solid var(--border, #E5E5EA)" }}>
          <div className="text-2xl mb-2">🚀</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text, #1D1D1F)" }}>지금 바로 시작하세요</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted, #56565A)" }}>무료 플랜으로 연락처, 일정, 예약, 매출, 견적, 급여 관리를 시작하세요</p>
          <Link href="/auth" className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)", textDecoration: "none" }}>
            무료 회원가입 →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-xs" style={{ color: "var(--text-muted, #56565A)", borderTop: "1px solid var(--border, #E5E5EA)" }}>
        <p>&copy; 2026 일프로AI. 소상공인과 중소기업을 위한 AI 업무자동화 플랫폼.</p>
      </footer>
    </div>
  );
}
