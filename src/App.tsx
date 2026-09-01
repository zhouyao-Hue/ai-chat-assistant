import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ChatPage from "@/pages/ChatPage";
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

/** 根路由：聊天首页 + lazy 设置页。 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ChatPage />} />
        <Route
          path="settings"
          element={
            <Suspense fallback={<div className="route-fallback">加载设置页…</div>}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
