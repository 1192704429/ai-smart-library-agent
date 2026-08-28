import { http } from "@/utils/http";
import type { Book } from "@/api/book";

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

export const addFavorite = (bookId: number) =>
  http.request<ApiResult>("post", `/api/favorites/${bookId}`);

export const removeFavorite = (bookId: number) =>
  http.request<ApiResult>("delete", `/api/favorites/${bookId}`);

export const checkFavorite = (bookId: number) =>
  http.request<ApiResult<{ favorited: boolean }>>("get", `/api/favorites/check/${bookId}`);

export const getMyFavorites = () =>
  http.request<ApiResult<Book[]>>("get", "/api/favorites/my");
