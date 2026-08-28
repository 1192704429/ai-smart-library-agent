<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getMyFavorites } from "@/api/favorite";
import type { Book } from "@/api/book";
import BrowseBookCard from "@/components/BrowseBookCard.vue";

defineOptions({ name: "MyFavorites" });

const loading = ref(false);
const books = ref<Book[]>([]);

async function fetchFavorites() {
  loading.value = true;
  try {
    const res = await getMyFavorites();
    if (res.code === 200) books.value = res.data;
  } catch {
    ElMessage.error("加载收藏失败");
  } finally {
    loading.value = false;
  }
}

onMounted(fetchFavorites);
</script>

<template>
  <div class="sl-page">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">藏书书架</h2>
        <p class="sl-page-desc">收藏感兴趣的图书，方便随时查阅与借阅。</p>
      </div>
    </div>

    <div class="sl-page-toolbar sl-page-toolbar--split">
      <span class="text-sm text-gray-500">我的收藏图书</span>
      <span class="text-sm text-gray-400">共 {{ books.length }} 本</span>
    </div>

    <div v-loading="loading" class="sl-page-body">
      <div v-if="books.length" class="sl-recommend-grid">
        <BrowseBookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          @borrowed="fetchFavorites"
        />
      </div>
      <div v-else class="sl-empty-wrap">
        <el-empty description="书架空空如也，去书籍查询看看吧">
          <router-link to="/books">
            <el-button type="primary" plain>去查询书籍</el-button>
          </router-link>
        </el-empty>
      </div>
    </div>
  </div>
</template>
