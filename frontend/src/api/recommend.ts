import { http } from "@/utils/http";
import type { Book } from "@/api/book";

export interface RecommendItem {
  book: Book;
  reason: string;
  source: "AI" | "HOT";
}

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

export const getRecommendations = () =>
  http.request<ApiResult<RecommendItem[]>>("get", "/api/recommend");
