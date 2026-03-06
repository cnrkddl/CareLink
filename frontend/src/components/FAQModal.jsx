import React, { useState } from 'react';

// ⭐ table 스타일 먼저 선언 (에러 방지용)
const tableTh = {
  border: '1px solid #ccc',
  padding: '8px',
  background: '#f0f2f5',
  textAlign: 'left'
};

const tableTd = {
  border: '1px solid #ccc',
  padding: '8px'
};

const faqData = [
  {
    question: '병원 운영 시간은 어떻게 되나요?',
    answer: '평일 오전 9시부터 오후 6시까지 운영됩니다. (토/일/공휴일 휴무일정은 사전 공지 참고)',
  },
  {
    question: '병원 위치와 주차는 어떻게 하나요?',
    answer: (
      <div>
        <p>경기도 고양시 일산서구 주엽2동 115-2 (주화로 88).<br />
        주엽역 4번 출구에서 도보 3분 거리이며, 건물 내 주차 가능합니다.</p>
        <p style={{ marginTop: '6px' }}>
          <strong>지하철 이용시:</strong> 3호선 주엽역 4번 출구에서 직진 200m 후 대우시티프라자 왼쪽 50m<br />
          <strong>버스 이용시:</strong> 3호선 주엽역 중앙로 버스정류장 하차 (그랜드백화점 건너편)
        </p>
      </div>
    )
  },
  {
    question: '입원 절차는 어떻게 되나요?',
    answer: '외래 진료 후 의료진의 판단에 따라 입원 여부가 결정되며, 원무과에서 입원 수속을 진행합니다.',
  },
  {
    question: '입원 대상이 어떻게 될까요?',
    answer: (
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '14px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr>
              <th style={tableTh}>대상</th>
              <th style={tableTh}>설명</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['노인성질환자', '치매, 중풍, 고혈압, 당뇨, 관절염, 위궤양 등 노인성 질환을 겪고 계시는 분'],
              ['심장질환자', '심근경색, 협심증, 심부전, 부정맥 등 장·단기 치료가 필요한 분'],
              ['호흡기계질환', '폐렴, 만성폐쇄성폐질환, 천식 등으로 요양 치료가 필요한 분'],
              ['근골격계질환', '척추협착, 골절, 편마비, 사지마비 등 재활 치료가 필요한 분'],
              ['뇌혈관질환', '중풍, 파킨슨, 치매, 노인성우울증 등 신경계 질환자'],
              ['각종암질환', '말기암, 호스피스 환자, 수술 후 회복기, 희귀질환자 등 장단기 입원이 필요한 분'],
            ].map(([type, desc], i) => (
              <tr key={i}>
                <td style={tableTd}>{type}</td>
                <td style={tableTd}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  {
    question: '입원 시 필요한 물품은 무엇인가요?',
    answer: (
      <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.6' }}>
        <li>건강보험카드 또는 의료급여카드</li>
        <li>의사소견서, 진단서 및 진료의뢰서</li>
        <li>최근 검사기록지 (MRI, CT, X-ray, 혈관검사 사본 등)</li>
        <li>투약 기록지 및 처방전</li>
        <li>세면도구, 개인용품, 속옷, 실내화 등</li>
        <li>욕창방지용 에어매트리스 (외상환자 한정)</li>
        <li>간식 및 기타 개인 필요물품</li>
      </ul>
    )
  },
  {
    question: '응급 상황 시 보호자에게 연락이 오나요?',
    answer: '응급 상황 시 즉시 연락드리며, 매일 카카오톡으로 환자 상태가 보고됩니다.',
  },
  {
    question: '챗봇이 제공하는 기능은 무엇인가요?',
    answer: '입원/면회 안내, 환자 상태 요약, 약 복용 정보, 일정 확인, 상담원 연결 안내 등입니다.',
  },
  {
    question: '상담원에게 연결하려면 어떻게 하나요?',
    answer: '010-4130-0041 로 전화주시면 상담원이 안내드립니다.',
  }
];

const FAQModal = ({ onClose }) => {
  const [openStates, setOpenStates] = useState(Array(faqData.length).fill(false));

  const toggle = (index) => {
    const updated = [...openStates];
    updated[index] = !updated[index];
    setOpenStates(updated);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>📋 자주 묻는 질문</h3>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {faqData.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => toggle(idx)}
                style={{
                  ...styles.questionBtn,
                  borderRadius: openStates[idx] ? '10px 10px 0 0' : '10px'
                }}
              >
                {item.question}
                <span>{openStates[idx] ? '▲' : '▼'}</span>
              </button>
              {openStates[idx] && (
                <div style={styles.answerBox}>
                  {item.answer}
                </div>
              )}
            </li>
          ))}
        </ul>

        <button onClick={onClose} style={styles.closeBtn}>
          닫기
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '16px',
    width: '440px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    fontFamily: "'Pretendard', sans-serif"
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 600
  },
  questionBtn: {
    width: '100%',
    textAlign: 'left',
    padding: '14px 16px',
    background: '#f4f6fa',
    border: '1px solid #ccc',
    fontWeight: '500',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  answerBox: {
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #ddd',
    borderTop: 'none',
    borderRadius: '0 0 10px 10px',
    animation: 'fadeIn 0.2s ease-in-out'
  },
  closeBtn: {
    marginTop: '24px',
    backgroundColor: '#4B6EF5',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '15px',
    width: '100%',
  }
};

export default FAQModal;
