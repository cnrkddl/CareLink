// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import LoginPage       from './pages/LoginPage';
import HomePage        from './pages/HomePage';
import ChatBotPage     from './pages/ChatBotPage';
import PatientInfoPage from './pages/PatientInfoPage';
import FeedbackPage    from './pages/FeedbackPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

  // 로그인 상태 확인 및 사용자 정보 가져오기
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/kakao/whoami`, {
          credentials: "include",
        });
        const me = await res.json();
        
        if (me?.logged_in) {
          setIsLoggedIn(true);
          // 카카오 닉네임을 localStorage에 저장
          if (me.nickname) {
            localStorage.setItem("kakao_nickname", me.nickname);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("로그인 상태 확인 실패:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [API_BASE]);

  return (
    <Router>
      <Routes>
        {!isLoggedIn ? (
          // 로그인 전: 로그인 페이지로 고정
          <>
            <Route
              path="/"
              element={<LoginPage onLogin={() => setIsLoggedIn(true)} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // 로그인 후 접근 가능 라우트
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatBotPage />} />
            {/* 기본 /patient 접근 시 기본 환자번호로 리다이렉트 */}
            <Route path="/patient" element={<Navigate to="/patient/25-0000032" replace />} />
            {/* 환자번호 파라미터 라우트 */}
            <Route path="/patient/:patientId" element={<PatientInfoPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            {/* 나머지는 홈으로 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
