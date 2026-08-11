import { forwardRef, memo, useReducer } from "react";

type InputState = {
  text: string;
  hasStopped: boolean;
};

type InputAction = { type: "SET_TEXT"; payload: string } | { type: "MARK_STOPPED" } | { type: "CLEAR_STOPPED" } | { type: "RESET_AFTER_SEND" };

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
    }
  >(function ChatInput({ onSend, onStop, onRetry, isStreaming }, ref) {
    const [state, dispatch] = useReducer(inputReducer, initialState);
    const { text, hasStopped } = state;

    const handleSend = () => {
      if (isStreaming) {
        onStop();
        dispatch({ type: "MARK_STOPPED" });
        return;
      }
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

    const buttonColor = isStreaming ? "#e74c3c" : hasStopped ? "#f39c12" : "#3498db";
    const actionLabel = isStreaming ? "停止生成" : hasStopped ? "重试上一条" : "发送消息";
    return (
      <div className="chat-input-bar" aria-busy={isStreaming}>
        <input ref={ref} className="chat-input-field" aria-label="消息输入框" value={text} placeholder="输入消息..." onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleSend()} disabled={isStreaming} />
        <button
          onClick={handleSend}
          aria-label={actionLabel}
          type="button"
          style={{
            backgroundColor: buttonColor,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {isStreaming ? "⏹ 停止" : hasStopped ? "🔄 重试" : "发送"}
        </button>
      </div>
    );
  }),
);

export default ChatInput;
