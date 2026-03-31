#!/bin/bash
SUPA_URL="https://ksrpjbexguujyvvulplk.supabase.co"
SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcnBqYmV4Z3V1anl2dnVscGxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMzM1OCwiZXhwIjoyMDkwNTA5MzU4fQ.JrYGXupah9UszurMeC1TstvPWXCgFdD7H6mNV7kvzp8"
DU="f0f059f7-643f-4930-be36-177c4a31cb23"
TODAY=$(date +%Y-%m-%d)
T1=$(date -v+1d +%Y-%m-%d)
T2=$(date -v+2d +%Y-%m-%d)
T3=$(date -v+3d +%Y-%m-%d)
T5=$(date -v+5d +%Y-%m-%d)
D1=$(date -v-1d +%Y-%m-%d)
D2=$(date -v-2d +%Y-%m-%d)
D3=$(date -v-3d +%Y-%m-%d)

post() {
  curl -s -X POST "$SUPA_URL/rest/v1/$1" \
    -H "apikey: $SUPA_KEY" -H "Authorization: Bearer $SUPA_KEY" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" \
    -d "$2"
}

echo "Contacts..."
post contacts "{\"user_id\":\"$DU\",\"name\":\"김민수\",\"company\":\"(주)한국제조\",\"position\":\"과장\",\"phone\":\"010-1234-5678\",\"email\":\"kim@hankook.co.kr\",\"group_name\":\"거래처\",\"notes\":\"주력 거래처\",\"favorite\":true}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"박진수\",\"company\":\"울산정밀(주)\",\"position\":\"대리\",\"phone\":\"010-9876-5432\",\"email\":\"park@precision.kr\",\"group_name\":\"거래처\",\"favorite\":true}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"최영호\",\"company\":\"(주)부산스틸\",\"position\":\"부장\",\"phone\":\"010-5555-1234\",\"group_name\":\"거래처\",\"favorite\":false}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"김철수\",\"company\":\"\",\"position\":\"\",\"phone\":\"010-1111-0001\",\"group_name\":\"단골\",\"notes\":\"매주 목요일. 갈비탕\",\"favorite\":true}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"이미영\",\"company\":\"\",\"position\":\"\",\"phone\":\"010-1111-0002\",\"group_name\":\"고객\",\"favorite\":false}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"박서연\",\"company\":\"신선식자재\",\"position\":\"영업\",\"phone\":\"010-2222-0001\",\"group_name\":\"거래처\",\"notes\":\"채소 매주 월요일\",\"favorite\":true}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"문상훈\",\"company\":\"\",\"position\":\"주방장\",\"phone\":\"010-3333-0001\",\"group_name\":\"직원\",\"notes\":\"정규직\",\"favorite\":false}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"나은비\",\"company\":\"\",\"position\":\"서빙\",\"phone\":\"010-3333-0002\",\"group_name\":\"직원\",\"notes\":\"파트타임\",\"favorite\":false}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"김세무\",\"company\":\"세무법인\",\"position\":\"세무사\",\"phone\":\"010-4444-0001\",\"group_name\":\"파트너\",\"notes\":\"담당 세무사\",\"favorite\":true}"
post contacts "{\"user_id\":\"$DU\",\"name\":\"강수현\",\"company\":\"삼성ENG\",\"position\":\"매니저\",\"phone\":\"010-2222-6666\",\"group_name\":\"거래처\",\"notes\":\"대형 프로젝트\",\"favorite\":false}"
echo " OK"

echo "Schedules..."
post schedules "{\"user_id\":\"$DU\",\"title\":\"한국제조 미팅\",\"start_date\":\"$TODAY\",\"start_time\":\"14:00\",\"description\":\"견적서 협의\",\"color\":\"#0071E3\"}"
post schedules "{\"user_id\":\"$DU\",\"title\":\"박지현 6명 예약\",\"start_date\":\"$TODAY\",\"start_time\":\"18:00\",\"description\":\"2층 단체석\",\"color\":\"#FF6B35\"}"
post schedules "{\"user_id\":\"$DU\",\"title\":\"식자재 발주 마감\",\"start_date\":\"$T1\",\"start_time\":\"10:00\",\"description\":\"신선식자재\",\"color\":\"#FF3B30\"}"
post schedules "{\"user_id\":\"$DU\",\"title\":\"알바 면접\",\"start_date\":\"$T1\",\"start_time\":\"15:00\",\"description\":\"서빙 2명\",\"color\":\"#5856D6\"}"
post schedules "{\"user_id\":\"$DU\",\"title\":\"소방 점검\",\"start_date\":\"$T2\",\"start_time\":\"09:00\",\"description\":\"\",\"color\":\"#FF9500\"}"
post schedules "{\"user_id\":\"$DU\",\"title\":\"세무사 미팅\",\"start_date\":\"$T3\",\"start_time\":\"14:00\",\"description\":\"부가세 신고\",\"color\":\"#30D158\"}"
post schedules "{\"user_id\":\"$DU\",\"title\":\"메뉴 촬영\",\"start_date\":\"$T5\",\"start_time\":\"11:00\",\"description\":\"신메뉴 3종\",\"color\":\"#FF2D55\"}"
echo " OK"

