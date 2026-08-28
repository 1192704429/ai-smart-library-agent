import { http } from "@/utils/http";
import type { Book } from "@/api/book";

export interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: "USER" | "ASSISTANT";
  content: string;
  sources: string | null;
  createdAt: string;
  // 前端扩展字段（流式时使用）
  streaming?: boolean;
  books?: Book[];
}

export interface ChatResponse {
  answer: string;
  books: Book[];
  sources: Array<{ bookId: number; title: string; author: string }>;
  messageId: number;
}

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

export const createSession = () =>
  http.request<ApiResult<ChatSession>>("post", "/api/agent/sessions");

export const getSessions = () =>
  http.request<ApiResult<ChatSession[]>>("get", "/api/agent/sessions");

export const deleteSession = (id: number) =>
  http.request<ApiResult>("delete", `/api/agent/sessions/${id}`);

export const getMessages = (sessionId: number) =>
  http.request<ApiResult<ChatMessage[]>>("get", `/api/agent/sessions/${sessionId}/messages`);

export const chat = (data: { sessionId: number; message: string }) =>
  http.request<ApiResult<ChatResponse>>("post", "/api/agent/chat", { data });

/** 返回 SSE URL，由组件用 EventSource 直接连接 */
export const chatStreamUrl = (sessionId: number, message: string) => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const token = localStorage.getItem("token") || "";
  return `${base}/api/agent/chat/stream?sessionId=${sessionId}&message=${encodeURIComponent(message)}&token=${token}`;
};
