import { useSettingsStore } from "@/stores/settingsStore";

/**
 * 设置页：模型选择（API Key 由 BFF `server/.env` 配置）。
 */
export default function SettingsPage() {
  const model = useSettingsStore((s) => s.model);
  const setModel = useSettingsStore((s) => s.setModel);

  return (
    <main className="chat-main">
      <div className="settings-page">
        <h1>设置</h1>
        <p className="settings-lead">调整模型与了解密钥保管方式。更改会立即保存到本地。</p>

        <section className="settings-section">
          <h2>API Key</h2>
          <p className="settings-hint">
            当前由服务端保管密钥，请在 <code>server/.env</code> 中配置 <code>LLM_API_KEY</code>
            。前端设置页不再收集 API Key，避免误以为写在这里就会生效。
          </p>
        </section>

        <section className="settings-section">
          <label className="settings-label">
            模型
            <select className="settings-select" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="deepseek-chat">deepseek-chat</option>
              <option value="deepseek-reasoner">deepseek-reasoner</option>
            </select>
          </label>
          <p className="settings-footnote">当前 BFF 仅支持 DeepSeek 模型族。</p>
        </section>
      </div>
    </main>
  );
}
