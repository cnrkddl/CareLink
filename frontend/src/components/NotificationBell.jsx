import React, { useEffect, useRef, useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import NotificationCenter from "./NotificationCenter";
import { Bell } from "lucide-react";

export default function NotificationBell() {
    const { unreadCount } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                aria-label="알림"
                onClick={() => setOpen((v) => !v)}
                style={{
                    position: "relative",
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    border: "1.5px solid #f3f4f6",
                    background: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4b5563",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.color = "#1f2937";
                    e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#f3f4f6";
                    e.currentTarget.style.color = "#4b5563";
                    e.currentTarget.style.transform = "translateY(0)";
                }}
                title="알림"
            >
                <Bell size={22} strokeWidth={2.2} />
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            minWidth: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#ef4444",
                            border: "2px solid #ffffff",
                            boxShadow: "0 0 0 1px rgba(239, 68, 68, 0.2)",
                        }}
                    />
                )}
            </button>

            {open && <NotificationCenter onClose={() => setOpen(false)} />}
        </div>
    );
}
