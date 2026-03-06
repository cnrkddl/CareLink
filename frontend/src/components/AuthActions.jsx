// src/components/AuthActions.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

/**
 * 로그아웃(세션 종료) / 연결해제(카카오-앱 연결 끊기)
 * - 백엔드 라우트: POST /auth/kakao/logout, POST /auth/kakao/unlink
 * - 쿠키 전송을 위해 credentials: "include" 필수
 */
export default function AuthActions() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const post = async (path /* '/auth/kakao/logout' | '/auth/kakao/unlink' */) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Request failed: ${res.status}`);
      }
      // 응답은 {"ok": true} 예상. 세션/쿠키가 정리되었으니 로그인 화면으로.
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      alert("요청 실패: " + (err?.message || err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <button
        style={styles.lightBtn}
        onClick={() => post("/auth/kakao/logout")}
        disabled={busy}
        title="세션만 종료"
      >
        {busy ? "처리 중..." : "로그아웃"}
      </button>

      <button
        style={styles.dangerBtn}
        onClick={() => post("/auth/kakao/unlink")}
        disabled={busy}
        title="카카오-앱 연결 해제"
      >
        {busy ? "처리 중..." : "연결해제"}
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", gap: 8, alignItems: "center" },
  lightBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  dangerBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #d33",
    background: "#ffefef",
    color: "#a00",
    cursor: "pointer",
    fontWeight: 700,
  },
};