import { Virtuoso } from "react-virtuoso";
import { useCallback } from "react";
import type { Message } from "@/types";
import Skeleton from "@/components/Skeleton";
import MessageBubble from "@/components/MessageBubble";
import { useChatStore } from "@/stores/chatStore";

/**
 * 虚拟滚动消息列表；流式时自动滚到底并高亮当前流式气泡。
 * @param props.messages - 要展示的消息（可为搜索过滤结果）
 * @param props.isLoading - 是否展示底部骨架
 * @param props.isStreaming - 是否处于流式输出
 */
export default function MessageList({ messages, isLoading, isStreaming }: { messages: Message[]; isLoading: boolean; isStreaming: boolean }) {
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);

  /** Virtuoso 行渲染：单条 MessageBubble */
  const renderItem = useCallback(
    (_index: number, msg: Message) => <MessageBubble message={msg} isStreaming={msg.id === streamingMessageId} />,
    [streamingMessageId],
  );
  /** 首条 assistant 占位时的骨架屏 */
  const renderFooter = useCallback(() => (isLoading ? <Skeleton lines={3} /> : null), [isLoading]);

  return (
    <div className="message-list-wrap">
      <Virtuoso
        className="message-list-virtuoso"
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
