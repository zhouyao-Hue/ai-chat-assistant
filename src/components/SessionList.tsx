import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";

export default function SessionList() {
  const sessions = useChatStore((s) => s.sessions);
  const currentId = useChatStore((s) => s.currentSessionId);
  const createSession = useChatStore((s) => s.createSession);
  const switchSession = useChatStore((s) => s.switchSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const renameSession = useChatStore((s) => s.renameSession);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startRename = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const submitRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      renameSession(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div>
      <button onClick={createSession}>+ 新建会话</button>
      {sessions.map((s) => (
        <div
          key={s.id}
          style={{
            fontWeight: s.id === currentId ? "bold" : "normal",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          {editingId === s.id ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => submitRename(s.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename(s.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              autoFocus
              style={{ width: "70%" }}
            />
          ) : (
            <span onClick={() => switchSession(s.id)}>{s.title}</span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              startRename(s.id, s.title);
            }}
            style={{ marginLeft: 8, fontSize: 12 }}
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("删除该会话？")) deleteSession(s.id);
            }}
            style={{ marginLeft: 4, fontSize: 12 }}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}
