import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  model: string;
  /** 更新所选模型，供 llm 请求体读取 */
  setModel: (model: string) => void;
};

/**
 * 用户设置（localStorage 持久化）。
 * API Key 由 BFF 保管，前端不再存储。
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      model: "deepseek-chat",
      setModel: (model) => set({ model }),
    }),
    { name: "chat-settings" },
  ),
);
