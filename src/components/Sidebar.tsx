import { memo } from "react";
import { NavLink } from "react-router-dom";
import SessionList from "./SessionList";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>对话列表</h3>
      </div>
      <div className="sidebar-list">
        <SessionList />
      </div>
      <nav style={{ padding: 8, borderTop: "1px solid #ccc" }}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            display: "block",
            padding: "4px 0",
            fontWeight: isActive ? "bold" : "normal",
            color: "inherit",
            textDecoration: "none",
          })}
        >
          聊天
        </NavLink>
        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            display: "block",
            padding: "4px 0",
            fontWeight: isActive ? "bold" : "normal",
            color: "inherit",
            textDecoration: "none",
          })}
        >
          设置
        </NavLink>
      </nav>
    </div>
  );
}
export default memo(Sidebar);