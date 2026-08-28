import { http } from "@/utils/http";

export interface Review {
  id: number;
  userId: number;
  username: string;
  bookId: number;
  rating: number;
  content: string;
  createdAt: string;
}

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

export const submitReview = (data: { bookId: number; rating: number; content?: string }) =>
  http.request<ApiResult<Review>>("post", "/api/reviews", { data });

export const getBookReviews = (bookId: number) =>
  http.request<ApiResult<Review[]>>("get", `/api/reviews/book/${bookId}`);

export const getAvgRating = (bookId: number) =>
  http.request<ApiResult<{ avgRating: number }>>("get", `/api/reviews/book/${bookId}/rating`);
