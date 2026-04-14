// ──── 마크다운 → HTML 변환 ────
export function md(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const header = tableRows[0];
    const body = tableRows.slice(1);
    let html = '<table class="bp-table"><thead><tr>' + header.map(c => `<th>${c}</th>`).join("") + "</tr></thead><tbody>";
    for (const row of body) {
      html += "<tr>" + row.map(c => `<td>${c}</td>`).join("") + "</tr>";
    }
    html += "</tbody></table>";
    out.push(html);
    tableRows = [];
    inTable = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[|\s:-]+$/.test(trimmed) && trimmed.includes("-") && (trimmed.includes("|") || inTable)) {
      inTable = true;
      continue;
    }
    if (/^\|.+\|$/.test(trimmed)) {
      const cells = trimmed.slice(1, -1).split("|").map(c => c.trim());
      tableRows.push(cells);
      inTable = true;
      continue;
    }
    if (inTable) flushTable();
    out.push(trimmed);
  }
  if (inTable) flushTable();

  return out.join("\n")
    .replace(/^### (.+)$/gm, '<h4 class="bp-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="bp-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul class="bp-ul">${m}</ul>`)
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, ' ');
}

// ──── 타입 ────
export interface SupportProgram {
  id: string; name: string; org: string; amount: string; deadline: string;
  target: string; category: string; url: string; formUrl: string;
  formType: string; match: number; tags: string[];
}

export interface BizInfo {
  name: string; industry: string; description: string; target: string; funding: string;
}

// ──── 적합도 계산 ────
export function calcMatch(program: SupportProgram, info: BizInfo): number {
  let score = 0;
  const text = `${info.name} ${info.industry} ${info.description} ${info.target} ${info.funding}`.toLowerCase();
  if (/it|소프트웨어|ai|플랫폼|앱|개발|ict|테크/.test(text)) {
    if (program.tags.some(t => ["ICT", "AI", "기술개발", "R&D", "혁신", "기술창업"].includes(t))) score += 30;
  }
  if (/음식|카페|식당|요식|외식|베이커리/.test(text)) {
    if (program.tags.some(t => ["소상공인", "운영자금"].includes(t))) score += 30;
  }
  if (/제조|공장|생산|부품/.test(text)) {
    if (program.tags.some(t => ["제조업", "소공인", "스마트공장", "제조"].includes(t))) score += 30;
  }
  if (/뷰티|미용|살롱|네일|헤어/.test(text)) {
    if (program.tags.some(t => ["소상공인", "운영자금"].includes(t))) score += 30;
  }
  if (/예비|준비|계획|시작/.test(text)) {
    if (program.tags.some(t => ["예비창업", "초기창업", "교육"].includes(t))) score += 20;
  }
  if (/초기|1년|2년|3년/.test(text)) {
    if (program.tags.some(t => ["초기창업", "사업화"].includes(t))) score += 20;
  }
  if (/청년|20대|30대/.test(text) && program.tags.includes("청년")) score += 20;
  if (/여성/.test(text) && program.tags.includes("여성")) score += 25;
  if (/대학|연구/.test(text) && program.tags.includes("대학연계")) score += 20;
  if (/지역|지방/.test(text) && program.tags.includes("지역")) score += 15;
  if (info.funding) {
    const fundNum = parseInt(info.funding.replace(/[^0-9]/g, "")) || 0;
    const amtText = program.amount;
    if (fundNum <= 7000 && amtText.includes("7천만")) score += 15;
    if (fundNum <= 10000 && amtText.includes("1억")) score += 10;
    if (fundNum > 10000 && /[2-9]억|10억/.test(amtText)) score += 10;
  }
  score += 10;
  return Math.min(score, 95);
}

