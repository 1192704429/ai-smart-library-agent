import { http } from "@/utils/http";

export interface BorrowRecord {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  userId: number;
  username: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "BORROWED" | "RETURNED" | "OVERDUE";
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

export const borrowBook = (bookId: number) =>
  http.request<ApiResult<BorrowRecord>>("post", "/api/borrows", { data: { bookId } });

export const returnBook = (borrowId: number) =>
  http.request<ApiResult<BorrowRecord>>("put", `/api/borrows/${borrowId}/return`);

export const getMyBorrows = (params: { page?: number; size?: number }) =>
  http.request<ApiResult<PageResult<BorrowRecord>>>("get", "/api/borrows/my", { params });

export const getAllBorrows = (params: { page?: number; size?: number; status?: string }) =>
  http.request<ApiResult<PageResult<BorrowRecord>>>("get", "/api/borrows", { params });
