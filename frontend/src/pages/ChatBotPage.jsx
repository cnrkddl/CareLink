// src/pages/ChatBotPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import FAQModal from '../components/FAQModal';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export default function ChatBotPage() {
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const toggleFAQ = () => setIsFAQOpen(prev => !prev);

  const handleSend = async () => {
    if (loading) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    const newUserMsg = { sender: 'user', text: trimmed };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 👉 쿠키 기반 인증에 필수
        body: JSON.stringify({
          message: trimmed,
          session_id: 'demo-web',
        }),
      });

      if (res.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${errText || ''}`);
      }

      const data = await res.json();
      const botText =
        data && typeof data.reply === 'string'
          ? data.reply
          : '⚠️ 알 수 없는 응답 형식입니다.';

      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: '⚠️ 서버 연결/처리 중 오류가 발생했습니다.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div style={styles.page}>
      <KeyframeStyles />

      <Header onFAQClick={toggleFAQ} />

      <div style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage),
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div style={styles.botMessage}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={styles.spinner} />
              <em style={{ color: '#555' }}>응답 생성 중...</em>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
        />
        <button
          style={styles.sendBtn}
          onClick={handleSend}
          disabled={!input.trim() || loading}
          aria-busy={loading}
        >
          전송
        </button>
      </div>

      {isFAQOpen && <FAQModal onClose={toggleFAQ} />}
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'linear-gradient(135deg, #f3f8ff 0%, #e9f0fa 100%)',
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
    color: '#2C2C2C',
  },
  chatArea: {
    flex: 1,
    padding: '24px 32px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    scrollBehavior: 'smooth',
  },
  message: {
    maxWidth: '75%',
    padding: '16px 20px',
    borderRadius: '20px',
    fontSize: '15px',
    lineHeight: 1.6,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    transform: 'translateY(10px)',
    opacity: 0,
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #4F7BFF, #3E64E3)',
    color: '#ffffff',
    borderTopRightRadius: '4px',
    boxShadow: '0 6px 20px rgba(79, 123, 255, 0.25)',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    color: '#2D3748',
    borderTopLeftRadius: '4px',
  },
  inputArea: {
    display: 'flex',
    padding: '20px 32px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.01)',
  },
  input: {
    flex: 1,
    padding: '16px 24px',
    borderRadius: '24px',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    outline: 'none',
    fontSize: '16px',
    background: '#ffffff',
    color: '#2D3748',
    fontFamily: 'inherit',
    boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.02)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  sendBtn: {
    marginLeft: 16,
    padding: '0 28px',
    border: 'none',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #4B6EF5, #3A5BE0)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(75, 110, 245, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 18,
    height: 18,
    border: '3px solid rgba(75, 110, 245, 0.2)',
    borderTop: '3px solid #4B6EF5',
    borderRadius: '50%',
    animation: 'spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
  },
};

const KeyframeStyles = () => (
  <style>{`
    @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    button:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
    button:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(75, 110, 245, 0.4) !important; }
    button:not(:disabled):active { transform: translateY(1px); }
    input:focus { border-color: #4B6EF5 !important; box-shadow: 0 0 0 3px rgba(75, 110, 245, 0.1) !important; }
  `}</style>
);
