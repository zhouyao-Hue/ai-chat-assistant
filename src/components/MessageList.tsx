import { Virtuoso } from "react-virtuoso";
import { useCallback } from "react";
import type { Message } from "@/types";
import Skeleton from "@/components/Skeleton";
import MessageBubble from "@/components/MessageBubble";

export default function MessageList({ messages, isLoading, isStreaming }: { messages: Message[]; isLoading: boolean; isStreaming: boolean }) {
  const renderItem = useCallback((_index: number, msg: Message) => <MessageBubble message={msg} />, []);
  const renderFooter = useCallback(() => (isLoading ? <Skeleton lines={3} /> : null), [isLoading]);
  return (
    <div style={{ flex: 1, padding: "0 16px", minHeight: 0 }}>
      <Virtuoso
        style={{ height: "100%" }}
        data={messages}
        computeItemKey={(_index, msg) => msg.id}
        followOutput={isStreaming ? "smooth" : false}
        initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
        increaseViewportBy={{ top: 200, bottom: 200 }}
        itemContent={renderItem}
        components={{
          Footer: renderFooter,
        }}
      />
    </div>
  );
}
