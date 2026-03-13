// src/routes/Router.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NotificationToast from '../components/NotificationToast';
import { useState, useEffect } from "react";

// 페이지 컴포넌트 경로는 프로젝트 구조에 맞게 조정하세요.
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ChatBotPage from '../pages/ChatBotPage';
import PatientInfoPage from '../pages/PatientInfoPage';
import FeedbackPage from '../pages/FeedbackPage';

export default function AppRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Temporarily hardcoded for verification

  return (
    <BrowserRouter>
      <NotificationToast />
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* 기본 진입은 /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat" element={<ChatBotPage />} />
            <Route path="/patient" element={<Navigate to="/patient/25-0000032" replace />} />
            <Route path="/patient/:patientId" element={<PatientInfoPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
