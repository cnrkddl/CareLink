// ✅ named export들만 사용합니다 (default export 없음)
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const NotificationContext = createContext(null);
const STORAGE_KEY = "app.notifications.v1";

export function NotificationProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (notif) => {
    const n = {
      id: crypto.randomUUID(),
      title: notif.title ?? "알림",
      message: notif.message ?? "",
      type: notif.type ?? "info", // info | warning | critical
      source: notif.source ?? "system",
      ts: notif.ts ?? Date.now(),
      read: false,
    };
    setItems((prev) => [n, ...prev]);
    setLastAdded(n);
  };

  const markRead = (id) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const remove = (id) => setItems((prev) => prev.filter((n) => n.id !== id));

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const value = { items, add, markRead, markAllRead, remove, unreadCount, lastAdded, setLastAdded };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
