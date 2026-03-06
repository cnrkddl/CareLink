import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthActions from "./AuthActions"; // ✅ 로그아웃/연결해제 버튼

export default function Header({ onFAQClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const isChatPage = pathname === "/chat";

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";
        const res = await fetch(`${API_BASE}/auth/kakao/whoami`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.logged_in) {
            setUserInfo(data);
          }
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        padding: "0 1rem",
        borderBottom: "1px solid #ddd",
        background: "#fff",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
      }}
    >
      {/* 🔹 왼쪽 로고: 텍스트 대신 이미지 */}
      <img
        src="https://search.pstatic.net/sunny/?src=https%3A%2F%2Flh3.googleusercontent.com%2FvIEP7BRkOXpvJCTKH6c_zs78w2CfZer0fSrkkBN_zhYr4WF9o9H5ffJ23IGisjW45w%3Dh500&type=sc960_832"
        alt="효림의료재단 로고"
        style={{
          height: 40,             // 헤더 높이에 맞게 적당히
          objectFit: "contain",
          cursor: "pointer",
          display: "block",
        }}
        onClick={() => navigate("/home")} // 홈으로 이동 (기존과 동일)
      />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {isChatPage && (
          <button style={buttonStyle} onClick={onFAQClick} aria-label="FAQ">
            ?
          </button>
        )}
        
        {/* 사용자 프로필 정보 */}
        {userInfo && (
          <div style={styles.userProfile}>
            {/* 프로필 사진 */}
            <div style={styles.profileImage}>
              {userInfo.profile_image ? (
                <img 
                  src={userInfo.profile_image} 
                  alt="프로필" 
                  style={styles.profileImg}
                />
              ) : (
                <div style={styles.profileInitial}>
                  {userInfo.nickname ? userInfo.nickname.charAt(0) : "U"}
                </div>
              )}
            </div>
            
            {/* 이메일 */}
            <span style={styles.userEmail}>
              {userInfo.email || "이메일 없음"}
            </span>
          </div>
        )}
        
        {/* ✅ 오른쪽에 로그아웃/연결해제 버튼 */}
        <AuthActions />
      </div>
    </header>
  );
}

const buttonStyle = {
  width: 40,
  height: 40,
  fontSize: "1.25rem",
  borderRadius: "50%",
  border: "none",
  background: "#f5f5f5",
  fontWeight: "bold",
  cursor: "pointer",
  color: "#333",
};

const styles = {
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 8px",
    borderRadius: "20px",
    background: "#f8f9fa",
    border: "1px solid #e9ecef",
  },
  profileImage: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#007bff",
  },
  profileImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  profileInitial: {
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: "12px",
    color: "#495057",
    fontWeight: "500",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};