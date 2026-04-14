export const maxDuration = 30;

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const fmtW = (n: number) => (n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, "") + "억" : n.toLocaleString() + "만") + "원";

function generateDemo(section: string, name: string, industry: string, description: string, target: string, funding: string): string {
  const n = name || "우리 사업";
  const ind = industry || "서비스";
  const desc = description || "고객에게 가치를 제공하는 혁신 서비스";
  const tgt = target || "소상공인 및 중소기업";
  const fund = funding || "5천만원";

  // 랜덤 수치 생성
  const y1Revenue = randInt(3000, 8000);
  const y2Revenue = randInt(y1Revenue * 2, y1Revenue * 4);
  const y3Revenue = randInt(y2Revenue * 2, y2Revenue * 3);
  const y1Customers = randInt(200, 1000);
  const y2Customers = randInt(y1Customers * 2, y1Customers * 5);
  const y3Customers = randInt(y2Customers * 2, y2Customers * 4);
  const marketSize = randInt(5000, 50000);
  const samSize = Math.round(marketSize * (randInt(5, 15) / 100));
  const somSize = Math.round(samSize * (randInt(1, 5) / 100));
  const bepMonths = randInt(12, 24);
  const monthlyFixed = randInt(2000, 5000);
  const convRate = randInt(3, 12);
  const teamSize = randInt(3, 6);
  const expandSize6m = randInt(teamSize + 2, teamSize + 5);
  const expandSize12m = randInt(expandSize6m + 3, expandSize6m + 8);

  const visions = [
    `${n}은(는) ${ind} 분야에서 **데이터 기반의 혁신적인 접근**으로 ${tgt}의 비즈니스 성장을 가속화하는 것을 목표로 합니다.`,
    `${n}은(는) "${desc}"라는 핵심 가치 아래, ${ind} 산업의 **디지털 전환을 선도**하겠습니다.`,
    `${n}은(는) ${tgt}가 직면한 문제를 **기술과 창의성으로 해결**하여 ${ind} 시장의 새로운 기준을 만들겠습니다.`,
  ];

  const values = [
    ["**고객 중심** — 모든 의사결정의 기준은 고객 가치", "**혁신** — 기존 방식에 도전하고 더 나은 방법을 추구", "**신뢰** — 투명한 운영과 정직한 소통", "**성장** — 지속 가능한 비즈니스 모델 구축"],
    ["**실행력** — 빠르게 시도하고 빠르게 배운다", "**데이터** — 감이 아닌 데이터로 결정한다", "**공감** — 고객의 입장에서 생각한다", "**협업** — 함께 성장하는 생태계를 만든다"],
    ["**품질** — 타협 없는 최고의 서비스 제공", "**접근성** — 누구나 쉽게 사용할 수 있는 솔루션", "**지속성** — 단기 성과보다 장기 가치 추구", "**투명성** — 고객과의 열린 소통"],
  ];

  const templates: Record<string, string[]> = {
    "사업 개요": [
      `### 비전\n${pick(visions)}\n\n### 미션\n${desc}\n\n### 핵심 가치\n${pick(values).map(v => `- ${v}`).join("\n")}\n\n### 사업 목표\n| 구분 | 1차년도 | 2차년도 | 3차년도 |\n|------|---------|---------|----------|\n| 매출 | ${fmtW(y1Revenue)} | ${fmtW(y2Revenue)} | ${fmtW(y3Revenue)} |\n| 고객 수 | ${y1Customers.toLocaleString()}명 | ${y2Customers.toLocaleString()}명 | ${y3Customers.toLocaleString()}명 |\n| 시장 점유율 | ${randInt(1, 2)}% | ${randInt(3, 5)}% | ${randInt(6, 10)}% |`,

      `### 사업 비전\n${pick(visions)}\n\n### 사업 배경\n${ind} 시장은 연평균 **${randInt(8, 20)}%** 성장하고 있으며, 특히 ${tgt} 대상 시장에서 **해결되지 않은 핵심 문제**가 존재합니다. ${n}은(는) 이 기회를 포착하여 ${desc}을 통해 시장에 진입합니다.\n\n### 핵심 가치\n${pick(values).map(v => `- ${v}`).join("\n")}\n\n### 3개년 목표\n| 지표 | Year 1 | Year 2 | Year 3 |\n|------|--------|--------|--------|\n| 매출액 | ${fmtW(y1Revenue)} | ${fmtW(y2Revenue)} | ${fmtW(y3Revenue)} |\n| 유료 고객 | ${y1Customers}명 | ${y2Customers}명 | ${y3Customers}명 |\n| 팀 규모 | ${teamSize}명 | ${expandSize6m}명 | ${expandSize12m}명 |`,
    ],

    "제품/서비스": [
      `### 핵심 서비스\n${n}은(는) ${ind} 시장에서 다음과 같은 서비스를 제공합니다:\n\n**서비스 라인업**\n| 서비스 | 설명 | 가격대 |\n|--------|------|--------|\n| 기본 플랜 | 핵심 기능 제공 | 무료~월 ${randInt(19, 39).toLocaleString()},900원 |\n| 프로 플랜 | 고급 기능 + 우선 지원 | 월 ${randInt(49, 79).toLocaleString()},900원 |\n| 엔터프라이즈 | 맞춤 솔루션 + 전담 매니저 | 별도 협의 |\n\n### 경쟁 우위\n1. **차별화된 기술력** — ${desc}을 통한 독보적 포지셔닝\n2. **가격 경쟁력** — 기존 대비 ${randInt(25, 50)}% 합리적 가격\n3. **사용자 경험** — 직관적 UI/UX로 러닝커브 최소화\n4. **고객 지원** — ${randInt(12, 24)}시간 응답 체계\n\n### 기술 스택\n- 자체 개발 AI/ML 엔진\n- 클라우드 네이티브 인프라\n- 실시간 데이터 분석 파이프라인`,

      `### 제품 소개\n${n}은(는) "${desc}"를 실현하는 **올인원 ${ind} 솔루션**입니다.\n\n### 주요 기능\n- **핵심 기능 A** — ${tgt}의 가장 큰 페인포인트를 해결\n- **핵심 기능 B** — 기존 수작업을 ${randInt(60, 90)}% 자동화\n- **핵심 기능 C** — 실시간 데이터 분석 및 인사이트 제공\n- **핵심 기능 D** — 모바일 최적화로 언제 어디서나 사용\n\n### 가격 정책\n| 등급 | 월 요금 | 주요 혜택 |\n|------|---------|----------|\n| 무료 체험 | 0원 (${randInt(7, 30)}일) | 전 기능 체험 |\n| 스타터 | ${randInt(15, 29).toLocaleString()},000원 | 기본 기능 + 이메일 지원 |\n| 프로 | ${randInt(39, 69).toLocaleString()},000원 | 전체 기능 + 전화 지원 |\n| 비즈니스 | ${randInt(99, 199).toLocaleString()},000원 | 맞춤형 + 전담 매니저 |\n\n### 개발 로드맵\n- **Q1**: MVP 출시 및 베타 테스트\n- **Q2**: 핵심 기능 고도화, 피드백 반영\n- **Q3**: 연동 API 공개, 파트너 생태계 구축\n- **Q4**: AI 기반 자동화 기능 추가`,
    ],

    "시장 분석": [
      `### 목표 시장 (TAM/SAM/SOM)\n| 구분 | 규모 | 설명 |\n|------|------|------|\n| TAM | 약 ${fmtW(marketSize)} | ${ind} 전체 시장 |\n| SAM | 약 ${fmtW(samSize)} | 디지털 전환 관련 |\n| SOM | 약 ${fmtW(somSize)} | 3년 내 목표 |\n\n### 타겟 고객\n**주요 고객군:** ${tgt}\n- **페르소나 A** — ${randInt(25, 35)}세 초기 창업자, 디지털 도구 관심\n- **페르소나 B** — ${randInt(35, 45)}세 기존 사업자, 효율화 니즈\n- **페르소나 C** — 다점포 운영자, 통합 관리 필요\n\n### 경쟁사 분석\n| 경쟁사 | 강점 | 약점 | 차별점 |\n|--------|------|------|--------|\n| A사 | 높은 인지도 | 비싼 가격 | 합리적 가격 |\n| B사 | 다양한 기능 | 한국 미최적화 | 로컬 지원 |\n| C사 | 저렴 | 기능 부족 | AI 자동화 |\n\n### 시장 트렌드\n- ${ind} 디지털 전환 연평균 ${randInt(10, 22)}% 성장\n- AI/자동화 도구 수요 급증\n- 구독 경제 모델 확대`,

      `### 시장 규모 분석\n${ind} 시장은 국내 기준 약 **${fmtW(marketSize)}** 규모로, 최근 ${randInt(3, 5)}년간 연평균 **${randInt(8, 18)}%** 성장세를 보이고 있습니다.\n\n### TAM-SAM-SOM\n- **TAM (전체 시장)**: ${fmtW(marketSize)} — ${ind} 전체\n- **SAM (유효 시장)**: ${fmtW(samSize)} — ${tgt} 대상 디지털 솔루션\n- **SOM (획득 가능)**: ${fmtW(somSize)} — 초기 3년 목표\n\n### 고객 세분화\n| 세그먼트 | 비중 | 특성 | 공략 방법 |\n|----------|------|------|----------|\n| 초기 창업자 | ${randInt(30, 45)}% | 비용에 민감, 간편함 중시 | 무료 플랜 → 업셀 |\n| 성장기 기업 | ${randInt(30, 40)}% | 효율화 절실, 투자 의향 | 프로 플랜 직접 영업 |\n| 기존 기업 | ${randInt(15, 30)}% | 레거시 전환 필요 | 마이그레이션 지원 |\n\n### 주요 경쟁사 포지셔닝\n**우리의 포지션**: 합리적 가격 + 한국 시장 최적화 + AI 기반 자동화\n- 기존 솔루션 대비 도입 비용 ${randInt(30, 60)}% 절감\n- 한국어 완벽 지원 (경쟁사 대부분 영문 기반)\n- AI 기반 자동 분석/추천 (유일한 차별점)`,
    ],

    "마케팅 전략": [
      `### 고객 확보 전략\n\n**인지 (Awareness)**\n- 블로그/SEO: ${ind} 키워드 콘텐츠 ${randInt(50, 150)}건/분기\n- SNS: 인스타/블로그 주 ${randInt(3, 5)}회 포스팅\n- 유튜브: 성공 사례 영상 시리즈\n\n**관심 (Interest)**\n- 무료 체험: ${randInt(7, 30)}일 트라이얼\n- 웨비나: 월 ${randInt(1, 4)}회 온라인 세미나\n- 리드 마그넷: 업종별 가이드북\n\n**전환 (Conversion)**\n- 온보딩 콜: 가입 후 1:1 상담\n- 프로모션: 연간 결제 ${randInt(15, 30)}% 할인\n- 레퍼럴: 추천 ${randInt(1, 3)}개월 무료\n\n### 가격 전략\n프리미엄 모델 — 무료 → 유료 전환율 목표 ${convRate}%\n\n### 마케팅 예산\n| 채널 | 월 예산 | 예상 ROI |\n|------|--------|----------|\n| 디지털 광고 | ${randInt(200, 500)}만원 | ${randInt(3, 6)}배 |\n| 콘텐츠 제작 | ${randInt(100, 300)}만원 | 장기 자산 |\n| 이벤트 | ${randInt(50, 150)}만원 | 인지도 |\n| 총 | ${randInt(400, 900)}만원/월 | |`,

      `### 그로스 전략\n\n**Phase 1 — 시드 유저 확보 (1~6개월)**\n- ${tgt} 커뮤니티 타겟 마케팅\n- 얼리버드 ${randInt(30, 60)}% 할인 프로모션\n- 인플루언서 ${randInt(5, 15)}명 협업\n- 목표: 유료 고객 ${randInt(100, 500)}명\n\n**Phase 2 — 성장 가속 (7~12개월)**\n- 퍼포먼스 마케팅 본격 집행\n- 고객 후기 기반 콘텐츠 확대\n- 제휴/파트너십 ${randInt(3, 10)}건\n- 목표: 유료 고객 ${y1Customers}명\n\n**Phase 3 — 스케일업 (13~24개월)**\n- 브랜드 캠페인 런칭\n- 오프라인 이벤트/컨퍼런스 참가\n- B2B 영업팀 구성\n- 목표: 유료 고객 ${y2Customers}명\n\n### 채널별 CAC 목표\n| 채널 | CAC 목표 | LTV:CAC |\n|------|---------|----------|\n| SEO/콘텐츠 | ${randInt(5, 15)}만원 | ${randInt(5, 10)}:1 |\n| 유료 광고 | ${randInt(15, 40)}만원 | ${randInt(3, 5)}:1 |\n| 레퍼럴 | ${randInt(3, 8)}만원 | ${randInt(8, 15)}:1 |\n| 파트너십 | ${randInt(10, 25)}만원 | ${randInt(4, 8)}:1 |`,
    ],

    "재무 계획": [
      `### 매출 예측 (3개년)\n| 항목 | 1차년도 | 2차년도 | 3차년도 |\n|------|---------|---------|----------|\n| 구독 매출 | ${fmtW(Math.round(y1Revenue * 0.7))} | ${fmtW(Math.round(y2Revenue * 0.7))} | ${fmtW(Math.round(y3Revenue * 0.7))} |\n| 서비스 매출 | ${fmtW(Math.round(y1Revenue * 0.3))} | ${fmtW(Math.round(y2Revenue * 0.3))} | ${fmtW(Math.round(y3Revenue * 0.3))} |\n| **총 매출** | **${fmtW(y1Revenue)}** | **${fmtW(y2Revenue)}** | **${fmtW(y3Revenue)}** |\n\n### 비용 구조\n| 항목 | 비율 | 월 예상 비용 |\n|------|------|-------------|\n| 인건비 | ${randInt(45, 55)}% | ${fmtW(Math.round(monthlyFixed * 0.5))} |\n| 서버/인프라 | ${randInt(10, 18)}% | ${fmtW(Math.round(monthlyFixed * 0.15))} |\n| 마케팅 | ${randInt(18, 25)}% | ${fmtW(Math.round(monthlyFixed * 0.2))} |\n| 사무실/관리 | ${randInt(8, 12)}% | ${fmtW(Math.round(monthlyFixed * 0.1))} |\n| 기타 | 5% | ${fmtW(Math.round(monthlyFixed * 0.05))} |\n\n### 손익분기점\n- **예상 BEP**: ${bepMonths}개월 차\n- **월 고정비**: 약 ${fmtW(monthlyFixed)}\n- **BEP 고객 수**: 약 ${randInt(500, 2000)}명\n\n### 자금 조달\n- **1단계**: 자기자본 + 정부지원 ${fund}\n- **2단계**: 시드 투자 ${fmtW(randInt(10000, 30000))}\n- **3단계**: 시리즈A ${fmtW(randInt(50000, 200000))}`,

      `### 수익 모델\n${n}의 주요 수익원은 **${pick(["구독 수수료", "SaaS 구독", "월정액 서비스", "거래 수수료 + 구독"])}**입니다.\n\n### 매출 시나리오\n| 시나리오 | Y1 | Y2 | Y3 |\n|----------|-----|-----|-----|\n| 보수적 | ${fmtW(Math.round(y1Revenue * 0.7))} | ${fmtW(Math.round(y2Revenue * 0.7))} | ${fmtW(Math.round(y3Revenue * 0.7))} |\n| 기본 | ${fmtW(y1Revenue)} | ${fmtW(y2Revenue)} | ${fmtW(y3Revenue)} |\n| 낙관적 | ${fmtW(Math.round(y1Revenue * 1.4))} | ${fmtW(Math.round(y2Revenue * 1.4))} | ${fmtW(Math.round(y3Revenue * 1.4))} |\n\n### 월별 현금흐름 (1차년도)\n| 분기 | 매출 | 지출 | 순현금 |\n|------|------|------|--------|\n| Q1 | ${fmtW(Math.round(y1Revenue * 0.1))} | ${fmtW(monthlyFixed * 3)} | ${fmtW(Math.round(y1Revenue * 0.1) - monthlyFixed * 3)} |\n| Q2 | ${fmtW(Math.round(y1Revenue * 0.2))} | ${fmtW(monthlyFixed * 3)} | ${fmtW(Math.round(y1Revenue * 0.2) - monthlyFixed * 3)} |\n| Q3 | ${fmtW(Math.round(y1Revenue * 0.3))} | ${fmtW(monthlyFixed * 3)} | ${fmtW(Math.round(y1Revenue * 0.3) - monthlyFixed * 3)} |\n| Q4 | ${fmtW(Math.round(y1Revenue * 0.4))} | ${fmtW(monthlyFixed * 3)} | ${fmtW(Math.round(y1Revenue * 0.4) - monthlyFixed * 3)} |\n\n### 자금 조달 계획\n총 필요 자금: **${fund}**\n- 자기 자본: ${randInt(20, 40)}%\n- 정부 지원: ${randInt(30, 50)}%\n- 엔젤/시드: ${randInt(10, 30)}%`,
    ],

    "팀 구성": [
      `### 핵심 팀 (${teamSize}명)\n| 직책 | 역할 | 핵심 역량 |\n|------|------|----------|\n| 대표 (CEO) | 사업 총괄 | ${ind} ${randInt(5, 15)}년 경력 |\n| 기술 (CTO) | 제품 개발 | 풀스택 ${randInt(7, 12)}년 경력 |\n| 마케팅 (CMO) | 성장 전략 | 그로스해킹 ${randInt(5, 10)}년 경력 |\n${teamSize > 3 ? `| 디자인 (CDO) | UX/UI | 프로덕트 디자인 ${randInt(5, 8)}년 |\n` : ""}${teamSize > 4 ? `| 개발 | 백엔드 | 클라우드/데이터 ${randInt(3, 7)}년 |\n` : ""}\n### 조직 확장\n| 시기 | 인원 | 채용 분야 |\n|------|------|----------|\n| 현재 | ${teamSize}명 | 창업 핵심 팀 |\n| 6개월 | ${expandSize6m}명 | 개발 ${randInt(1, 3)}명, 마케팅 ${randInt(1, 2)}명 |\n| 12개월 | ${expandSize12m}명 | 영업, CS, 데이터분석 |\n| 24개월 | ${randInt(expandSize12m + 5, expandSize12m + 15)}명 | 팀 리더급 |\n\n### 자문단\n- 법률: ${pick(["법무법인 세종", "법무법인 광장", "김앤장"])} 자문\n- 회계: ${pick(["삼정KPMG", "딜로이트안진", "EY한영"])} 파트너\n- 기술: ${pick(["서울대", "KAIST", "포항공대"])} 교수 자문`,

      `### 창업 팀 소개\n\n**대표이사**\n${ind} 분야에서 ${randInt(5, 15)}년 이상의 경력을 보유한 전문가입니다. ${pick(["삼성", "네이버", "카카오", "쿠팡", "배달의민족"])}에서 ${pick(["사업개발", "PM", "전략기획", "마케팅"])}을 담당했으며, ${n}의 비전을 실현하기 위해 창업했습니다.\n\n**기술총괄 (CTO)**\n${pick(["풀스택 개발", "AI/ML 엔지니어링", "클라우드 아키텍처"])} 전문가로, ${pick(["구글", "아마존", "마이크로소프트", "토스", "당근마켓"])} 출신입니다. ${randInt(50, 200)}만+ 사용자 서비스 운영 경험이 있습니다.\n\n**마케팅총괄 (CMO)**\n디지털 마케팅 ${randInt(5, 10)}년 경력. ${pick(["네이버", "카카오", "쿠팡", "무신사"])}에서 MAU ${randInt(10, 100)}만 달성 경험.\n\n### 채용 로드맵\n| 단계 | 시기 | 채용 규모 |\n|------|------|----------|\n| 핵심 팀 완성 | 현재 | ${teamSize}명 |\n| 제품팀 확장 | +6개월 | +${expandSize6m - teamSize}명 |\n| 성장팀 구성 | +12개월 | +${expandSize12m - expandSize6m}명 |`,
    ],
  };

  // 지원서 양식 전용 항목 (필요성, 혁신성 등)
  const formTemplates: Record<string, () => string> = {
    "필요성": () => `### 개발 배경\n${n}은(는) ${ind} 분야에서 ${tgt}가 겪고 있는 **핵심 문제**를 해결하기 위해 개발되었습니다.\n\n### 기존 문제점\n- 기존 솔루션은 **높은 비용**(월 ${randInt(50, 200)}만원 이상)과 **복잡한 사용성**으로 ${tgt}가 접근하기 어려움\n- 현장에서 ${pick(["안전사고", "비효율", "데이터 부재", "수작업 의존"])}으로 인한 연간 손실 약 ${fmtW(randInt(1000, 5000))} 발생\n- 시장 내 ${randInt(60, 80)}%의 사업자가 디지털 전환 필요성을 체감하지만 적합한 도구 부재\n\n### 솔루션 내용 및 용도\n${desc}\n\n### 관련성\n본 아이템은 ${ind} 분야의 **${pick(["안전성 향상", "생산성 극대화", "비용 절감", "품질 관리 강화"])}**에 직접적으로 기여하며, 정부의 ${pick(["디지털 뉴딜", "스마트 산업 육성", "중소기업 경쟁력 강화", "산업안전 혁신"])} 정책 방향과 일치합니다.`,

    "혁신성": () => `### 핵심 기술력\n${n}은(는) 다음과 같은 **차별적 기술**을 보유하고 있습니다:\n\n| 기술 요소 | 기존 방식 | ${n}의 방식 | 개선 효과 |\n|-----------|----------|------------|----------|\n| 데이터 처리 | 수동 입력 | AI 자동 분석 | 처리시간 ${randInt(70, 95)}% 단축 |\n| 사용자 인터페이스 | PC 전용 | 모바일 최적화 | 접근성 ${randInt(3, 5)}배 향상 |\n| 정확도 | ${randInt(60, 75)}% | ${randInt(92, 99)}% | 오류율 ${randInt(80, 95)}% 감소 |\n| 비용 | 월 ${randInt(50, 150)}만원 | 월 ${randInt(3, 30)}만원 | ${randInt(60, 90)}% 절감 |\n\n### 기존 유사 기술과 차이점\n1. **${pick(["실시간 AI 분석", "엣지 컴퓨팅", "자연어 처리", "컴퓨터 비전"])}** 기반 — 기존 제품 대비 ${randInt(3, 10)}배 빠른 처리 속도\n2. **한국형 최적화** — 국내 규정/표준 완벽 반영 (해외 솔루션 대비 강점)\n3. **${pick(["노코드", "원클릭", "자동화", "플러그앤플레이"])}** 방식 — 전문 지식 없이도 즉시 사용 가능`,

    "안전성": () => `### 안전문제 해결 방안\n${n}은(는) 산업·재난현장의 안전을 **실질적으로 개선**합니다.\n\n### 적용 시나리오\n| 현장 유형 | 기존 위험요소 | ${n} 적용 효과 |\n|-----------|-------------|---------------|\n| ${pick(["제조 공장", "건설 현장", "물류 창고"])} | ${pick(["설비 고장 감지 지연", "작업자 안전 사각지대", "위험물 관리 미흡"])} | 사고율 ${randInt(40, 70)}% 감소 |\n| ${pick(["화학 공장", "에너지 시설", "광산"])} | ${pick(["가스 누출 모니터링", "화재 초기 감지", "구조물 안전 진단"])} | 대응시간 ${randInt(50, 80)}% 단축 |\n\n### 안전성 검증\n- 산업안전보건법 제${randInt(38, 76)}조 기준 충족\n- ${pick(["한국산업안전보건공단", "한국산업기술시험원", "국가기술표준원"])} 인증 ${pick(["완료", "예정", "진행 중"])}\n- 실증 테스트: ${randInt(3, 12)}개 현장, ${randInt(100, 500)}시간 운영\n- 안전사고 예방 효과: 연간 약 ${fmtW(randInt(5000, 20000))} 손실 방지 기대`,

    "수익성": () => `### 비즈니스 모델\n**${pick(["SaaS 구독형", "거래 수수료", "프리미엄 모델", "B2B 라이선스"])}** 수익 구조\n\n### 매출 계획\n| 구분 | 1차년도 | 2차년도 | 3차년도 |\n|------|---------|---------|----------|\n| 유료 고객 | ${randInt(100, 500)}명 | ${randInt(500, 2000)}명 | ${randInt(2000, 5000)}명 |\n| 객단가(월) | ${randInt(3, 10)}만원 | ${randInt(5, 15)}만원 | ${randInt(5, 15)}만원 |\n| 연매출 | ${fmtW(randInt(3000, 8000))} | ${fmtW(randInt(10000, 30000))} | ${fmtW(randInt(30000, 80000))} |\n\n### 마케팅 전략\n- **온라인**: SEO, SNS 마케팅, 콘텐츠 마케팅\n- **오프라인**: 산업 전시회, 기관 데모, 파트너 영업\n- **핵심 KPI**: CAC ${randInt(5, 20)}만원, LTV:CAC ${randInt(4, 10)}:1`,

    "시장성": () => `### 국내외 시장 현황\n${ind} 관련 국내 시장 규모는 약 **${fmtW(randInt(5000, 50000))}**이며, 연평균 **${randInt(8, 20)}%** 성장 중입니다.\n\n### 수요처\n| 수요처 | 예상 규모 | 진입 전략 |\n|--------|----------|----------|\n| ${pick(["대기업", "공공기관", "중소제조업"])} | ${randInt(500, 2000)}개사 | B2B 직접 영업 |\n| ${pick(["스타트업", "소상공인", "프랜차이즈"])} | ${randInt(5000, 20000)}개사 | 온라인 마케팅 |\n| ${pick(["해외 시장", "동남아", "일본"])} | 진출 예정 | 현지 파트너십 |\n\n### 경쟁사 비교\n| 항목 | ${n} | 경쟁사 A | 경쟁사 B |\n|------|------|---------|----------|\n| 가격 | 월 ${randInt(3, 10)}만원 | 월 ${randInt(15, 50)}만원 | 월 ${randInt(10, 30)}만원 |\n| 한국어 지원 | ✅ 완벽 | ❌ 영문 | △ 부분 |\n| AI 기능 | ✅ | ❌ | △ |\n| 모바일 | ✅ | ❌ | ✅ |`,

    "확장성": () => `### 다분야 활용 가능성\n${n}의 핵심 기술은 **${ind}**뿐만 아니라 다양한 산업에 적용 가능합니다.\n\n| 적용 분야 | 활용 방식 | 시장 규모 |\n|-----------|----------|----------|\n| ${pick(["제조업", "건설업", "물류"])} | ${pick(["품질관리 자동화", "안전관리 시스템", "재고 최적화"])} | ${fmtW(randInt(3000, 10000))} |\n| ${pick(["의료/헬스케어", "교육", "금융"])} | ${pick(["진단 보조", "학습 분석", "리스크 평가"])} | ${fmtW(randInt(5000, 20000))} |\n| ${pick(["농업", "에너지", "환경"])} | ${pick(["스마트팜", "효율 모니터링", "오염 감지"])} | ${fmtW(randInt(2000, 8000))} |\n\n### 현장 적용 가능성\n- **TRL(기술성숙도)**: ${randInt(5, 7)}단계 → 2차년도 ${randInt(7, 9)}단계 목표\n- 실증 완료: ${randInt(2, 5)}개 현장\n- 상용화 준비: ${pick(["인증 진행 중", "시범 운영 중", "양산 준비 완료"])}`,

    "계획 구체성": () => `### 개발 목표\n| 단계 | 기간 | 목표 | 산출물 |\n|------|------|------|--------|\n| 1단계 | ${randInt(1, 3)}개월 | 핵심 기능 개발 | 프로토타입 |\n| 2단계 | ${randInt(3, 6)}개월 | 현장 실증 | 테스트 리포트 |\n| 3단계 | ${randInt(6, 9)}개월 | 고도화 | 상용 버전 |\n| 4단계 | ${randInt(9, 12)}개월 | 시장 출시 | 매출 발생 |\n\n### 마일스톤\n- **M+3**: MVP 완성, 베타 테스터 ${randInt(10, 50)}명 확보\n- **M+6**: 실증 ${randInt(3, 10)}건 완료, 인증 신청\n- **M+9**: 정식 출시, 유료 고객 ${randInt(50, 200)}명\n- **M+12**: 월매출 ${fmtW(randInt(1000, 5000))} 달성`,

    "기술개발 역량": () => `### 팀 역량\n| 이름 | 역할 | 주요 경력 |\n|------|------|----------|\n| 대표 | 총괄 기획 | ${ind} ${randInt(5, 15)}년, ${pick(["삼성", "LG", "현대", "SK"])} 출신 |\n| CTO | 기술 개발 | ${pick(["풀스택", "AI/ML", "임베디드"])} ${randInt(7, 12)}년 |\n| 연구원 | 핵심 기술 | ${pick(["석사", "박사"])} 졸, 논문 ${randInt(3, 15)}편 |\n\n### 기술 자립성\n- 핵심 알고리즘 **자체 개발** (외부 의존도 0%)\n- 특허 ${pick(["출원 중", "등록 완료", "출원 예정"])} ${randInt(1, 5)}건\n- 관련 기술 보유: ${pick(["AI/ML", "IoT", "클라우드", "블록체인", "로보틱스"])}, ${pick(["데이터 분석", "영상처리", "자연어처리", "센서 융합"])}\n\n### 사업화 의지\n- 전원 전업 창업, ${pick(["법인 설립 완료", "법인 설립 예정"])}\n- 자기 자본 ${fmtW(randInt(1000, 5000))} 투입 완료\n- 관련 산업 네트워크 ${randInt(10, 50)}개 기관 확보`,
  };

  // 사업계획서 섹션 매칭 시도
  const variants = templates[section];
  if (variants) return pick(variants);

  // 지원서 양식 항목 매칭 (부분 매칭)
  for (const [key, fn] of Object.entries(formTemplates)) {
    if (section.includes(key)) return fn();
  }

  // 매칭 안 되면 범용 템플릿
  return `### ${section}\n\n${n}은(는) ${ind} 분야에서 ${desc}을 통해 ${tgt}에게 가치를 제공합니다.\n\n### 핵심 내용\n- ${section}과 관련하여 **구체적인 실행 계획**을 수립하였습니다\n- 시장 조사 결과 ${randInt(60, 85)}%의 ${tgt}가 해당 분야에서 개선을 필요로 합니다\n- ${randInt(3, 12)}개월 내 가시적인 성과를 달성할 수 있는 로드맵을 보유\n\n### 기대 효과\n- ${pick(["비용 절감", "생산성 향상", "안전성 강화", "품질 개선"])}: ${randInt(20, 60)}%\n- ${pick(["고객 만족도", "시장 점유율", "매출"])} ${randInt(2, 5)}배 성장 기대\n- ${pick(["사회적 가치 창출", "일자리 창출", "기술 국산화"])} 기여`;
}

export async function POST(req: Request) {
  const { section, name, industry, description, target, funding } = await req.json();
  const content = generateDemo(section, name || '', industry || '', description || '', target || '', funding || '');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const lines = content.split('\n');
      for (const line of lines) {
        controller.enqueue(encoder.encode(line + '\n'));
        await new Promise(r => setTimeout(r, 25));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
