import { http } from "@/utils/http";

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

export interface OverviewData {
  borrowing: number;
  overdue: number;
  totalBooks: number;
  totalUsers: number;
}

export interface ChartData {
  xAxis: string[];
  series: Array<{ name: string; data: number[] }>;
}

export interface PieChartData {
  series: Array<{ name: string; data: Array<{ name: string; value: number }> }>;
}

export const getOverview = () =>
  http.request<ApiResult<OverviewData>>("get", "/api/dashboard/overview");

export const getBorrowTrend = () =>
  http.request<ApiResult<ChartData>>("get", "/api/dashboard/borrow-trend");

export const getTopBooks = () =>
  http.request<ApiResult<ChartData>>("get", "/api/dashboard/top-books");

export const getCategoryStats = () =>
  http.request<ApiResult<PieChartData>>("get", "/api/dashboard/category-stats");

export const getAiStats = () =>
  http.request<ApiResult<ChartData>>("get", "/api/dashboard/ai-stats");
