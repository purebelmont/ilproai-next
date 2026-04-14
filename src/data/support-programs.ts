/**
 * 지원사업 목록
 *
 * 이 파일을 수정하면 사업계획서 > 지원사업 추천에 바로 반영됩니다.
 *
 * 새 지원사업 추가 방법:
 * 아래 배열에 객체를 추가하세요. 필드 설명:
 *
 *   id       — 고유 번호 (문자열)
 *   name     — 지원사업 이름
 *   org      — 주관 기관
 *   amount   — 지원 금액
 *   deadline — 마감일 ("2026-05-30" 또는 "상시", "예산 소진 시")
 *   target   — 지원 대상
 *   category — 카테고리 (기술개발, 자금지원, 창업지원, 사업화, 교육지원, 보증지원, 스마트화)
 *   url      — 공고 페이지 URL
 *   formUrl  — 신청/양식 다운로드 URL
 *   formType — 양식 형태 ("온라인 신청", "HWP/PDF", "온라인 (K-Startup)" 등)
 *   tags     — 태그 배열 (적합도 매칭에 사용)
 */

export interface SupportProgram {
  id: string;
  name: string;
  org: string;
  amount: string;
  deadline: string;
  target: string;
  category: string;
  url: string;
  formUrl: string;
  formType: string;
  match: number;
  tags: string[];
}

