"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const fmt = (n: number) => "₩" + n.toLocaleString();
const EMP_TYPES: Record<string, string> = { fulltime: "정규직", parttime: "파트타임" };

export default function PayrollPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [calcResult, setCalcResult] = useState<any>(null);

  const loadEmp = useCallback(async () => {
    const { data } = await supabase.from("employees").select("*").eq("user_id", userId).eq("active", true).order("name");
    setEmployees(data || []);
  }, [userId]);

  const loadPayroll = useCallback(async () => {
    const { data } = await supabase.from("payroll").select("*, employees(name, position)").eq("user_id", userId).eq("pay_month", month).order("created_at", { ascending: false });
    setPayrolls(data || []);
  }, [userId, month]);

  useEffect(() => { loadEmp(); loadPayroll(); }, [loadEmp, loadPayroll]);

  async function saveEmployee(f: any) {
    if (f.id) { await supabase.from("employees").update(f).eq("id", f.id); }
    else { await supabase.from("employees").insert({ ...f, user_id: userId }); }
    closeModal(); loadEmp();
  }

  async function deleteEmployee(id: number) {
    if (!confirm("삭제?")) return;
    await supabase.from("employees").update({ active: false }).eq("id", id);
    closeModal(); loadEmp();
  }

  async function calculate(empId: number, hours: number, overtime: number, bonus: number) {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const basePay = emp.emp_type === "fulltime" ? Number(emp.base_salary) : hours * Number(emp.hourly_rate);
    const totalPay = basePay + overtime + bonus;
    const np = Math.round(totalPay * 0.045);
    const hi = Math.round(totalPay * 0.03545);
    const ei = Math.round(totalPay * 0.009);
    const tax = totalPay > 1500000 ? Math.round((totalPay - 1500000) * 0.06) : 0;
    const totalDeduction = np + hi + ei + tax;
    const netPay = totalPay - totalDeduction;

    const row = {
      user_id: userId, employee_id: empId, pay_month: month,
      work_hours: hours, base_pay: basePay, overtime_pay: overtime, bonus,
      total_pay: totalPay, national_pension: np, health_insurance: hi,
      employment_insurance: ei, income_tax: tax, total_deduction: totalDeduction, net_pay: netPay,
    };

    await supabase.from("payroll").insert(row);
    setCalcResult({ ...row, emp_name: emp.name });
    loadPayroll();
  }

  const totalPayroll = payrolls.reduce((s, p) => s + Number(p.net_pay), 0);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">급여관리</h4>
        <button onClick={() => openModal("직원 추가", <EmployeeForm onSave={saveEmployee} />, "bottom")} className="text-[var(--primary)] text-sm font-medium">+ 직원</button>
      </div>

      {/* Employee list */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-[var(--gray-500)] mb-2">직원 목록</div>
        {employees.length === 0 ? (
          <div className="text-center py-8 text-[var(--gray-400)]"><div className="text-3xl mb-2">👥</div>직원을 등록하세요</div>
        ) : employees.map((e) => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border mb-2">
            <div className="w-9 h-9 rounded-full bg-[#5856D6] text-white flex items-center justify-center text-sm font-bold shrink-0">{e.name[0]}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{e.name} <span className="text-[var(--gray-500)] font-normal">{e.position}</span></div>
              <div className="text-xs text-[var(--gray-500)]">{EMP_TYPES[e.emp_type]} · {e.emp_type === "fulltime" ? fmt(Number(e.base_salary)) + "/월" : fmt(Number(e.hourly_rate)) + "/시간"}</div>
            </div>
            <button onClick={() => openModal("급여 계산", <CalcForm emp={e} month={month} onCalc={calculate} />, "bottom")} className="text-xs text-[var(--primary)] font-medium">급여계산</button>
            <button onClick={() => openModal("직원 수정", <EmployeeForm emp={e} onSave={saveEmployee} onDelete={() => deleteEmployee(e.id)} />, "bottom")} className="text-xs text-[var(--gray-400)]">수정</button>
          </div>
        ))}
      </div>

      {/* Calc result */}
      {calcResult && (
        <div className="bg-[var(--primary-light)] rounded-xl p-4 mb-6 animate-[fadeIn_0.3s_ease]">
          <div className="text-sm font-bold mb-3">{calcResult.emp_name} {month} 급여</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-[var(--gray-500)]">기본급</div><div className="text-right">{fmt(calcResult.base_pay)}</div>
            {calcResult.overtime_pay > 0 && <><div className="text-[var(--gray-500)]">연장수당</div><div className="text-right">{fmt(calcResult.overtime_pay)}</div></>}
            {calcResult.bonus > 0 && <><div className="text-[var(--gray-500)]">상여금</div><div className="text-right">{fmt(calcResult.bonus)}</div></>}
            <div className="font-semibold border-t border-[var(--gray-300)] pt-1 mt-1">총지급액</div><div className="text-right font-semibold border-t border-[var(--gray-300)] pt-1 mt-1">{fmt(calcResult.total_pay)}</div>
            <div className="text-[var(--gray-500)]">국민연금</div><div className="text-right text-[var(--danger)]">-{fmt(calcResult.national_pension)}</div>
            <div className="text-[var(--gray-500)]">건강보험</div><div className="text-right text-[var(--danger)]">-{fmt(calcResult.health_insurance)}</div>
            <div className="text-[var(--gray-500)]">고용보험</div><div className="text-right text-[var(--danger)]">-{fmt(calcResult.employment_insurance)}</div>
            <div className="text-[var(--gray-500)]">소득세</div><div className="text-right text-[var(--danger)]">-{fmt(calcResult.income_tax)}</div>
            <div className="font-bold text-base border-t border-[var(--gray-300)] pt-2 mt-1">실수령액</div>
            <div className="text-right font-extrabold text-base text-[var(--primary)] border-t border-[var(--gray-300)] pt-2 mt-1">{fmt(calcResult.net_pay)}</div>
          </div>
          <button onClick={() => setCalcResult(null)} className="text-xs text-[var(--gray-500)] mt-3 block">닫기</button>
        </div>
      )}

      {/* Payroll history */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-[var(--gray-500)]">{month} 급여 내역</div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="text-xs outline-none border border-[var(--gray-200)] rounded-lg px-2 py-1" />
      </div>
      {payrolls.length === 0 ? (
        <div className="text-center py-6 text-[var(--gray-400)] text-sm">급여 내역이 없습니다</div>
      ) : (
        <>
          {payrolls.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border mb-2">
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.employees?.name || "?"} <span className="text-[var(--gray-500)] font-normal">{p.employees?.position}</span></div>
                <div className="text-xs text-[var(--gray-500)]">총지급 {fmt(Number(p.total_pay))} → 실수령 <strong className="text-[var(--primary)]">{fmt(Number(p.net_pay))}</strong></div>
              </div>
              <button onClick={async () => { if (confirm("삭제?")) { await supabase.from("payroll").delete().eq("id", p.id); loadPayroll(); } }} className="text-xs text-[var(--gray-400)]">✕</button>
            </div>
          ))}
          <div className="bg-[var(--gray-50)] rounded-xl p-3 mt-2 text-center">
            <div className="text-xs text-[var(--gray-500)]">총 실수령액 합계</div>
            <div className="text-lg font-extrabold text-[var(--primary)]">{fmt(totalPayroll)}</div>
          </div>
        </>
      )}
    </div>
  );
}

