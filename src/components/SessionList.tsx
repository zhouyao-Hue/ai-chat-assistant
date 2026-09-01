import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";

/**
 * 会话列表：新建、切换、重命名、删除。
 */
export default function SessionList() {
  const sessions = useChatStore((s) => s.sessions);
  const currentId = useChatStore((s) => s.currentSessionId);
  const createSession = useChatStore((s) => s.createSession);
  const switchSession = useChatStore((s) => s.switchSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const renameSession = useChatStore((s) => s.renameSession);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  /**
   * 进入内联重命名编辑态。
   * @param id - 会话 id
   * @param title - 当前标题
   */
  const startRename = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  /**
   * 提交重命名；空标题则放弃修改。
   * @param id - 会话 id
   */
  const submitRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      renameSession(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div className="session-list">
      <button type="button" className="btn btn-new-session" onClick={createSession}>
        <span className="full">新建会话</span>
      </button>
      {sessions.map((s) => (
        <div key={s.id} className={`session-item${s.id === currentId ? " session-item-active" : ""}`}>
          {editingId === s.id ? (
            <input
              className="session-rename-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => submitRename(s.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename(s.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              autoFocus
            />
          ) : (
            <span className="session-title" onClick={() => switchSession(s.id)}>
              {s.title}
            </span>
          )}

          <button
            type="button"
            className="btn btn-ghost"
            aria-label="重命名会话"
            onClick={(e) => {
              e.stopPropagation();
              startRename(s.id, s.title);
            }}
          >
            重命名
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            aria-label="删除会话"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("删除该会话？")) deleteSession(s.id);
            }}
          >
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
