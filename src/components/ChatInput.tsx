import { forwardRef, memo, useReducer } from "react";
import type { InputState, InputAction } from "@/types";

const initialState: InputState = { text: "", hasStopped: false };

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SET_TEXT", payload: e.target.value });
    };

    const inputDisabled = isStreaming || isOffline;
    const buttonColor = isStreaming ? "#e74c3c" : isOffline ? "#95a5a6" : hasStopped ? "#f39c12" : "#3498db";
    const actionLabel = isStreaming ? "停止生成" : isOffline ? "网络已断开" : hasStopped ? "重试上一条" : "发送消息";
    return (
      <div className="chat-input-bar" aria-busy={isStreaming}>
        <input
          ref={ref}
          className="chat-input-field"
          aria-label="消息输入框"
          value={text}
          placeholder={isOffline ? "网络已断开，无法发送…" : "输入消息..."}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={inputDisabled}
        />
        <button
          onClick={handleSend}
          aria-label={actionLabel}
          type="button"
          disabled={isOffline && !isStreaming}
          style={{
            backgroundColor: buttonColor,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            cursor: isOffline && !isStreaming ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {isStreaming ? "⏹ 停止" : isOffline ? "离线" : hasStopped ? "🔄 重试" : "发送"}
        </button>
      </div>
    );
  }),
);

export default ChatInput;
