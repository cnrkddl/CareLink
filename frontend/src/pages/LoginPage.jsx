// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();



  // 1) 페이지 진입 시: ?login=success 있으면 즉시 홈으로
  useEffect(() => {
    const params = new URLSearchParams(location.search || window.location.search || "");
    if (params.get("login") === "success") {
      navigate("/home", { replace: true });
    }
  }, [location, navigate]);

  // 2) 로그인 상태면 홈으로 (쿠키 이미 있으면 빠르게 통과)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/kakao/whoami`, {
          credentials: "include",
        });
        const me = await res.json();
        if (!alive) return;
        if (me?.logged_in) {
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error("Login fail processing error:", err);
      }
    })();
    return () => { alive = false; };
  }, [location.search, navigate]);

  const handleKakaoLogin = () => {
    setLoading(true);
    // 페이지 이동이어야 함 (fetch X)
    window.location.assign(`${API_BASE}/auth/kakao/login`);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.backgroundDecoration}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
      </div>

      <div className="glass-card" style={styles.card}>
        <div style={styles.logoContainer}>
          <img
            src="https://search.pstatic.net/sunny/?src=https%3A%2F%2Flh3.googleusercontent.com%2FvIEP7BRkOXpvJCTKH6c_zs78w2CfZer0fSrkkBN_zhYr4WF9o9H5ffJ23IGisjW45w%3Dh500&type=sc960_832"
            alt="효림의료재단 로고"
            style={styles.logo}
          />
        </div>

        <div style={styles.content}>
          <h1 className="gradient-text" style={styles.title}>효림요양병원</h1>
          <h2 style={styles.subtitle}>AI 챗봇 서비스</h2>
          <p style={styles.description}>
            환자 상태 확인부터 간편한 챗봇 상담까지<br />
            보호자님을 위해 항상 열려있습니다.
          </p>

          <button
            onClick={handleKakaoLogin}
            style={styles.kakaoBtn}
            disabled={loading}
          >
            {loading ? (
              <div style={styles.loadingContent}>
                <div style={styles.spinner}></div>
                <span>연결 중...</span>
              </div>
            ) : (
              <div style={styles.btnContent}>
                <span style={styles.kakaoIcon}>💬</span>
                <span>카카오로 3초만에 시작하기</span>
              </div>
            )}
          </button>



          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIconWrap}>🔒</div>
              <span style={styles.featureText}>안전한 인증</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIconWrap}>😊</div>
              <span style={styles.featureText}>따뜻한 상담</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIconWrap}>⚡</div>
              <span style={styles.featureText}>실시간 확인</span>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .card-anim { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
          button:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(254, 229, 0, 0.4);
          }
          button:not(:disabled):active {
            transform: translateY(1px);
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  backgroundDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  circle1: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(75,110,245,0.15) 0%, rgba(255,255,255,0) 70%)", top: "-10%", left: "-10%", animation: "float 6s ease-in-out infinite" },
  circle2: { position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(75,110,245,0.1) 0%, rgba(255,255,255,0) 70%)", bottom: "5%", right: "-5%", animation: "float 8s ease-in-out infinite reverse" },
  circle3: { position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(58,91,224,0.08) 0%, rgba(255,255,255,0) 70%)", top: "40%", left: "60%", animation: "float 5s ease-in-out infinite 1s" },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: "48px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
    animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  logoContainer: { textAlign: "center", marginBottom: 16 },
  logo: { width: 90, height: 90, objectFit: "contain", dropShadow: "0 8px 16px rgba(0,0,0,0.1)" },
  content: { width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
  title: { fontSize: "2.5rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" },
  subtitle: { fontSize: "1.2rem", color: "#4B6EF5", fontWeight: 600, marginBottom: 16 },
  description: { fontSize: "0.95rem", color: "#718096", marginBottom: 32, lineHeight: 1.6 },
  kakaoBtn: {
    width: "100%", height: 52, borderRadius: 14, border: "none", background: "#FEE500",
    color: "#000000", fontWeight: 700, fontSize: "16px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "0 4px 12px rgba(254, 229, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },


  loadingContent: { display: "flex", alignItems: "center", gap: 10 },
  spinner: { border: "3px solid rgba(0,0,0,0.1)", borderTop: "3px solid #000", borderRadius: "50%", width: 20, height: 20, animation: "spin 1s linear infinite" },
  btnContent: { display: "flex", alignItems: "center", gap: 8 },
  kakaoIcon: { fontSize: "1.3rem" },
  features: { display: "flex", justifyContent: "space-between", width: "100%", marginTop: 40, padding: "0 10px" },
  feature: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  featureIconWrap: { width: 40, height: 40, borderRadius: 12, background: "rgba(75, 110, 245, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#4B6EF5" },
  featureText: { fontSize: "0.85rem", color: "#718096", fontWeight: 500 },
};
