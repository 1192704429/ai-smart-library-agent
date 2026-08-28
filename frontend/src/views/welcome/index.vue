<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useNav } from "@/layout/hooks/useNav";
import { getRecommendations, type RecommendItem } from "@/api/recommend";
import RecommendBookCard from "@/components/RecommendBookCard.vue";

defineOptions({ name: "Welcome" });

const RECOMMEND_LIMIT = 8;

const { title } = useNav();
const loading = ref(false);
const items = ref<RecommendItem[]>([]);

const shortcuts = [
  { name: "书籍查询", path: "/books", icon: "ep:reading", desc: "浏览与检索馆藏图书" },
  { name: "智阅助手", path: "/chat", icon: "ep:chat-dot-round", desc: "对话式检索与借还服务" },
  { name: "藏书书架", path: "/my-favorites", icon: "ep:star", desc: "收藏感兴趣的图书" },
  { name: "借阅记录", path: "/my-borrows", icon: "ep:tickets", desc: "查看与管理借阅状态" }
];

async function fetchRecommendations() {
  loading.value = true;
  try {
    const res = await getRecommendations();
    if (res.code === 200) items.value = res.data.slice(0, RECOMMEND_LIMIT);
  } catch {
    ElMessage.error("加载推荐失败");
  } finally {
    loading.value = false;
  }
}

onMounted(fetchRecommendations);
</script>

<template>
  <div class="sl-page">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">欢迎使用 {{ title }}</h2>
        <p class="sl-page-desc">融合智能检索与个性化荐书，让阅读更高效、更便捷。</p>
      </div>
    </div>

    <div class="sl-shortcut-grid">
      <router-link
        v-for="item in shortcuts"
        :key="item.path"
        :to="item.path"
        class="sl-shortcut-card"
      >
        <div class="sl-shortcut-icon">
          <IconifyIconOnline :icon="item.icon" />
        </div>
        <div class="sl-shortcut-info">
          <strong>{{ item.name }}</strong>
          <span>{{ item.desc }}</span>
        </div>
      </router-link>
    </div>

    <div class="welcome-recommend-section">
      <div class="welcome-recommend-header">
        <div>
          <h3 class="welcome-recommend-title">为你推荐</h3>
          <p class="welcome-recommend-desc">基于阅读偏好与热门趋势，精选值得一看的好书</p>
        </div>
        <el-button type="primary" plain :loading="loading" @click="fetchRecommendations">
          <IconifyIconOnline icon="ep:refresh" class="mr-1" />刷新推荐
        </el-button>
      </div>

      <div v-loading="loading" class="sl-page-body">
        <div v-if="items.length" class="sl-recommend-grid">
          <RecommendBookCard
            v-for="item in items"
            :key="item.book.id"
            :item="item"
            @borrowed="fetchRecommendations"
          />
        </div>
        <div v-else-if="!loading" class="sl-empty-wrap">
          <el-empty description="暂无推荐，稍后再来看看吧" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-recommend-section {
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid rgb(99 102 241 / 8%);
}

.welcome-recommend-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.welcome-recommend-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #1e1b4b;
}

.welcome-recommend-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
