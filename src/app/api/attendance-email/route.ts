import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 환경변수가 설정되지 않았습니다");
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  try {
    const { className, date, students } = await req.json();

    if (!students || students.length === 0) {
      return NextResponse.json({ error: "학생 데이터가 없습니다" }, { status: 400 });
    }

    const statusKo = (s: string) =>
      s === "present" ? "출석" : s === "absent" ? "결석" : "지각";
    const statusEmoji = (s: string) =>
      s === "present" ? "✅" : s === "absent" ? "❌" : "⏰";

    const dateFormatted = new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

    let sent = 0;
    const errors: string[] = [];

    for (const student of students) {
      if (!student.parentEmail) continue;

      const status = student.status || "present";

      try {
        await getResend().emails.send({
          from: "ilpro.ai 출석알림 <attendance@ilpro.ai>",
          to: student.parentEmail,
          subject: `[출석알림] ${student.name} 학생 ${dateFormatted} ${statusKo(status)}`,
          html: `
            <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 20px; color: #111; margin: 0;">출석 알림</h1>
                <p style="font-size: 14px; color: #666; margin: 6px 0 0;">${dateFormatted}</p>
              </div>

              <div style="background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                <div style="text-align: center;">
                  <span style="font-size: 48px;">${statusEmoji(status)}</span>
                  <h2 style="font-size: 22px; color: #111; margin: 12px 0 4px;">
                    ${student.name}
                  </h2>
                  <p style="font-size: 14px; color: #666; margin: 0;">
                    ${className || "반"}
                  </p>
                  <div style="margin-top: 16px; padding: 10px 24px; border-radius: 8px; display: inline-block;
                    background: ${status === "present" ? "#dcfce7" : status === "absent" ? "#fee2e2" : "#fef3c7"};
                    color: ${status === "present" ? "#16a34a" : status === "absent" ? "#dc2626" : "#d97706"};">
                    <span style="font-size: 18px; font-weight: 700;">
                      ${statusKo(status)}
                    </span>
                  </div>
                </div>
              </div>

              <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
                ilpro.ai 출석 관리 시스템
              </p>
            </div>
          `,
        });
        sent++;
      } catch (emailErr: any) {
        errors.push(`${student.name}: ${emailErr.message}`);
      }
    }

    return NextResponse.json({ sent, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
