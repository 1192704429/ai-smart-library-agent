<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import {
  getOverview, getBorrowTrend, getTopBooks, getCategoryStats, getAiStats,
  type OverviewData
} from "@/api/dashboard";

defineOptions({ name: "AdminDashboard" });

const overview = ref<OverviewData>({ borrowing: 0, overdue: 0, totalBooks: 0, totalUsers: 0 });
const loading = ref(false);

let trendChart: echarts.ECharts | null = null;
let topChart: echarts.ECharts | null = null;
let catChart: echarts.ECharts | null = null;
let aiChart: echarts.ECharts | null = null;

const trendRef = ref<HTMLElement | null>(null);
const topRef = ref<HTMLElement | null>(null);
const catRef = ref<HTMLElement | null>(null);
const aiRef = ref<HTMLElement | null>(null);

function initChart(el: HTMLElement | null): echarts.ECharts | null {
  if (!el) return null;
  return echarts.init(el);
}

async function loadAll() {
  loading.value = true;
  try {
    const [ovRes, trendRes, topRes, catRes, aiRes] = await Promise.all([
      getOverview(), getBorrowTrend(), getTopBooks(), getCategoryStats(), getAiStats()
    ]);

    if (ovRes.code === 200) overview.value = ovRes.data;

    if (trendRes.code === 200 && trendChart) {
      const d = trendRes.data;
      trendChart.setOption({
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: d.xAxis },
        yAxis: { type: "value" },
        series: d.series.map(s => ({ ...s, type: "line", smooth: true, areaStyle: { opacity: 0.15 } }))
      });
    }

    if (topRes.code === 200 && topChart) {
      const d = topRes.data;
      topChart.setOption({
        tooltip: { trigger: "axis" },
        xAxis: { type: "value" },
        yAxis: { type: "category", data: d.xAxis },
        series: d.series.map(s => ({ ...s, type: "bar", itemStyle: { borderRadius: [0, 4, 4, 0] } }))
      });
    }

    if (catRes.code === 200 && catChart) {
      const d = catRes.data;
      catChart.setOption({
        tooltip: { trigger: "item" },
        legend: { orient: "vertical", left: "left" },
        series: d.series.map(s => ({ ...s, type: "pie", radius: ["40%", "65%"] }))
      });
    }

    if (aiRes.code === 200 && aiChart) {
      const d = aiRes.data;
      aiChart.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: d.series.map(s => s.name) },
        xAxis: { type: "category", data: d.xAxis },
        yAxis: { type: "value" },
        series: d.series.map(s => ({ ...s, type: "line", smooth: true }))
      });
    }
  } catch {
    ElMessage.error("加载看板数据失败");
  } finally {
    loading.value = false;
  }
}

function handleResize() {
  trendChart?.resize();
  topChart?.resize();
  catChart?.resize();
  aiChart?.resize();
}

onMounted(async () => {
  trendChart = initChart(trendRef.value);
  topChart = initChart(topRef.value);
  catChart = initChart(catRef.value);
  aiChart = initChart(aiRef.value);
  await loadAll();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  trendChart?.dispose();
  topChart?.dispose();
  catChart?.dispose();
  aiChart?.dispose();
});
</script>

<template>
  <div class="sl-page" v-loading="loading">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">运营统计</h2>
        <p class="sl-page-desc">馆藏运营核心指标与趋势分析一览。</p>
      </div>
    </div>

    <div class="sl-stat-grid">
      <div class="sl-stat-card sl-stat-card--indigo">
        <div class="sl-stat-card__value">{{ overview.borrowing }}</div>
        <div class="sl-stat-card__label">在借图书</div>
      </div>
      <div class="sl-stat-card sl-stat-card--rose">
        <div class="sl-stat-card__value">{{ overview.overdue }}</div>
        <div class="sl-stat-card__label">逾期未还</div>
      </div>
      <div class="sl-stat-card sl-stat-card--emerald">
        <div class="sl-stat-card__value">{{ overview.totalBooks }}</div>
        <div class="sl-stat-card__label">总藏书量</div>
      </div>
      <div class="sl-stat-card sl-stat-card--violet">
        <div class="sl-stat-card__value">{{ overview.totalUsers }}</div>
        <div class="sl-stat-card__label">注册用户</div>
      </div>
    </div>

    <div class="sl-chart-grid">
      <el-card shadow="never">
        <template #header><span class="font-semibold">30 天借阅趋势</span></template>
        <div ref="trendRef" style="height: 280px" />
      </el-card>
      <el-card shadow="never">
        <template #header><span class="font-semibold">热门图书 Top10</span></template>
        <div ref="topRef" style="height: 280px" />
      </el-card>
      <el-card shadow="never">
        <template #header><span class="font-semibold">分类借阅占比</span></template>
        <div ref="catRef" style="height: 280px" />
      </el-card>
      <el-card shadow="never">
        <template #header><span class="font-semibold">助手对话统计（近 7 天）</span></template>
        <div ref="aiRef" style="height: 280px" />
      </el-card>
    </div>
  </div>
</template>
