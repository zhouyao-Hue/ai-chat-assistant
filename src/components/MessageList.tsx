import { Virtuoso } from "react-virtuoso";
import type { Message } from "../types";
import Skeleton from "./Skeleton";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, isLoading, isStreaming }: { messages: Message[]; isLoading: boolean; isStreaming: boolean }) {
  return (
    <div style={{ flex: 1, padding: "0 16px", minHeight: 0 }}>
      <Virtuoso
        style={{ height: "100%" }}
        data={messages}
        followOutput={isStreaming ? "smooth" : false}
        initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
        itemContent={(index, msg) => <MessageBubble key={msg.id} message={msg} />}
        components={{
          Footer: () => (isLoading ? <Skeleton lines={3} /> : null),
        }}
      />
    </div>
  );
}
