import { useSettingsStore } from "@/stores/settingsStore";

export default function SettingsPage() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const model = useSettingsStore((s) => s.model);
  const setModel = useSettingsStore((s) => s.setModel);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  return (
    <div>
      <h1>设置</h1>
      <label>
        API Key
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." style={{ width: "100%", marginTop: 8 }} />
      </label>
      {!apiKey.trim() && <p style={{ color: "#c00", fontSize: 14 }}>API Key 为空，聊天将无法发送</p>}
      <label style={{ display: "block", marginTop: 16 }}>
        模型
        <select value={model} onChange={(e) => setModel(e.target.value)} style={{ display: "block", width: "100%", marginTop: 8 }}>
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="deepseek-chat">deepseek-chat</option>
        </select>
      </label>
      <p style={{ opacity: 0.7, fontSize: 14 }}>已保存在本地（刷新不丢）。暂勿提交到 Git。</p>
    </div>
  );
}
