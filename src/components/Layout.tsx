import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Outlet />
    </div>
  );
}