#!/bin/bash
SUPA_URL="https://ksrpjbexguujyvvulplk.supabase.co"
SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcnBqYmV4Z3V1anl2dnVscGxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMzM1OCwiZXhwIjoyMDkwNTA5MzU4fQ.JrYGXupah9UszurMeC1TstvPWXCgFdD7H6mNV7kvzp8"
DEMO_UID="f0f059f7-643f-4930-be36-177c4a31cb23"
TODAY=$(date +%Y-%m-%d)
T1=$(date -v+1d +%Y-%m-%d)
T2=$(date -v+2d +%Y-%m-%d)
T3=$(date -v+3d +%Y-%m-%d)
T5=$(date -v+5d +%Y-%m-%d)
D1=$(date -v-1d +%Y-%m-%d)
D2=$(date -v-2d +%Y-%m-%d)
D3=$(date -v-3d +%Y-%m-%d)

H="apikey: $SUPA_KEY"
A="Authorization: Bearer $SUPA_KEY"
C="Content-Type: application/json"
P="Prefer: return=minimal"

# Contacts
echo "Adding contacts..."
curl -s -X POST "$SUPA_URL/rest/v1/contacts" -H "$H" -H "$A" -H "$C" -H "$P" -d "[
{\"user_id\":\"$DEMO_UID\",\"name\":\"김민수\",\"company\":\"(주)한국제조\",\"position\":\"과장\",\"phone\":\"010-1234-5678\",\"email\":\"kim@hankook.co.kr\",\"group_name\":\"거래처\",\"notes\":\"주력 거래처\",\"favorite\":true},
{\"user_id\":\"$DEMO_UID\",\"name\":\"박진수\",\"company\":\"울산정밀(주)\",\"position\":\"대리\",\"phone\":\"010-9876-5432\",\"email\":\"park@precision.kr\",\"group_name\":\"거래처\",\"favorite\":true},
{\"user_id\":\"$DEMO_UID\",\"name\":\"최영호\",\"company\":\"(주)부산스틸\",\"position\":\"부장\",\"phone\":\"010-5555-1234\",\"group_name\":\"거래처\"},
{\"user_id\":\"$DEMO_UID\",\"name\":\"김철수\",\"phone\":\"010-1111-0001\",\"group_name\":\"단골\",\"notes\":\"매주 목요일. 갈비탕\",\"favorite\":true},
{\"user_id\":\"$DEMO_UID\",\"name\":\"이미영\",\"phone\":\"010-1111-0002\",\"group_name\":\"고객\"},
{\"user_id\":\"$DEMO_UID\",\"name\":\"박서연\",\"company\":\"신선식자재\",\"position\":\"영업\",\"phone\":\"010-2222-0001\",\"group_name\":\"거래처\",\"notes\":\"채소류 매주 월요일\",\"favorite\":true},
{\"user_id\":\"$DEMO_UID\",\"name\":\"문상훈\",\"position\":\"주방장\",\"phone\":\"010-3333-0001\",\"group_name\":\"직원\",\"notes\":\"정규직\"},
{\"user_id\":\"$DEMO_UID\",\"name\":\"나은비\",\"position\":\"서빙\",\"phone\":\"010-3333-0002\",\"group_name\":\"직원\",\"notes\":\"파트타임\"},
{\"user_id\":\"$DEMO_UID\",\"name\":\"김세무\",\"company\":\"세무법인\",\"position\":\"세무사\",\"phone\":\"010-4444-0001\",\"group_name\":\"파트너\",\"favorite\":true},
{\"user_id\":\"$DEMO_UID\",\"name\":\"강수현\",\"company\":\"삼성ENG\",\"position\":\"매니저\",\"phone\":\"010-2222-6666\",\"group_name\":\"거래처\"}
]"
echo " Done"

# Schedules
echo "Adding schedules..."
curl -s -X POST "$SUPA_URL/rest/v1/schedules" -H "$H" -H "$A" -H "$C" -H "$P" -d "[
{\"user_id\":\"$DEMO_UID\",\"title\":\"한국제조 김과장 미팅\",\"start_date\":\"$TODAY\",\"start_time\":\"14:00\",\"description\":\"견적서 협의\",\"color\":\"#0071E3\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"박지현 6명 예약\",\"start_date\":\"$TODAY\",\"start_time\":\"18:00\",\"description\":\"2층 단체석\",\"color\":\"#FF6B35\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"식자재 발주 마감\",\"start_date\":\"$T1\",\"start_time\":\"10:00\",\"description\":\"신선식자재 + 울산축산\",\"color\":\"#FF3B30\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"알바 면접\",\"start_date\":\"$T1\",\"start_time\":\"15:00\",\"description\":\"서빙 2명\",\"color\":\"#5856D6\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"소방 점검\",\"start_date\":\"$T2\",\"start_time\":\"09:00\",\"color\":\"#FF9500\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"세무사 미팅\",\"start_date\":\"$T3\",\"start_time\":\"14:00\",\"description\":\"부가세 신고\",\"color\":\"#30D158\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"메뉴 사진 촬영\",\"start_date\":\"$T5\",\"start_time\":\"11:00\",\"description\":\"신메뉴 3종\",\"color\":\"#FF2D55\"}
]"
echo " Done"

# Notes
echo "Adding notes..."
curl -s -X POST "$SUPA_URL/rest/v1/notes" -H "$H" -H "$A" -H "$C" -H "$P" -d "[
{\"user_id\":\"$DEMO_UID\",\"title\":\"이번주 식자재 주문\",\"content\":\"당근 10kg\n양파 15kg\n대파 5단\n마늘 3kg\n소고기 20kg\",\"color\":\"#FFF3E0\",\"pinned\":true},
{\"user_id\":\"$DEMO_UID\",\"title\":\"신메뉴 아이디어\",\"content\":\"1. 매운 갈비찜 (겨울)\n2. 된장 파스타 (퓨전)\n3. 수제 만두 (포장)\",\"color\":\"#E8F5E9\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"직원 미팅 메모\",\"content\":\"- 서빙 속도 개선\n- 주말 인원 추가\n- 유니폼 교체\n- 메뉴판 리뉴얼\",\"color\":\"#FCE4EC\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"거래처 단가 비교\",\"content\":\"한국축산: 48,000원/kg\n울산축산: 52,000원\n부산스틸: 45,000원 (최저)\",\"color\":\"#E3F2FD\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"4월 마케팅 계획\",\"content\":\"1주차: 봄 신메뉴 출시\n2주차: 네이버 리뷰 이벤트\n3주차: 인스타 릴스\n4주차: 단골 감사 이벤트\",\"color\":\"#FFFFFF\"}
]"
echo " Done"

# Todos
echo "Adding todos..."
curl -s -X POST "$SUPA_URL/rest/v1/todos" -H "$H" -H "$A" -H "$C" -H "$P" -d "[
{\"user_id\":\"$DEMO_UID\",\"title\":\"한국제조 견적서 발송\",\"priority\":1},
{\"user_id\":\"$DEMO_UID\",\"title\":\"네이버 리뷰 답글 (3건)\",\"priority\":1},
{\"user_id\":\"$DEMO_UID\",\"title\":\"4월 식자재 발주서 작성\",\"due_date\":\"$T1\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"알바생 면접 (4/2 오후 3시)\",\"due_date\":\"$T2\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"세무사 미팅 준비\",\"due_date\":\"$T3\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"메뉴판 사진 촬영\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"소방 점검 신청\",\"due_date\":\"$T5\"},
{\"user_id\":\"$DEMO_UID\",\"title\":\"3월 급여 이체\",\"completed\":true},
{\"user_id\":\"$DEMO_UID\",\"title\":\"3월 매출 정리\",\"completed\":true},
{\"user_id\":\"$DEMO_UID\",\"title\":\"에어컨 필터 교체\",\"completed\":true}
]"
echo " Done"

# Ledger
echo "Adding ledger..."
curl -s -X POST "$SUPA_URL/rest/v1/ledger" -H "$H" -H "$A" -H "$C" -H "$P" -d "[
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$TODAY\",\"entry_type\":\"income\",\"description\":\"점심 영업\",\"amount\":1250000,\"payment_method\":\"카드\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$TODAY\",\"entry_type\":\"income\",\"description\":\"저녁 영업\",\"amount\":1850000,\"payment_method\":\"카드+현금\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$TODAY\",\"entry_type\":\"expense\",\"description\":\"식자재 납품\",\"amount\":320000,\"payment_method\":\"계좌이체\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D1\",\"entry_type\":\"income\",\"description\":\"점심 영업\",\"amount\":980000,\"payment_method\":\"카드\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D1\",\"entry_type\":\"income\",\"description\":\"저녁 영업\",\"amount\":1650000,\"payment_method\":\"카드+현금\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D1\",\"entry_type\":\"income\",\"description\":\"단체 회식 20명\",\"amount\":1800000,\"payment_method\":\"카드\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D1\",\"entry_type\":\"expense\",\"description\":\"한우 납품\",\"amount\":580000,\"payment_method\":\"계좌이체\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D2\",\"entry_type\":\"income\",\"description\":\"점심+저녁\",\"amount\":2300000,\"payment_method\":\"카드+현금\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D2\",\"entry_type\":\"expense\",\"description\":\"음료+주류\",\"amount\":450000,\"payment_method\":\"카드\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D3\",\"entry_type\":\"income\",\"description\":\"점심+저녁\",\"amount\":1900000,\"payment_method\":\"카드+현금\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D3\",\"entry_type\":\"expense\",\"description\":\"전기요금\",\"amount\":350000,\"payment_method\":\"자동이체\"},
{\"user_id\":\"$DEMO_UID\",\"entry_date\":\"$D3\",\"entry_type\":\"expense\",\"description\":\"임대료\",\"amount\":2500000,\"payment_method\":\"계좌이체\"}
]"
echo " Done"

# Reservations
echo "Adding reservations..."
curl -s -X POST "$SUPA_URL/rest/v1/reservations" -H "$H" -H "$A" -H "$C" -H "$P" -d "[
{\"user_id\":\"$DEMO_UID\",\"customer_name\":\"김철수\",\"customer_phone\":\"010-1234-5678\",\"party_size\":4,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"12:00\",\"service\":\"갈비탕 4인\",\"notes\":\"단골\"},
{\"user_id\":\"$DEMO_UID\",\"customer_name\":\"이미영\",\"customer_phone\":\"010-9876-5432\",\"party_size\":2,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"12:30\",\"service\":\"점심 특선\"},
{\"user_id\":\"$DEMO_UID\",\"customer_name\":\"박지현\",\"customer_phone\":\"010-5555-1234\",\"party_size\":6,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"18:00\",\"service\":\"회식\",\"notes\":\"2층 단체석\"},
{\"user_id\":\"$DEMO_UID\",\"customer_name\":\"최수진\",\"customer_phone\":\"010-3333-7777\",\"party_size\":3,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"19:00\",\"service\":\"저녁\",\"status\":\"completed\"},
{\"user_id\":\"$DEMO_UID\",\"customer_name\":\"정동현\",\"customer_phone\":\"010-4444-8888\",\"party_size\":8,\"reservation_date\":\"$T1\",\"reservation_time\":\"12:00\",\"service\":\"회사 점심\",\"notes\":\"주차 3대\"},
{\"user_id\":\"$DEMO_UID\",\"customer_name\":\"강수현\",\"customer_phone\":\"010-2222-6666\",\"party_size\":2,\"reservation_date\":\"$T1\",\"reservation_time\":\"18:30\",\"service\":\"기념일 디너\",\"notes\":\"창가석+케이크\"}
]"
echo " Done"

echo "All sample data inserted!"
