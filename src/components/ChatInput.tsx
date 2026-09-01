import { forwardRef, memo, useReducer } from "react";
import type { InputState, InputAction } from "@/types";

const initialState: InputState = { text: "", hasStopped: false };

/**
 * 输入框状态机：文本与「停止后可重试」标记。
 * @param state - 当前状态
 * @param action - 状态动作
 * @returns 下一状态
 */
function inputReducer(state: InputState, action: InputAction): InputState {
  switch (action.type) {
    case "SET_TEXT":
      return {
        text: action.payload,
        hasStopped: action.payload ? false : state.hasStopped,
      };
    case "MARK_STOPPED":
      return { ...state, hasStopped: true };
    case "CLEAR_STOPPED":
      return { ...state, hasStopped: false };
    case "RESET_AFTER_SEND":
      return { text: "", hasStopped: false };
    default:
      return state;
  }
}

/**
 * 底部输入栏：发送 / 停止 / 重试；离线或空文本时禁用发送。
 */
const ChatInput = memo(
  forwardRef<
    HTMLInputElement,
    {
      onSend: (text: string) => void;
      onStop: () => void;
      onRetry: () => void;
      isStreaming: boolean;
      isOffline?: boolean;
    }
  >(function ChatInput({ onSend, onStop, onRetry, isStreaming, isOffline = false }, ref) {
    const [state, dispatch] = useReducer(inputReducer, initialState);
    const { text, hasStopped } = state;

    /** 主按钮：流式时停止 / 离线禁用 / 停止后重试 / 否则发送 */
    const handleSend = () => {
      if (isStreaming) {
        onStop();
        dispatch({ type: "MARK_STOPPED" });
        return;
      }
      if (isOffline) return;
      if (hasStopped) {
        onRetry();
        dispatch({ type: "CLEAR_STOPPED" });
        return;
      }
      if (!text.trim()) return;
      onSend(text);
      dispatch({ type: "RESET_AFTER_SEND" });
    };

    /** 同步受控输入框文本 */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SET_TEXT", payload: e.target.value });
    };

    const inputDisabled = isStreaming || isOffline;
    const buttonDisabled = isStreaming ? false : isOffline ? true : hasStopped ? false : !text.trim();
    const actionLabel = isStreaming ? "停止生成" : isOffline ? "网络已断开" : hasStopped ? "重试上一条" : "发送消息";
    const btnMod = isStreaming ? "chat-send-btn-stop" : isOffline ? "chat-send-btn-offline" : hasStopped ? "chat-send-btn-retry" : "chat-send-btn-send";
    const btnText = isStreaming ? "停止" : isOffline ? "离线" : hasStopped ? "重试" : "发送";

    return (
      <div className="chat-input-bar" aria-busy={isStreaming}>
        <div className="chat-input-dock">
          <input
            ref={ref}
            className="chat-input-field"
            aria-label="消息输入框"
            value={text}
            placeholder={isOffline ? "网络已断开，无法发送…" : "输入消息…"}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && !buttonDisabled && handleSend()}
            disabled={inputDisabled}
          />
          <button
            onClick={handleSend}
            aria-label={actionLabel}
            type="button"
            disabled={buttonDisabled}
            className={`chat-send-btn ${btnMod}`}
          >
            {btnText}
          </button>
        </div>
      </div>
    );
  }),
);

export default ChatInput;