function EmployeeForm({ emp, onSave, onDelete }: { emp?: any; onSave: (d: any) => void; onDelete?: () => void }) {
  const [f, setF] = useState(emp || { name: "", position: "", emp_type: "fulltime", base_salary: 0, hourly_rate: 0, phone: "", start_date: "" });

  return (
    <div>
      <div className="ios-fields">
        <div className="ios-field"><label>이름</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="홍길동" /></div>
        <div className="ios-field"><label>직위</label><input value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} placeholder="주방장" /></div>
        <div className="ios-field"><label>유형</label>
          <select value={f.emp_type} onChange={(e) => setF({ ...f, emp_type: e.target.value })}>
            <option value="fulltime">정규직</option><option value="parttime">파트타임</option>
          </select>
        </div>
      </div>
      <div className="ios-fields">
        <div className="ios-field"><label>월급</label><input type="number" value={f.base_salary || ""} onChange={(e) => setF({ ...f, base_salary: e.target.value })} placeholder="정규직 월급" /></div>
        <div className="ios-field"><label>시급</label><input type="number" value={f.hourly_rate || ""} onChange={(e) => setF({ ...f, hourly_rate: e.target.value })} placeholder="파트타임 시급" /></div>
        <div className="ios-field"><label>전화</label><input value={f.phone || ""} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="010-1234-5678" /></div>
        <div className="ios-field"><label>입사일</label><input type="date" value={f.start_date || ""} onChange={(e) => setF({ ...f, start_date: e.target.value })} /></div>
      </div>
      <button onClick={() => { if (!f.name) return; onSave(f); }} className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm mt-2">저장</button>
      {onDelete && <div className="ios-danger" onClick={onDelete}>직원 삭제</div>}
    </div>
  );
}

function CalcForm({ emp, month, onCalc }: { emp: any; month: string; onCalc: (id: number, hours: number, ot: number, bonus: number) => void }) {
  const [hours, setHours] = useState(emp.emp_type === "parttime" ? "" : "0");
  const [overtime, setOvertime] = useState("0");
  const [bonus, setBonus] = useState("0");

  return (
    <div>
      <div className="text-sm font-semibold mb-4">{emp.name} — {month} 급여 계산</div>
      <div className="ios-fields">
        {emp.emp_type === "parttime" && (
          <div className="ios-field"><label>근무시간</label><input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="이번달 총 시간" /></div>
        )}
        <div className="ios-field"><label>연장수당</label><input type="number" value={overtime} onChange={(e) => setOvertime(e.target.value)} placeholder="0" /></div>
        <div className="ios-field"><label>상여금</label><input type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} placeholder="0" /></div>
      </div>
      <div className="text-xs text-[var(--gray-500)] mb-3 px-1">
        {emp.emp_type === "fulltime" ? `기본급: ${fmt(Number(emp.base_salary))}` : `시급: ${fmt(Number(emp.hourly_rate))} × ${hours || 0}시간 = ${fmt(Number(emp.hourly_rate) * (Number(hours) || 0))}`}
      </div>
      <button onClick={() => onCalc(emp.id, Number(hours) || 0, Number(overtime) || 0, Number(bonus) || 0)}
        className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm">계산 + 저장</button>
    </div>
  );
}
