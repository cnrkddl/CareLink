//홈페이지
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const HomePage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("보호자"); // 기본값은 보호자
  const [userPatients, setUserPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

  useEffect(() => {
    // 카카오 닉네임을 우선적으로 가져오기
    const kakaoNickname = localStorage.getItem("kakao_nickname");
    const storedNickname = localStorage.getItem("nickname");

    if (kakaoNickname) {
      setNickname(kakaoNickname);
    } else if (storedNickname) {
      setNickname(storedNickname);
    }

    // 사용자의 환자 정보 가져오기
    fetchUserPatients();
  }, []);

  const fetchUserPatients = async () => {
    try {
      const response = await fetch(`${API_BASE}/my-patients`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        window.location.href = "/";
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setUserPatients(data.patients);
        }
      }
    } catch (error) {
      console.error('환자 정보 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <h1 style={styles.mainTitle}>효림의료재단 챗봇입니다</h1>
        <p style={styles.description}>
          {nickname}님, 무엇을 도와드릴까요?
        </p>

        {/* 사용자의 환자 정보 표시 */}
        {!loading && userPatients.length > 0 && (
          <div className="glass-card" style={styles.patientSection}>
            <h3 style={styles.patientTitle}>내 환자 정보</h3>
            <div style={styles.patientCards}>
              {userPatients.map((patient, index) => (
                <div key={index} className="glass-card" style={styles.patientCard}>
                  <div style={styles.patientHeader}>
                    <h4 style={styles.patientName}>{patient.patient_name}</h4>
                    <span style={styles.relationship}>{patient.relationship}</span>
                  </div>
                  <div style={styles.patientInfo}>
                    <p style={styles.patientDetail}>
                      <strong>환자번호:</strong> {patient.patient_id}
                    </p>
                    {patient.room_number && (
                      <p style={styles.patientDetail}>
                        <strong>병실:</strong> {patient.room_number}호
                      </p>
                    )}
                    {patient.birth_date && (
                      <p style={styles.patientDetail}>
                        <strong>생년월일:</strong> {patient.birth_date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.cardContainer}>
          <div className="glass-card" style={styles.card}>
            <div>
              <h3 style={{ ...styles.cardTitle, margin: '0 0 4px 0' }}>대표번호</h3>
              <p style={{ ...styles.cardText, margin: 0, marginBottom: '24px' }}>031-919-0041</p>
            </div>
            <div>
              <h3 style={{ ...styles.cardTitle, margin: '0 0 4px 0' }}>입원상담</h3>
              <p style={{ ...styles.cardText, margin: 0 }}>010-4130-0041</p>
            </div>
          </div>

          <div className="glass-card" style={styles.card}>
            <h3 style={styles.cardTitle}>외래 진료시간 안내</h3>
            <p style={styles.cardText}>
              평일 08:30 ~ 17:30<br />
              토요일 08:30 ~ 13:00
            </p>
          </div>
        </div>

        <div style={styles.menuCardContainer}>
          <div
            style={styles.menuCard}
            onClick={() => navigate('/chat')}
            className="menu-btn glass-card"
          >
            <div style={styles.menuIcon}>💬</div>
            <span>챗봇 질문하기</span>
          </div>
          <div
            style={styles.menuCard}
            onClick={() => navigate('/patient-info')}
            className="menu-btn glass-card"
          >
            <div style={styles.menuIcon}>🧑‍⚕️</div>
            <span>환자 상태 보기</span>
          </div>
          <div
            style={styles.menuCard}
            onClick={() => navigate('/feedback')}
            className="menu-btn glass-card"
          >
            <div style={styles.menuIcon}>📝</div>
            <span>고객 평가 남기기</span>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        경기도 고양시 일산서구 주화로 88 효림빌딩   /   {' '}
        <a
          href="http://hyorim-h.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hospital-link"
        >
          효림요양병원 홈페이지
        </a>

        <style>
          {`
            .hospital-link {
              color: #f1f1f1;
              text-decoration: underline;
              transition: color 0.3s ease;
            }
            .hospital-link:hover {
              color: #005BAC;
            }
            .menu-btn {
              transition: transform 0.2s ease, background-color 0.2s ease;
            }
            .menu-btn:hover {
              transform: translateY(-3px);
              background-color: #f0f8ff;
            }
          `}
        </style>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    backgroundImage: `url("http://hyorim-h.com/images/greetings-img-3.png")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "var(--font-family)",
    position: 'relative',
  },
  main: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '48px 32px',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative',
    zIndex: 1,
  },
  mainTitle: {
    fontSize: '2.4rem',
    color: 'var(--primary-color)',
    fontWeight: '800',
    marginBottom: '12px',
    lineHeight: '1.4',
    letterSpacing: '-0.5px',
  },
  description: {
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    marginBottom: '48px',
    fontWeight: '500',
  },
  cardContainer: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    marginBottom: '48px',
    flexWrap: 'wrap',
  },
  card: {
    padding: '32px 24px',
    minWidth: '320px',
    flex: 1,
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    border: 'none',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--primary-color)',
    marginBottom: '8px',
  },
  cardText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    marginBottom: '8px',
    lineHeight: '1.6',
  },
  menuCardContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginTop: '20px',
  },
  menuCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px 32px',
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
    border: 'none',
    minWidth: '220px',
    borderRadius: '20px',
  },
  menuIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  footer: {
    textAlign: 'center',
    padding: '24px 0',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    marginTop: 'auto',
    position: 'relative',
    zIndex: 1,
  },
  patientSection: {
    marginBottom: '40px',
    padding: '32px',
    border: 'none',
  },
  patientTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '24px',
    textAlign: 'center',
  },
  patientCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  patientCard: {
    padding: '24px',
    border: 'none',
    textAlign: 'left',
  },
  patientHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)'
  },
  patientName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: '0'
  },
  relationship: {
    background: 'var(--primary-gradient)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  patientDetail: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
};

export default HomePage;