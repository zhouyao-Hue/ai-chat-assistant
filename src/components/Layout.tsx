import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Outlet />
    </div>
  );
}