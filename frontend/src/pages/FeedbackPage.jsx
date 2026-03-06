import React, { useState } from 'react';
import Header from '../components/Header';

const FeedbackPage = () => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

  const getStarWidth = (index) => {
    const rating = hoverRating || selectedRating;
    const value = index + 1;
    if (rating >= value) return "100%";
    return "0%";
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      alert("별점을 선택해주세요!");
      return;
    }

    if (comment.trim() === "") {
      alert("의견을 입력해주세요!");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: selectedRating,
          comment: comment.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/";
        return;
      }

      if (response.ok) {
        setSubmitStatus('success');
        // 성공 후 폼 초기화
        setTimeout(() => {
          setSelectedRating(0);
          setComment("");
          setSubmitStatus(null);
        }, 2000);
      } else {
        throw new Error('피드백 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedRating(0);
    setComment("");
    setSubmitStatus(null);
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h2 style={styles.title}>만족도 평가</h2>
        <p style={styles.subtitle}>서비스는 만족스러우셨나요?</p>

        {/* 성공/실패 메시지 */}
        {submitStatus === 'success' && (
          <div style={styles.successMessage}>
            ✅ 답변 감사합니다!
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={styles.errorMessage}>
            ❌ 답변 저장에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        <div style={styles.stars}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={styles.starWrapper}
              onMouseMove={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setSelectedRating(i + 1)}
            >
              <span style={styles.starBg}>★</span>
              <span style={{ ...styles.starFg, width: getStarWidth(i) }}>★</span>
            </div>
          ))}
        </div>

        <div style={styles.ratingText}>
          {selectedRating ? `현재 평점: ${selectedRating}점` : "별점을 선택해주세요"}
        </div>

        <textarea
          style={styles.commentBox}
          placeholder="서비스에 대한 의견을 자유롭게 작성해주세요."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />

        <div style={styles.charCount}>
          {comment.length}/500자
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={styles.resetBtn}
            onClick={resetForm}
            disabled={isSubmitting}
          >
            다시 작성
          </button>

          <button
            style={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting || selectedRating === 0 || comment.trim() === ""}
          >
            {isSubmitting ? "저장 중..." : "제출하기"}
          </button>
        </div>
      </div>

      <style>{`
        button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
      `}</style>
    </>
  );
};

const styles = {
  container: {
    width: "480px",
    background: "var(--surface-color)",
    backdropFilter: "var(--surface-blur)",
    border: "1px solid rgba(255,255,255,0.6)",
    padding: "48px 40px",
    borderRadius: "24px",
    boxShadow: "var(--shadow-lg)",
    margin: "80px auto",
    fontFamily: "var(--font-family)",
    boxSizing: "border-box",
    animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "var(--primary-color)",
    textAlign: "center",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "17px",
    color: "var(--text-muted)",
    textAlign: "center",
    marginBottom: "32px",
  },
  stars: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  starWrapper: {
    position: "relative",
    width: "44px",
    height: "44px",
    cursor: "pointer",
    transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  starBg: {
    fontSize: "44px",
    color: "rgba(0,0,0,0.08)",
    position: "absolute",
    top: 0,
    left: 0,
  },
  starFg: {
    fontSize: "44px",
    color: "#FEE500",
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    textShadow: "0 2px 10px rgba(254, 229, 0, 0.4)",
  },
  ratingText: {
    textAlign: "center",
    fontSize: "16px",
    color: "var(--text-main)",
    fontWeight: "600",
    marginBottom: "32px",
  },
  commentBox: {
    width: "100%",
    height: "120px",
    padding: "16px",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "16px",
    resize: "none",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 auto 8px",
    fontFamily: "inherit",
    display: "block",
    boxSizing: "border-box",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  submitBtn: {
    flex: 1,
    padding: "16px",
    background: "var(--primary-gradient)",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    fontSize: "17px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    boxShadow: "0 4px 15px rgba(75, 110, 245, 0.3)",
  },
  resetBtn: {
    flex: 1,
    padding: "16px",
    background: "rgba(255,255,255,0.6)",
    color: "var(--text-muted)",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "16px",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  buttonContainer: {
    display: "flex",
    gap: "16px",
  },
  successMessage: {
    textAlign: "center",
    color: "#10B981",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "20px",
  },
  errorMessage: {
    textAlign: "center",
    color: "#EF4444",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "20px",
  },
  charCount: {
    textAlign: "right",
    fontSize: "14px",
    color: "var(--text-muted)",
    marginTop: "-2px",
    marginBottom: "20px",
  },
};

export default FeedbackPage;