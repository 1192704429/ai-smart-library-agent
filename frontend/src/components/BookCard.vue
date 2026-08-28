<script setup lang="ts">
import { ElMessage } from "element-plus";
import type { Book } from "@/api/book";
import { borrowBook } from "@/api/borrow";

const props = defineProps<{
  book: Book;
  showBorrowBtn?: boolean;
}>();

const emit = defineEmits<{
  borrowed: [bookId: number];
}>();

async function onBorrow() {
  if (props.book.stock <= 0) {
    ElMessage.warning("该书库存不足");
    return;
  }
  try {
    const res = await borrowBook(props.book.id);
    if (res.code === 200) {
      ElMessage.success("借阅成功");
      emit("borrowed", props.book.id);
    } else {
      ElMessage.error(res.message ?? "借阅失败");
    }
  } catch {
    ElMessage.error("借阅失败");
  }
}
</script>

<template>
  <el-card class="book-card" shadow="never" :body-style="{ padding: '0' }">
    <div class="cover-wrap">
      <!-- 封面支持点击预览大图 -->
      <el-image
        :src="book.coverUrl || ''"
        fit="cover"
        class="cover-img"
        lazy
        :preview-src-list="book.coverUrl ? [book.coverUrl] : []"
        :initial-index="0"
        preview-teleported
        @click.stop
      >
        <template #error>
          <div class="cover-placeholder">
            <el-icon :size="40"><IconifyIconOnline icon="ep:reading" /></el-icon>
          </div>
        </template>
      </el-image>
      <el-tag
        class="stock-badge"
        :type="book.stock > 0 ? 'success' : 'danger'"
        size="small"
        effect="dark"
      >
        {{ book.stock > 0 ? `可借 ${book.stock}` : "已借完" }}
      </el-tag>
    </div>

    <div class="book-card-body p-3">
      <router-link :to="`/books/${book.id}`">
        <div class="title" :title="book.title">{{ book.title }}</div>
      </router-link>
      <div class="author text-sm text-gray-500 mt-1 truncate">{{ book.author }}</div>
      <el-tag size="small" class="mt-2" type="info">{{ book.category }}</el-tag>

      <el-button
        v-if="showBorrowBtn"
        class="w-full mt-auto pt-3!"
        size="small"
        type="primary"
        :disabled="book.stock <= 0"
        @click.prevent="onBorrow"
      >
        借阅
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 180px;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgb(99 102 241 / 10%);
  border-radius: 14px;
  transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
}

.book-card :deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0 !important;
}

.book-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 132px;
  padding: 14px !important;
}

.title {
  display: -webkit-box;
  overflow: hidden;
  min-height: 2.9em;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  color: #312e81;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-card :deep(.p-3) {
  padding: 14px !important;
}

.book-card:hover {
  border-color: rgb(99 102 241 / 28%);
  box-shadow: 0 8px 24px rgb(99 102 241 / 14%);
  transform: translateY(-4px);
}

.cover-wrap {
  position: relative;
  width: 100%;
  height: 220px;
  background: linear-gradient(180deg, rgb(99 102 241 / 6%), rgb(99 102 241 / 2%));
}

.cover-img {
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-placeholder);
  cursor: default;
}

.stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
