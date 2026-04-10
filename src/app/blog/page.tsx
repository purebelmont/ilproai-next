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
  // ─── 사장님 후기 ───
  {
    slug: "review-galbitang",
    category: "후기",
    title: "\"리뷰 답글 시간이 하루 5분으로 줄었어요\"",
    subtitle: "울산 갈비탕집 김 사장님의 3개월 사용 후기",
    icon: "🍖",
    readTime: "2분",
    date: "2026-04-13",
    tags: ["후기", "음식점", "리뷰"],
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    content: `## 매일 밤 리뷰 답글 쓰느라 힘들었어요

저는 울산에서 갈비탕집을 10년째 하고 있어요. 장사가 좀 되다 보니 리뷰가 하루에 5~10개씩 달려요. 답글을 안 달면 "이 집 관리 안 하나" 하는 댓글이 달리고, 달려면 밤 11시에 앉아서 한 시간씩 써야 했어요.

### 일프로AI를 쓰고 나서

AI가 리뷰를 읽고 답글을 써줘요. 칭찬이면 감사 인사, 불만이면 정중한 사과. 출근하면서 한번 훑어보고 보내기만 누르면 끝이에요.

리뷰 답글률이 100%가 되니까 새 손님들이 "사장님이 진심인 집이네" 하면서 와요. 단골이 눈에 띄게 늘었어요.

### 솔직히 처음엔 반신반의했어요

AI가 쓴 글이 어색하지 않을까 걱정했는데, 진짜 제가 쓴 것처럼 자연스러워요. 가끔 한두 글자만 고치면 돼요.`,
  },
  {
    slug: "review-salon",
    category: "후기",
    title: "\"인스타 게시물 고민이 사라졌어요\"",
    subtitle: "서울 합정동 미용실 이 원장님의 SNS 자동화 후기",
    icon: "💇",
    readTime: "2분",
    date: "2026-04-14",
    tags: ["후기", "미용실", "SNS"],
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    content: `## 인스타에 뭘 올려야 할지 매일 고민이었어요

미용실은 인스타가 생명이잖아요. 그런데 하루 종일 머리하고 나면 사진 찍을 힘도 없고, 캡션 쓸 여유도 없어요. 일주일에 한 번 올리기도 버거웠어요.

### 이제 AI가 3개 플랫폼 글을 한번에 만들어줘요

업종을 "미용"으로 설정해놓으니까 시즌 트렌드, 할인 이벤트, 후기 게시물까지 퀵 버튼 하나로 뚝딱 만들어줘요.

인스타, 블로그, 페이스북 글이 한번에 나오니까 하루에 3개 플랫폼에 올리는 것도 10분이면 끝나요.

### 팔로워가 두 배로 늘었어요

꾸준히 올리니까 팔로워도 늘고, "인스타 보고 왔어요" 하는 손님이 확실히 많아졌어요.`,
  },
  {
    slug: "review-gym",
    category: "후기",
    title: "\"예약 노쇼가 반으로 줄었어요\"",
    subtitle: "수원 헬스장 박 대표님의 예약 관리 후기",
    icon: "💪",
    readTime: "2분",
    date: "2026-04-15",
    tags: ["후기", "헬스장", "예약"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    content: `## PT 예약 노쇼가 제일 큰 스트레스였어요

헬스장에서 PT를 하는데, 예약해놓고 안 오는 회원이 하루에 2~3명은 있었어요. 1시간 비는 게 하루 매출로 따지면 꽤 큰 손해예요.

### 예약 알림 하나로 달라졌어요

일프로AI로 예약을 관리하니까 전날 카카오톡으로 자동 알림이 가요. "내일 오후 3시 PT 잊지 마세요!" 이거 하나로 노쇼가 절반 넘게 줄었어요.

### 수첩 안 써도 돼요

예전엔 수첩에 적다가 겹치는 사고가 종종 있었는데, 이제 폰으로 한눈에 보이니까 실수가 없어요.`,
  },
  {
    slug: "review-bakery",
    category: "후기",
    title: "\"홈페이지를 5분만에 만들었어요\"",
    subtitle: "부산 해운대 베이커리 최 사장님의 홈페이지 후기",
    icon: "🍞",
    readTime: "2분",
    date: "2026-04-16",
    tags: ["후기", "베이커리", "홈페이지"],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    content: `## 홈페이지 만드는 데 300만원이라니...

웹 업체에 견적을 받으니 300만원. 우리 같은 작은 빵집에 그 돈은 너무 부담이었어요. 네이버 스마트플레이스만 하고 있었는데, 구글에서 검색하면 아무것도 안 나와요.

### AI한테 가게 이름만 알려줬더니

"해운대 베이커리"랑 전화번호만 입력했는데 정말 5분 만에 홈페이지가 나왔어요. 사진도 예쁘고, 메뉴도 깔끔하게 들어가 있고. "이게 진짜 내 가게 홈페이지야?" 싶었어요.

### 지금은 구글에서도 찾을 수 있어요

"해운대 빵집" 검색하면 우리 가게 홈페이지가 나와요. 관광객들이 홈페이지 보고 찾아오는 경우도 생겼어요.`,
  },
  // ─── 회사 철학 ───
  {
    slug: "philosophy-why",
    category: "철학",
    title: "왜 소상공인을 위한 AI를 만드나요?",
    subtitle: "대기업만 누리던 기술을 동네 가게에도.",
    icon: "💡",
    readTime: "3분",
    date: "2026-04-17",
    tags: ["철학", "미션", "비전"],
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    content: `## 대기업은 AI 팀이 있잖아요

스타벅스는 AI로 고객 취향을 분석하고, 맥도날드는 AI로 주문을 예측해요. 그런데 동네 카페 사장님은요? 밤 11시까지 일하고 나서 혼자 인스타 글을 쓰고 있어요.

### 이건 불공평해요

기술이 발전하면 모두가 혜택을 받아야 하는데, 현실은 큰 회사만 더 유리해지고 있어요.

### 그래서 일프로AI를 만들었어요

사장님 혼자서도 대기업처럼 리뷰 관리하고, SNS 마케팅하고, 매출 분석할 수 있게. 어렵지 않게, 비싸지 않게.

한 달에 커피 몇 잔 값이면 AI 비서가 생기는 거예요.`,
  },
  {
    slug: "philosophy-simple",
    category: "철학",
    title: "쉬워야 쓸 수 있어요",
    subtitle: "사장님이 IT 전문가가 아니어도 됩니다.",
    icon: "✨",
    readTime: "2분",
    date: "2026-04-18",
    tags: ["철학", "UX", "쉬운기술"],
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80",
    content: `## "이거 어떻게 쓰는 거예요?"

아무리 좋은 기능이어도 쓰기 어려우면 소용없어요. 사장님들은 바쁘거든요. 설명서 읽을 시간 없어요.

### 우리의 원칙

- 3번 터치 안에 끝나야 해요
- 전문 용어를 쓰면 안 돼요
- 처음 보는 사람도 바로 쓸 수 있어야 해요

### 사장님이 기술을 배우는 게 아니라

기술이 사장님에게 맞춰야 해요. 그래서 우리는 매주 실제 사장님들을 만나서 "이거 이해가 되세요?" 물어봐요.

안 된다고 하면 우리가 바꿔요. 사장님이 바꿀 필요 없어요.`,
  },
  {
    slug: "philosophy-time",
    category: "철학",
    title: "사장님의 시간은 소중해요",
    subtitle: "반복 작업은 AI에게, 중요한 일은 사장님에게.",
    icon: "⏰",
    readTime: "2분",
    date: "2026-04-19",
    tags: ["철학", "시간", "효율"],
    image: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80",
    content: `## 하루에 몇 시간을 반복 작업에 쓰세요?

리뷰 답글 쓰기, 인스타 캡션 고민하기, 예약 정리하기, 매출 계산하기... 이런 일에 하루 2~3시간이 가요.

### 이 시간에 뭘 할 수 있을까요?

- 새 메뉴를 개발할 수 있어요
- 단골 손님과 이야기할 수 있어요
- 가족과 저녁을 먹을 수 있어요
- 그냥 쉴 수 있어요

### AI가 대신할 수 있는 건 AI가 하면 돼요

사장님은 사람만이 할 수 있는 일에 집중하세요. 손님 앞에서 웃는 것, 맛있는 음식을 만드는 것, 좋은 서비스를 고민하는 것. 그게 진짜 사장님의 일이에요.`,
  },
  {
    slug: "philosophy-trust",
    category: "철학",
    title: "사장님의 데이터는 사장님 거예요",
    subtitle: "우리는 사장님의 데이터를 팔지 않아요.",
    icon: "🔒",
    readTime: "2분",
    date: "2026-04-20",
    tags: ["철학", "보안", "신뢰"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
    content: `## "내 매출 정보가 어디로 가는 거예요?"

당연한 걱정이에요. 매출, 고객, 예약 데이터는 사장님의 소중한 정보잖아요.

### 우리의 약속

- 사장님의 데이터를 제3자에게 팔지 않아요
- 광고에 활용하지 않아요
- 사장님이 삭제하면 완전히 사라져요

### 신뢰가 먼저예요

좋은 기능을 만드는 것도 중요하지만, 사장님이 안심하고 쓸 수 있는 게 더 중요해요. 우리 사업도 사장님의 신뢰 위에 서 있으니까요.`,
  },
  {
    slug: "philosophy-growth",
    category: "철학",
    title: "같이 성장하고 싶어요",
    subtitle: "사장님이 잘 되어야 우리도 잘 돼요.",
    icon: "🌱",
    readTime: "2분",
    date: "2026-04-21",
    tags: ["철학", "성장", "상생"],
    image: "https://images.unsplash.com/photo-1416169607655-0c2b3ce2e067?w=800&q=80",
    content: `## 사장님이 잘 되면 우리도 좋아요

우리의 수익 모델은 간단해요. 사장님이 일프로AI를 오래 쓰면 우리도 좋은 거예요. 그래서 사장님이 잘 되는 게 우리한테도 제일 중요해요.

### 비싸게 받지 않아요

동네 가게 사장님이 부담 없이 쓸 수 있는 가격이어야 해요. 한 달에 커피 몇 잔 값. 이것만으로 AI 비서를 쓸 수 있다면 충분하잖아요.

### 무료로도 충분히 쓸 수 있어요

기본 기능은 전부 무료예요. 예약 관리, 연락처, 메모, 견적서, 매출장부. 이것만으로도 사업 운영이 한결 편해져요.

나중에 더 필요하면 그때 PRO를 쓰시면 돼요. 강요하지 않아요.`,
  },
  {
    slug: "philosophy-local",
    category: "철학",
    title: "동네 가게가 살아야 동네가 살아요",
    subtitle: "소상공인이 잘 되는 세상을 꿈꿔요.",
    icon: "🏘️",
    readTime: "2분",
    date: "2026-04-22",
    tags: ["철학", "소상공인", "지역경제"],
    image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&q=80",
    content: `## 동네 가게가 사라지고 있어요

프랜차이즈, 대형마트, 온라인 쇼핑... 동네 가게들이 점점 힘들어지고 있어요. 그런데 동네 가게가 없으면 동네가 재미없어져요. 아는 사장님이 반겨주는 그 느낌, 프랜차이즈에서는 느낄 수 없잖아요.

### 기술로 도울 수 있어요

동네 가게가 프랜차이즈와 경쟁하려면 똑같은 도구가 필요해요. 마케팅 도구, 고객 관리 도구, 데이터 분석 도구. 큰 회사만 쓸 수 있었던 걸 우리가 만들어줄게요.

### 사장님이 장사에만 집중할 수 있도록

번거로운 일은 AI가 해줄게요. 사장님은 손님에게 더 좋은 서비스를 해주세요. 그게 동네 가게만의 경쟁력이니까요.`,
  },
];

const CATEGORIES = ["전체", "리뷰", "마케팅", "예약", "매출", "견적", "고객응대", "홈페이지", "급여", "고객관리", "세무", "알림", "AI", "후기", "철학"];

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
