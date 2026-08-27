import { useSettingsStore } from "@/stores/settingsStore";

export default function SettingsPage() {
  const model = useSettingsStore((s) => s.model);
  const setModel = useSettingsStore((s) => s.setModel);

  return (
    <div>
      <h1>设置</h1>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>API Key</h2>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>
          当前由服务端保管密钥，请在 <code>server/.env</code> 中配置 <code>LLM_API_KEY</code>。前端设置页不再收集 API Key，避免误以为写在这里就会生效。
        </p>
      </section>

      <label style={{ display: "block", marginTop: 16 }}>
        模型
        <select value={model} onChange={(e) => setModel(e.target.value)} style={{ display: "block", width: "100%", marginTop: 8 }}>
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="deepseek-chat">deepseek-chat</option>
        </select>
      </label>
      <p style={{ opacity: 0.7, fontSize: 14, marginTop: 12 }}>模型选择会保存在本地（刷新不丢）。</p>
    </div>
  );
}