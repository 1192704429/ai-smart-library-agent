import { http } from "@/utils/http";

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  coverUrl: string;
  stock: number;
  total: number;
  publishedAt: string;
  createdAt: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

export interface BookQuery {
  page?: number;
  size?: number;
  keyword?: string;
  category?: string;
}

export interface BookForm {
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  coverUrl?: string;
  total: number;
  publishedAt?: string;
}

export const getBooks = (params: BookQuery) =>
  http.request<ApiResult<PageResult<Book>>>("get", "/api/books", { params });

export const getBookDetail = (id: number) =>
  http.request<ApiResult<Book>>("get", `/api/books/${id}`);

export const createBook = (data: BookForm) =>
  http.request<ApiResult<Book>>("post", "/api/books", { data });

export const updateBook = (id: number, data: BookForm) =>
  http.request<ApiResult<Book>>("put", `/api/books/${id}`, { data });

export const deleteBook = (id: number) =>
  http.request<ApiResult>("delete", `/api/books/${id}`);

export interface SemanticSearchResult {
  records: Book[];
  total: number;
  degraded: boolean;
}

export const semanticSearch = (params: { q: string; page?: number; size?: number }) =>
  http.request<ApiResult<SemanticSearchResult>>("get", "/api/books/search/semantic", { params });

export const uploadCover = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return http.request<ApiResult<{ url: string }>>("post", "/api/files/upload/cover", {
    data: form,
    headers: { "Content-Type": "multipart/form-data" }
  });
};