export const SUPPORT_PROGRAMS: SupportProgram[] = [
  // ──── 중앙부처 지원사업 ────
  {
    id: "1",
    name: "창업성장기술개발사업(디딤돌)",
    org: "중소벤처기업부",
    amount: "최대 1억원",
    deadline: "2026-05-30",
    target: "예비창업자, 3년 이내 창업기업",
    category: "기술개발",
    url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116971",
    formUrl: "https://www.iris.go.kr",
    formType: "온라인 (IRIS)",
    match: 0,
    tags: ["기술개발", "R&D", "초기창업"],
  },
  {
    id: "2",
    name: "소상공인 정책자금 (일반경영안정자금)",
    org: "소상공인시장진흥공단",
    amount: "최대 7천만원",
    deadline: "예산 소진 시",
    target: "소상공인",
    category: "자금지원",
    url: "https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=310&bcIdx=1064354",
    formUrl: "https://ols.sbiz.or.kr",
    formType: "온라인 신청",
    match: 0,
    tags: ["소상공인", "운영자금", "저금리"],
  },
  {
    id: "3",
    name: "청년창업사관학교",
    org: "중소벤처기업부",
    amount: "최대 1억원 + 교육",
    deadline: "2026-06-15",
    target: "만 39세 이하 예비/초기 창업자",
    category: "창업지원",
    url: "https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=310&bcIdx=1056086",
    formUrl: "https://start.kosmes.or.kr",
    formType: "HWP (공고문 내 첨부)",
    match: 0,
    tags: ["청년", "교육", "멘토링", "사업화"],
  },
  {
    id: "4",
    name: "혁신창업사업화자금 (혁신분야)",
    org: "중소벤처기업부",
    amount: "최대 3억원",
    deadline: "2026-05-20",
    target: "7년 이내 중소기업",
    category: "사업화",
    url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116941",
    formUrl: "https://ols.sbc.or.kr",
    formType: "온라인 신청",
    match: 0,
    tags: ["혁신", "스케일업", "사업화"],
  },
  {
    id: "5",
    name: "모두의 창업 프로젝트",
    org: "중소벤처기업부",
    amount: "최대 10억원",
    deadline: "2026-05-15",
    target: "아이디어 보유 누구나",
    category: "창업지원",
    url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116904",
    formUrl: "https://www.k-startup.go.kr",
    formType: "온라인 (K-Startup)",
    match: 0,
    tags: ["대학연계", "기술창업", "팀빌딩"],
  },
  {
    id: "6",
    name: "예비창업패키지",
    org: "중소벤처기업부",
    amount: "최대 1억원",
    deadline: "2026-04-30",
    target: "예비창업자",
    category: "창업지원",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000119019",
    formUrl: "https://www.k-startup.go.kr",
    formType: "온라인 + DOCX/HWP",
    match: 0,
    tags: ["예비창업", "사업화", "멘토링"],
  },
  {
    id: "7",
    name: "초기창업패키지",
    org: "중소벤처기업부",
    amount: "최대 1억원",
    deadline: "2026-05-10",
    target: "3년 이내 창업기업",
    category: "창업지원",
    url: "https://www.kised.or.kr/menu.es?mid=a10302000000",
    formUrl: "https://www.k-startup.go.kr",
    formType: "온라인 (K-Startup)",
    match: 0,
    tags: ["초기창업", "사업화", "네트워킹"],
  },
  {
    id: "8",
    name: "소공인특화자금",
    org: "소상공인시장진흥공단",
    amount: "최대 2억원",
    deadline: "예산 소진 시",
    target: "제조업 소공인 (10인 미만)",
    category: "자금지원",
    url: "https://www.semas.or.kr/web/SUP01/SUP0103/SUP010301.kmdc",
    formUrl: "https://ols.sbiz.or.kr",
    formType: "온라인 신청",
    match: 0,
    tags: ["제조업", "소공인", "시설자금"],
  },
  {
    id: "9",
    name: "ICT 이노베이션 스퀘어",
    org: "과학기술정보통신부",
    amount: "교육 + 프로젝트 지원",
    deadline: "상시",
    target: "ICT 분야 예비/초기 창업자",
    category: "교육지원",
    url: "https://www.ictinnovation.kr",
    formUrl: "https://www.ictinnovation.kr/support/notice",
    formType: "온라인 신청",
    match: 0,
    tags: ["ICT", "AI", "교육", "네트워킹"],
  },
  {
    id: "10",
    name: "여성기업 특례보증",
    org: "기술보증기금",
    amount: "최대 5억원 보증",
    deadline: "상시",
    target: "여성 대표 기업",
    category: "보증지원",
    url: "https://www.kibo.or.kr",
    formUrl: "https://www.kibo.or.kr/dbranch/index.do",
    formType: "온라인/방문 신청",
    match: 0,
    tags: ["여성", "보증", "저금리"],
  },
  {
    id: "11",
    name: "지역특화산업육성+(R&D)",
    org: "중소벤처기업부",
    amount: "최대 2억원",
    deadline: "2026-06-30",
    target: "지역 소재 중소기업",
    category: "기술개발",
    url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116943",
    formUrl: "https://www.smtech.go.kr/front/ifg/no/notice02_list.do",
    formType: "HWP/PDF",
    match: 0,
    tags: ["지역", "R&D", "제조"],
  },
  {
    id: "12",
    name: "스마트공장 보급·확산 사업",
    org: "중소벤처기업부",
    amount: "최대 1억원 (매칭)",
    deadline: "2026-05-31",
    target: "제조 중소기업",
    category: "스마트화",
    url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116263",
    formUrl: "https://www.smart-factory.kr",
    formType: "온라인 신청",
    match: 0,
    tags: ["제조", "스마트공장", "디지털전환"],
  },

  // ──── 창조경제혁신센터 (지역별) ────
  { id: "13", name: "서울창조경제혁신센터", org: "서울창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "서울 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/seoul/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/seoul/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["서울", "창업지원", "멘토링", "네트워킹"] },
  { id: "14", name: "경기창조경제혁신센터", org: "경기창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "경기 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/gyeonggi/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/gyeonggi/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["경기", "창업지원", "판교", "네트워킹"] },
  { id: "15", name: "부산창조경제혁신센터", org: "부산창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "부산 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/busan/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/busan/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["부산", "창업지원", "해양", "지역"] },
  { id: "16", name: "대구창조경제혁신센터", org: "대구창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "대구 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/daegu/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/daegu/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["대구", "창업지원", "ICT", "지역"] },
  { id: "17", name: "인천창조경제혁신센터", org: "인천창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "인천 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/incheon/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/incheon/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["인천", "창업지원", "물류", "지역"] },
  { id: "18", name: "대전창조경제혁신센터", org: "대전창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "대전 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/daejeon/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/daejeon/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["대전", "창업지원", "R&D", "지역"] },
  { id: "19", name: "울산창조경제혁신센터", org: "울산창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "울산 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/ulsan/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/ulsan/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["울산", "창업지원", "제조", "지역"] },
  { id: "20", name: "광주창조경제혁신센터", org: "광주창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "광주 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/gwangju/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/gwangju/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["광주", "창업지원", "AI", "지역"] },
  { id: "21", name: "강원창조경제혁신센터", org: "강원창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "강원 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/gangwon/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/gangwon/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["강원", "창업지원", "관광", "지역"] },
  { id: "22", name: "충북창조경제혁신센터", org: "충북창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "충북 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/chungbuk/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/chungbuk/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["충북", "창업지원", "바이오", "지역"] },
  { id: "23", name: "충남창조경제혁신센터", org: "충남창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "충남 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/chungnam/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/chungnam/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["충남", "창업지원", "제조", "지역"] },
  { id: "24", name: "전북창조경제혁신센터", org: "전북창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "전북 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/jeonbuk/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/jeonbuk/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["전북", "창업지원", "농식품", "지역"] },
  { id: "25", name: "전남창조경제혁신센터", org: "전남창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "전남 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/jeonnam/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/jeonnam/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["전남", "창업지원", "에너지", "지역"] },
  { id: "26", name: "경북창조경제혁신센터", org: "경북창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "경북 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/gyeongbuk/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/gyeongbuk/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["경북", "창업지원", "ICT", "지역"] },
  { id: "27", name: "경남창조경제혁신센터", org: "경남창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "경남 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/gyeongnam/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/gyeongnam/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["경남", "창업지원", "제조", "지역"] },
  { id: "28", name: "제주창조경제혁신센터", org: "제주창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "제주 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/jeju/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/jeju/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["제주", "창업지원", "관광", "지역"] },
  { id: "29", name: "세종창조경제혁신센터", org: "세종창조경제혁신센터", amount: "프로그램별 상이", deadline: "상시", target: "세종 소재 예비/초기 창업자", category: "창업지원", url: "https://ccei.creativekorea.or.kr/sejong/custom/notice_list.do?kind=my&sPtime=now", formUrl: "https://ccei.creativekorea.or.kr/sejong/service/program_list.do?sMenuType=00040003", formType: "온라인 신청", match: 0, tags: ["세종", "창업지원", "정부기관", "지역"] },
];
