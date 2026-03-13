// 헤더에서 열리는 알림창
import React from "react";
import { useNotifications } from "../context/NotificationContext";

function fmt(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const btnBase = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 12,
};
const btnSecondary = { ...btnBase, border: "1px solid #e5e7eb", background: "#fff" };
const btnPrimary = { ...btnBase, background: "#111827", color: "#fff" };
const btnDanger = { ...btnBase, background: "#ef4444", color: "#fff" };

export default function NotificationCenter({ onClose }) {
    const { items, markRead, markAllRead, remove } = useNotifications();

    return (
        <div
            style={{
                position: "absolute",
                right: 0,
                marginTop: 8,
                width: 360,
                maxHeight: 420,
                overflow: "auto",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                padding: 12,
                zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()} // 전체 알림창 클릭 이벤트 전파 방지
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}
            >
                <strong style={{ fontSize: 16 }}>알림</strong>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            markAllRead();
                        }}
                        style={btnSecondary}
                    >
                        모두 읽음
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={btnSecondary}>
                        닫기
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div style={{ padding: 16, color: "#6b7280" }}>알림이 없습니다.</div>
            ) : (
                items.map((n) => (
                    <div
                        key={n.id}
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 8,
                            background: n.read ? "#fafafa" : "#fff",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                                {n.type === "critical" ? "🚨 " : n.type === "warning" ? "⚠️ " : "ℹ️ "}
                                {n.title}
                            </div>
                            <div style={{ color: "#9ca3af", fontSize: 12 }}>{fmt(n.ts)}</div>
                        </div>
                        <div
                            style={{
                                marginTop: 6,
                                fontSize: 14,
                                color: "#374151",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {n.message}
                        </div>
                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                            {!n.read && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markRead(n.id);
                                    }}
                                    style={btnPrimary}
                                >
                                    읽음
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    remove(n.id);
                                }}
                                style={btnDanger}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
