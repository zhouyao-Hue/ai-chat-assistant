import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

/** 应用壳：氛围层 + 侧边栏 + 子路由出口。 */
export default function Layout() {
  return (
    <div className="app-shell">
      <div className="app-atmosphere" aria-hidden="true" />
      <Sidebar />
      <Outlet />
    </div>
  );
}
