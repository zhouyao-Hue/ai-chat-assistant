import type { Message } from "@/types";
export const mockMessages: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "你好，请用 React 解释什么是虚拟 DOM？",
    timestamp: Date.now() - 1000 * 60 * 30, // 30 分钟前
  },
  {
    id: "m2",
    role: "assistant",
    content: "虚拟 DOM 是真实 DOM 的轻量 JS 对象表示。React 在内存中对比新旧虚拟DOM（diff），然后只更新变化的部分到真实 DOM，减少直接操作 DOM 的开销。",
    timestamp: Date.now() - 1000 * 60 * 29,
  },
  {
    id: "m3",
    role: "user",
    content: "那它和直接操作 DOM 比快在哪里？",
    timestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: "m4",
    role: "assistant",
    content: "快在两个层面：1）批量更新 — 多次 setState 合并一次 DOM 操作；2）最小化变更 —diff 算法只更新变了的部分，不会全量重建。但虚拟 DOM 本身也有开销，Vue 和 Svelte 在编译时优化就是另一条路。",
    timestamp: Date.now() - 1000 * 60 * 4,
  },
];
export const mockConversations = [
  { id: "c1", title: "虚拟 DOM 原理讨论" },
  { id: "c2", title: "React vs Vue 对比" },
  { id: "c3", title: "前端面试准备" },
];