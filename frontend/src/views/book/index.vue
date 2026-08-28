<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getBooks, semanticSearch, type Book, type BookQuery } from "@/api/book";
import BrowseBookCard from "@/components/BrowseBookCard.vue";
import znjsIcon from "@/assets/znjs.png";
import ssIcon from "@/assets/ss.png";

defineOptions({ name: "BookList" });

const loading = ref(false);
const books = ref<Book[]>([]);
const total = ref(0);
const semanticQuery = ref("");
const isSemanticMode = ref(false);
const isDegraded = ref(false);

const query = reactive<BookQuery>({
  page: 1,
  size: 8,
  keyword: "",
  category: ""
});

const categories = [
  "文学", "科幻", "历史", "科技", "经济", "哲学", "艺术", "教育", "其他"
];

async function fetchBooks() {
  loading.value = true;
  try {
    const res = await getBooks(query);
    if (res.code === 200) {
      books.value = res.data.records;
      total.value = res.data.total;
    }
  } catch {
    ElMessage.error("加载图书失败");
  } finally {
    loading.value = false;
  }
}

async function doSemanticSearch() {
  if (!semanticQuery.value.trim()) return;
  loading.value = true;
  isSemanticMode.value = true;
  try {
    const res = await semanticSearch({ q: semanticQuery.value, page: query.page, size: query.size });
    if (res.code === 200) {
      books.value = res.data.records;
      total.value = res.data.total;
      isDegraded.value = res.data.degraded;
    }
  } catch {
    ElMessage.error("搜索失败");
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  isSemanticMode.value = false;
  isDegraded.value = false;
  query.page = 1;
  fetchBooks();
}

function onSemanticSearch() {
  query.page = 1;
  doSemanticSearch();
}

function clearSemanticSearch() {
  semanticQuery.value = "";
  isSemanticMode.value = false;
  isDegraded.value = false;
  query.page = 1;
  fetchBooks();
}

function onPageChange(page: number) {
  query.page = page;
  if (isSemanticMode.value) doSemanticSearch();
  else fetchBooks();
}

function onCategoryChange() {
  isSemanticMode.value = false;
  query.page = 1;
  fetchBooks();
}

onMounted(fetchBooks);
</script>

<template>
  <div class="sl-page">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">书籍查询</h2>
        <p class="sl-page-desc">支持智能语义检索与关键词筛选，快速找到心仪图书。</p>
      </div>
    </div>

    <div class="book-search-panel">
      <div class="book-search-panel__section book-search-panel__section--semantic">
        <div class="book-search-panel__label">
          <span class="book-search-panel__label-icon book-search-panel__label-icon--ai">
            <img :src="znjsIcon" alt="智能检索" class="book-search-panel__label-img" />
          </span>
          <div>
            <strong>智能检索</strong>
            <span>用自然语言描述你想找的书</span>
          </div>
        </div>
        <div class="book-search-panel__row">
          <el-input
            v-model="semanticQuery"
            placeholder="例如：适合初学者的机器学习入门书"
            clearable
            size="large"
            class="book-search-panel__input"
            @keyup.enter="onSemanticSearch"
            @clear="clearSemanticSearch"
          />
          <el-button type="primary" size="large" @click="onSemanticSearch">
            智能检索
          </el-button>
        </div>
        <div
          v-if="isSemanticMode && !isDegraded"
          class="book-search-active"
        >
          <div class="book-search-active__main">
            <span class="book-search-active__icon">
              <img :src="znjsIcon" alt="智能检索" class="book-search-panel__label-img book-search-panel__label-img--sm" />
            </span>
            <div class="book-search-active__info">
              <strong>智能检索结果</strong>
              <span>「{{ semanticQuery }}」· 共 {{ total }} 本</span>
            </div>
          </div>
          <button type="button" class="book-search-active__exit" @click="clearSemanticSearch">
            切换精确筛选
            <IconifyIconOnline icon="ep:close" />
          </button>
        </div>
      </div>

      <div class="book-search-panel__divider" />

      <div class="book-search-panel__section">
        <div class="book-search-panel__label">
          <span class="book-search-panel__label-icon book-search-panel__label-icon--filter">
            <img :src="ssIcon" alt="精确筛选" class="book-search-panel__label-img" />
          </span>
          <div>
            <strong>精确筛选</strong>
            <span>按书名、作者、ISBN 或分类查找</span>
          </div>
        </div>
        <div class="book-search-panel__row book-search-panel__row--filter">
          <el-input
            v-model="query.keyword"
            placeholder="书名 / 作者 / ISBN"
            clearable
            @keyup.enter="onSearch"
            @clear="onSearch"
          >
            <template #prefix>
              <IconifyIconOnline icon="ep:search" />
            </template>
          </el-input>
          <el-select
            v-model="query.category"
            placeholder="全部分类"
            clearable
            style="width: 140px"
            @change="onCategoryChange"
          >
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
          <el-button type="primary" plain @click="onSearch">搜索</el-button>
          <span class="book-search-panel__count">共 {{ total }} 本</span>
        </div>
      </div>

      <el-alert
        v-if="isDegraded"
        title="当前为关键词检索模式（智能检索服务暂不可用）"
        type="warning"
        :closable="false"
        show-icon
        class="book-search-panel__alert"
      />
    </div>

    <div v-loading="loading" class="sl-page-body">
      <div v-if="books.length" class="sl-recommend-grid">
        <BrowseBookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          @borrowed="fetchBooks"
        />
      </div>
      <div v-else class="sl-empty-wrap">
        <el-empty description="暂无图书" />
      </div>
    </div>

    <div v-if="total > 0" class="sl-pagination">
      <el-pagination
        v-model:current-page="query.page"
        :page-size="query.size"
        :total="total"
        layout="prev, pager, next, total"
        background
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.book-search-panel {
  padding: 20px 22px;
  margin-bottom: 22px;
  background: linear-gradient(135deg, #fff 0%, rgb(99 102 241 / 4%) 100%);
  border: 1px solid rgb(99 102 241 / 12%);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgb(99 102 241 / 6%);
}

.book-search-panel__section--semantic {
  margin-bottom: 4px;
}

.book-search-panel__label {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.book-search-panel__label-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgb(99 102 241 / 14%);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgb(99 102 241 / 10%);
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-search-panel__label-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.book-search-panel__label-img--sm {
  width: 22px;
  height: 22px;
}

.book-search-panel__label-icon--ai {
  background: linear-gradient(145deg, #fff 0%, rgb(99 102 241 / 6%) 100%);
}

.book-search-panel__label-icon--filter {
  background: linear-gradient(145deg, #fff 0%, rgb(16 185 129 / 6%) 100%);
  border-color: rgb(16 185 129 / 18%);
  box-shadow: 0 2px 10px rgb(16 185 129 / 10%);
}

.book-search-panel__section:hover .book-search-panel__label-icon {
  transform: translateY(-1px);
}

.book-search-panel__section:hover .book-search-panel__label-icon--ai {
  box-shadow: 0 4px 14px rgb(99 102 241 / 16%);
}

.book-search-panel__section:hover .book-search-panel__label-icon--filter {
  box-shadow: 0 4px 14px rgb(16 185 129 / 14%);
}

.book-search-panel__label strong {
  display: block;
  margin-bottom: 2px;
  font-size: 14px;
  color: #1e1b4b;
}

.book-search-panel__label span {
  font-size: 12px;
  color: #9ca3af;
}

.book-search-panel__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.book-search-panel__input {
  flex: 1;
  min-width: 260px;
}

.book-search-panel__row--filter .el-input {
  width: 220px;
}

.book-search-active {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgb(99 102 241 / 8%), rgb(129 140 248 / 4%));
  border: 1px solid rgb(99 102 241 / 18%);
  border-radius: 10px;
}

.book-search-active__main {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.book-search-active__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgb(99 102 241 / 16%);
  border-radius: 9px;
  box-shadow: 0 2px 8px rgb(99 102 241 / 12%);
}

.book-search-active__info {
  min-width: 0;
}

.book-search-active__info strong {
  display: block;
  margin-bottom: 2px;
  font-size: 13px;
  color: #4338ca;
}

.book-search-active__info span {
  display: block;
  overflow: hidden;
  font-size: 12px;
  color: #6b7280;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-search-active__exit {
  display: inline-flex;
  flex-shrink: 0;
  gap: 4px;
  align-items: center;
  padding: 6px 12px;
  font-size: 12px;
  color: #6366f1;
  cursor: pointer;
  background: rgb(255 255 255 / 80%);
  border: 1px solid rgb(99 102 241 / 20%);
  border-radius: 8px;
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.book-search-active__exit:hover {
  color: #4f46e5;
  background: #fff;
  border-color: rgb(99 102 241 / 35%);
}

.book-search-panel__count {
  margin-left: auto;
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
}

.book-search-panel__divider {
  height: 1px;
  margin: 18px 0;
  background: linear-gradient(90deg, transparent, rgb(99 102 241 / 14%), transparent);
}

.book-search-panel__alert {
  margin-top: 14px;
  margin-bottom: 0;
}

@media (width <= 768px) {
  .book-search-panel__count {
    width: 100%;
    margin-left: 0;
  }
}

:global(html.dark) .book-search-panel {
  background: linear-gradient(135deg, rgb(255 255 255 / 3%), rgb(99 102 241 / 8%));
  border-color: rgb(99 102 241 / 15%);
}

:global(html.dark) .book-search-panel__label strong {
  color: #e0e7ff;
}

:global(html.dark) .book-search-panel__label-icon {
  background: rgb(255 255 255 / 8%);
  border-color: rgb(99 102 241 / 22%);
}

:global(html.dark) .book-search-panel__label-icon--filter {
  background: linear-gradient(145deg, rgb(255 255 255 / 8%), rgb(16 185 129 / 10%));
  border-color: rgb(16 185 129 / 24%);
}

:global(html.dark) .book-search-active__icon {
  background: rgb(255 255 255 / 8%);
  border-color: rgb(99 102 241 / 22%);
}

:global(html.dark) .book-search-active {
  background: rgb(99 102 241 / 12%);
  border-color: rgb(99 102 241 / 22%);
}

:global(html.dark) .book-search-active__info strong {
  color: #c7d2fe;
}

:global(html.dark) .book-search-active__info span {
  color: #9ca3af;
}

:global(html.dark) .book-search-active__exit {
  color: #a5b4fc;
  background: rgb(255 255 255 / 6%);
  border-color: rgb(99 102 241 / 25%);
}
</style>