echo "Notes..."
post notes "{\"user_id\":\"$DU\",\"title\":\"이번주 식자재\",\"content\":\"당근 10kg, 양파 15kg, 대파 5단, 마늘 3kg, 소고기 20kg\",\"color\":\"#FFF3E0\",\"pinned\":true}"
post notes "{\"user_id\":\"$DU\",\"title\":\"신메뉴 아이디어\",\"content\":\"1. 매운 갈비찜 2. 된장 파스타 3. 수제 만두\",\"color\":\"#E8F5E9\",\"pinned\":false}"
post notes "{\"user_id\":\"$DU\",\"title\":\"직원 미팅 메모\",\"content\":\"서빙 속도 개선, 주말 인원 추가, 유니폼 교체\",\"color\":\"#FCE4EC\",\"pinned\":false}"
post notes "{\"user_id\":\"$DU\",\"title\":\"거래처 단가\",\"content\":\"한국축산 48000, 울산축산 52000, 부산스틸 45000 (최저)\",\"color\":\"#E3F2FD\",\"pinned\":false}"
post notes "{\"user_id\":\"$DU\",\"title\":\"4월 마케팅\",\"content\":\"1주 봄 신메뉴, 2주 리뷰 이벤트, 3주 인스타 릴스, 4주 단골 감사\",\"color\":\"#FFFFFF\",\"pinned\":false}"
echo " OK"

echo "Todos..."
post todos "{\"user_id\":\"$DU\",\"title\":\"한국제조 견적서 발송\",\"completed\":false,\"priority\":1}"
post todos "{\"user_id\":\"$DU\",\"title\":\"네이버 리뷰 답글 3건\",\"completed\":false,\"priority\":1}"
post todos "{\"user_id\":\"$DU\",\"title\":\"식자재 발주서 작성\",\"completed\":false,\"priority\":0}"
post todos "{\"user_id\":\"$DU\",\"title\":\"알바 면접 준비\",\"completed\":false,\"priority\":0}"
post todos "{\"user_id\":\"$DU\",\"title\":\"세무사 미팅 서류\",\"completed\":false,\"priority\":0}"
post todos "{\"user_id\":\"$DU\",\"title\":\"메뉴판 사진 촬영\",\"completed\":false,\"priority\":0}"
post todos "{\"user_id\":\"$DU\",\"title\":\"3월 급여 이체\",\"completed\":true,\"priority\":0}"
post todos "{\"user_id\":\"$DU\",\"title\":\"3월 매출 정리\",\"completed\":true,\"priority\":0}"
echo " OK"

echo "Reservations..."
post reservations "{\"user_id\":\"$DU\",\"customer_name\":\"김철수\",\"customer_phone\":\"010-1234-5678\",\"party_size\":4,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"12:00\",\"service\":\"갈비탕\",\"status\":\"confirmed\",\"notes\":\"단골\",\"source\":\"direct\",\"reminder_sent\":false}"
post reservations "{\"user_id\":\"$DU\",\"customer_name\":\"이미영\",\"customer_phone\":\"010-9876-5432\",\"party_size\":2,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"12:30\",\"service\":\"점심특선\",\"status\":\"confirmed\",\"notes\":\"\",\"source\":\"direct\",\"reminder_sent\":false}"
post reservations "{\"user_id\":\"$DU\",\"customer_name\":\"박지현\",\"customer_phone\":\"010-5555-1234\",\"party_size\":6,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"18:00\",\"service\":\"회식\",\"status\":\"confirmed\",\"notes\":\"2층 단체석\",\"source\":\"direct\",\"reminder_sent\":false}"
post reservations "{\"user_id\":\"$DU\",\"customer_name\":\"최수진\",\"customer_phone\":\"010-3333-7777\",\"party_size\":3,\"reservation_date\":\"$TODAY\",\"reservation_time\":\"19:00\",\"service\":\"저녁\",\"status\":\"completed\",\"notes\":\"\",\"source\":\"direct\",\"reminder_sent\":false}"
post reservations "{\"user_id\":\"$DU\",\"customer_name\":\"정동현\",\"customer_phone\":\"010-4444-8888\",\"party_size\":8,\"reservation_date\":\"$T1\",\"reservation_time\":\"12:00\",\"service\":\"회사 점심\",\"status\":\"confirmed\",\"notes\":\"주차 3대\",\"source\":\"direct\",\"reminder_sent\":false}"
echo " OK"

echo "All done!"
