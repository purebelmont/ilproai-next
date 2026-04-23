"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Student {
  id: string;
  name: string;
  parent_email: string;
  class_name: string;
}

interface AttendanceRecord {
  student_id: string;
  status: "present" | "absent" | "late";
}

export default function AttendancePanel({ userId }: { userId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "late">>({});
  const [todayRecords, setTodayRecords] = useState<Record<string, string>>({});
  const [className, setClassName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", parent_email: "", class_name: "" });
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const loadStudents = useCallback(async () => {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .order("name");
    if (data) {
      setStudents(data);
      if (data.length > 0 && !className) setClassName(data[0].class_name || "");
      // Initialize all as present
      const initial: Record<string, "present" | "absent" | "late"> = {};
      data.forEach((s) => (initial[s.id] = "present"));
      setAttendance(initial);
    }
  }, [userId, className]);

  const loadTodayAttendance = useCallback(async () => {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today);
    if (data && data.length > 0) {
      const records: Record<string, string> = {};
      data.forEach((r: any) => (records[r.student_id] = r.status));
      setTodayRecords(records);
      setSent(true);
    }
  }, [userId, today]);

  useEffect(() => {
    loadStudents();
    loadTodayAttendance();
  }, [loadStudents, loadTodayAttendance]);

  const toggleStatus = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId];
      const next = current === "present" ? "absent" : current === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const handleSubmit = async () => {
    if (students.length === 0) return;
    setSending(true);
    setMessage("");

    try {
      // Save attendance records to Supabase
      const records = students.map((s) => ({
        user_id: userId,
        student_id: s.id,
        student_name: s.name,
        class_name: s.class_name || className,
        status: attendance[s.id] || "present",
        date: today,
        checked_at: new Date().toISOString(),
      }));

      // Delete existing records for today first
      await supabase.from("attendance").delete().eq("user_id", userId).eq("date", today);

      const { error } = await supabase.from("attendance").insert(records);
      if (error) throw error;

      // Send email notifications
      const res = await fetch("/api/attendance-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: className || "반",
          date: today,
          students: students.map((s) => ({
            name: s.name,
            parentEmail: s.parent_email,
            status: attendance[s.id] || "present",
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "이메일 발송 실패");

      setSent(true);
      setMessage(`출석 저장 완료! ${result.sent}명 학부모에게 이메일 발송됨`);
      loadTodayAttendance();
    } catch (err: any) {
      setMessage(`오류: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const addStudent = async () => {
    if (!newStudent.name || !newStudent.parent_email) return;
    const { error } = await supabase.from("students").insert({
      user_id: userId,
      name: newStudent.name,
      parent_email: newStudent.parent_email,
      class_name: newStudent.class_name || className || "1반",
    });
    if (!error) {
      setNewStudent({ name: "", parent_email: "", class_name: "" });
      loadStudents();
    }
  };

  const removeStudent = async (id: string) => {
    if (!confirm("이 학생을 삭제하시겠습니까?")) return;
    await supabase.from("students").delete().eq("id", id);
    loadStudents();
  };

  const statusLabel = (s: string) => (s === "present" ? "출석" : s === "absent" ? "결석" : "지각");
  const statusColor = (s: string) =>
    s === "present" ? "#22c55e" : s === "absent" ? "#ef4444" : "#f59e0b";
  const statusBg = (s: string) =>
    s === "present" ? "rgba(34,197,94,0.15)" : s === "absent" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text)" }}>
            출석체크
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {today} ({["일","월","화","수","목","금","토"][new Date().getDay()]}요일)
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: editMode ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
            color: "var(--text)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {editMode ? "완료" : "학생 관리"}
        </button>
      </div>

      {/* Student Management */}
      {editMode && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>
            학생 추가
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              placeholder="학생 이름"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="학부모 이메일"
              value={newStudent.parent_email}
              onChange={(e) => setNewStudent({ ...newStudent, parent_email: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="반 이름 (예: 1반)"
              value={newStudent.class_name}
              onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
              style={inputStyle}
            />
            <button onClick={addStudent} style={addBtnStyle}>
              + 학생 추가
            </button>
          </div>

          {students.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>
                등록된 학생 ({students.length}명)
              </h3>
              {students.map((s) => (
                <div key={s.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div>
                    <span style={{ color: "var(--text)", fontSize: 14 }}>{s.name}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 12, marginLeft: 8 }}>
                      {s.parent_email}
                    </span>
                  </div>
                  <button onClick={() => removeStudent(s.id)}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance Check */}
      {!editMode && students.length === 0 && (
        <div style={{
          textAlign: "center", padding: 40, color: "var(--text-secondary)",
          background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>👨‍🎓</p>
          <p style={{ fontSize: 14 }}>등록된 학생이 없습니다</p>
          <p style={{ fontSize: 13 }}>&quot;학생 관리&quot; 버튼을 눌러 학생을 추가하세요</p>
        </div>
      )}

      {!editMode && students.length > 0 && (
        <>
          {/* Already sent today */}
          {sent && Object.keys(todayRecords).length > 0 && (
            <div style={{
              background: "rgba(34,197,94,0.1)", borderRadius: 12, padding: 14,
              marginBottom: 16, border: "1px solid rgba(34,197,94,0.2)",
            }}>
              <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 600, margin: 0 }}>
                오늘 출석이 이미 완료되었습니다
              </p>
              <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {students.map((s) => (
                  <span key={s.id} style={{
                    fontSize: 12, padding: "2px 8px", borderRadius: 6,
                    background: statusBg(todayRecords[s.id] || "present"),
                    color: statusColor(todayRecords[s.id] || "present"),
                  }}>
                    {s.name}: {statusLabel(todayRecords[s.id] || "present")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attendance grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
            {students.map((s) => {
              const status = attendance[s.id] || "present";
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStatus(s.id)}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: `2px solid ${statusColor(status)}`,
                    background: statusBg(status),
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    {s.name}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: statusColor(status),
                  }}>
                    {statusLabel(status)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 4 }}>
                    탭하여 변경
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 20, marginBottom: 16,
            fontSize: 13, color: "var(--text-secondary)",
          }}>
            <span>출석 <b style={{ color: "#22c55e" }}>
              {Object.values(attendance).filter((v) => v === "present").length}
            </b></span>
            <span>결석 <b style={{ color: "#ef4444" }}>
              {Object.values(attendance).filter((v) => v === "absent").length}
            </b></span>
            <span>지각 <b style={{ color: "#f59e0b" }}>
              {Object.values(attendance).filter((v) => v === "late").length}
            </b></span>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={sending}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: sending ? "#555" : "linear-gradient(135deg, #8B5CF6, #6366F1)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: sending ? "not-allowed" : "pointer",
            }}
          >
            {sending ? "발송 중..." : "출석 저장 + 학부모 이메일 발송"}
          </button>

          {message && (
            <p style={{
              textAlign: "center", fontSize: 13, marginTop: 12,
              color: message.startsWith("오류") ? "#ef4444" : "#22c55e",
            }}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
};

const addBtnStyle: React.CSSProperties = {
  padding: "10px 0",
  borderRadius: 8,
  border: "1px dashed rgba(139,92,246,0.4)",
  background: "rgba(139,92,246,0.1)",
  color: "#A78BFA",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