// ──── 지원사업 데이터 ────
export const SUPPORT_PROGRAMS: SupportProgram[] = [
  { id: "1", name: "창업성장기술개발사업(디딤돌)", org: "중소벤처기업부", amount: "최대 1억원", deadline: "2026-05-30", target: "예비창업자, 3년 이내", category: "기술개발", url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116971", formUrl: "https://www.iris.go.kr", formType: "온라인 (IRIS)", match: 0, tags: ["기술개발", "R&D", "초기창업"] },
  { id: "2", name: "소상공인 정책자금", org: "소상공인시장진흥공단", amount: "최대 7천만원", deadline: "예산 소진 시", target: "소상공인", category: "자금지원", url: "https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=310&bcIdx=1064354", formUrl: "https://ols.sbiz.or.kr", formType: "온라인 신청", match: 0, tags: ["소상공인", "운영자금", "저금리"] },
  { id: "3", name: "청년창업사관학교", org: "중소벤처기업부", amount: "최대 1억원 + 교육", deadline: "2026-06-15", target: "만 39세 이하", category: "창업지원", url: "https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=310&bcIdx=1056086", formUrl: "https://start.kosmes.or.kr", formType: "HWP", match: 0, tags: ["청년", "교육", "멘토링", "사업화"] },
  { id: "4", name: "혁신창업사업화자금", org: "중소벤처기업부", amount: "최대 3억원", deadline: "2026-05-20", target: "7년 이내 중소기업", category: "사업화", url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116941", formUrl: "https://ols.sbc.or.kr", formType: "온라인 신청", match: 0, tags: ["혁신", "스케일업", "사업화"] },
  { id: "5", name: "모두의 창업 프로젝트", org: "중소벤처기업부", amount: "최대 10억원", deadline: "2026-05-15", target: "아이디어 보유 누구나", category: "창업지원", url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116904", formUrl: "https://www.k-startup.go.kr", formType: "온라인 (K-Startup)", match: 0, tags: ["대학연계", "기술창업", "팀빌딩"] },
  { id: "6", name: "예비창업패키지", org: "중소벤처기업부", amount: "최대 1억원", deadline: "2026-04-30", target: "예비창업자", category: "창업지원", url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000119019", formUrl: "https://www.k-startup.go.kr", formType: "온라인 + DOCX/HWP", match: 0, tags: ["예비창업", "사업화", "멘토링"] },
  { id: "7", name: "초기창업패키지", org: "중소벤처기업부", amount: "최대 1억원", deadline: "2026-05-10", target: "3년 이내 창업기업", category: "창업지원", url: "https://www.kised.or.kr/menu.es?mid=a10302000000", formUrl: "https://www.k-startup.go.kr", formType: "온라인 (K-Startup)", match: 0, tags: ["초기창업", "사업화", "네트워킹"] },
  { id: "8", name: "소공인특화자금", org: "소상공인시장진흥공단", amount: "최대 2억원", deadline: "예산 소진 시", target: "제조업 소공인", category: "자금지원", url: "https://www.semas.or.kr/web/SUP01/SUP0103/SUP010301.kmdc", formUrl: "https://ols.sbiz.or.kr", formType: "온라인 신청", match: 0, tags: ["제조업", "소공인", "시설자금"] },
  { id: "9", name: "ICT 이노베이션 스퀘어", org: "과학기술정보통신부", amount: "교육 + 프로젝트", deadline: "상시", target: "ICT 분야 창업자", category: "교육지원", url: "https://www.ictinnovation.kr", formUrl: "https://www.ictinnovation.kr/support/notice", formType: "온라인 신청", match: 0, tags: ["ICT", "AI", "교육", "네트워킹"] },
  { id: "10", name: "여성기업 특례보증", org: "기술보증기금", amount: "최대 5억원", deadline: "상시", target: "여성 대표 기업", category: "보증지원", url: "https://www.kibo.or.kr", formUrl: "https://www.kibo.or.kr/dbranch/index.do", formType: "온라인/방문", match: 0, tags: ["여성", "보증", "저금리"] },
  { id: "11", name: "지역특화산업육성 R&D", org: "중소벤처기업부", amount: "최대 2억원", deadline: "2026-06-30", target: "지역 소재 중소기업", category: "기술개발", url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116943", formUrl: "https://www.smtech.go.kr/front/ifg/no/notice02_list.do", formType: "HWP/PDF", match: 0, tags: ["지역", "R&D", "제조"] },
  { id: "12", name: "스마트공장 보급·확산", org: "중소벤처기업부", amount: "최대 1억원", deadline: "2026-05-31", target: "제조 중소기업", category: "스마트화", url: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116263", formUrl: "https://www.smart-factory.kr", formType: "온라인 신청", match: 0, tags: ["제조", "스마트공장", "디지털전환"] },
];

// ──── 사업계획서 섹션 ────
export const PLAN_SECTIONS = [
  { id: "overview", label: "사업 개요", icon: "📋" },
  { id: "product", label: "제품/서비스", icon: "🛍️" },
  { id: "market", label: "시장 분석", icon: "📊" },
  { id: "marketing", label: "마케팅 전략", icon: "📣" },
  { id: "finance", label: "재무 계획", icon: "💰" },
  { id: "team", label: "팀 구성", icon: "👥" },
];
