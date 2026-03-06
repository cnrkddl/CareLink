// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const LoginForm = () => {
//   const [id, setId] = useState("");
//   const [pw, setPw] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault(); // ✅ 새로고침 방지
//     console.log("✅ handleSubmit 실행됨");
//     navigate("/home"); // ✅ 무조건 이동
//   };

//   return (
//     <form onSubmit={handleSubmit} style={styles.form}>
//       <input
//         type="text"
//         placeholder="아이디"
//         value={id}
//         onChange={(e) => setId(e.target.value)}
//         style={styles.input}
//       />
//       <input
//         type="password"
//         placeholder="비밀번호"
//         value={pw}
//         onChange={(e) => setPw(e.target.value)}
//         style={styles.input}
//       />
//       <button type="submit" style={styles.button}>
//         Sign In
//       </button>
//     </form>
//   );
// };

// const styles = {
//   form: {
//     width: "300px",
//     margin: "100px auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px",
//   },
//   input: {
//     padding: "10px",
//     fontSize: "16px",
//   },
//   button: {
//     padding: "12px",
//     backgroundColor: "#151717",
//     color: "white",
//     fontSize: "16px",
//     border: "none",
//     cursor: "pointer",
//   },
// };

// export default LoginForm;
