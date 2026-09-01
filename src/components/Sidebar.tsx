import { memo } from "react";
import { NavLink } from "react-router-dom";
import SessionList from "@/components/SessionList";

/** 左侧栏：品牌 + 会话列表 + 聊天/设置导航。 */
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark" aria-hidden="true" />
          Lumen
        </div>
        <div className="sidebar-brand-sub">AI Chat</div>
      </div>
      <div className="sidebar-list">
        <SessionList />
      </div>
      <nav className="sidebar-nav" aria-label="主导航">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
          聊天
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : undefined)}>
          设置
        </NavLink>
      </nav>
    </aside>
  );
}
export default memo(Sidebar);
