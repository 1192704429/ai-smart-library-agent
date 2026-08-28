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
  <article class="browse-card">
    <slot name="badge" />

    <div class="browse-card__cover">
      <el-image
        :src="book.coverUrl || ''"
        fit="cover"
        class="browse-card__cover-img"
        lazy
        :preview-src-list="book.coverUrl ? [book.coverUrl] : []"
        preview-teleported
        @click.stop
      >
        <template #error>
          <div class="browse-card__cover-placeholder">
            <IconifyIconOnline icon="ep:reading" />
          </div>
        </template>
      </el-image>
    </div>

    <div class="browse-card__body">
      <div class="browse-card__top">
        <div class="browse-card__meta">
          <router-link :to="`/books/${book.id}`" class="browse-card__title">
            {{ book.title }}
          </router-link>
          <p class="browse-card__author">{{ book.author }}</p>
          <el-tag size="small" type="info" effect="plain" class="browse-card__category">
            {{ book.category }}
          </el-tag>
        </div>
        <span
          class="browse-card__stock"
          :class="book.stock > 0 ? 'is-available' : 'is-empty'"
        >
          {{ book.stock > 0 ? `可借 ${book.stock}` : "已借完" }}
        </span>
      </div>

      <div v-if="$slots.extra" class="browse-card__extra">
        <slot name="extra" />
      </div>
      <p v-else-if="book.description" class="browse-card__desc">
        {{ book.description }}
      </p>

      <div class="browse-card__footer">
        <router-link :to="`/books/${book.id}`" class="browse-card__detail">
          查看详情
        </router-link>
        <el-button
          v-if="showBorrowBtn !== false"
          class="browse-card__borrow"
          type="primary"
          size="small"
          :disabled="book.stock <= 0"
          @click.prevent="onBorrow"
        >
          立即借阅
        </el-button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.browse-card {
  position: relative;
  display: flex;
  gap: 18px;
  height: 100%;
  padding: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, rgb(99 102 241 / 2%) 100%);
  border: 1px solid rgb(99 102 241 / 10%);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgb(30 27 68 / 4%);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.browse-card:hover {
  border-color: rgb(99 102 241 / 22%);
  box-shadow: 0 10px 28px rgb(99 102 241 / 12%);
  transform: translateY(-3px);
}

.browse-card__cover {
  flex-shrink: 0;
  width: 108px;
}

.browse-card__cover-img {
  width: 108px;
  height: 148px;
  overflow: hidden;
  cursor: zoom-in;
  border-radius: 10px;
  box-shadow:
    0 4px 14px rgb(30 27 68 / 14%),
    0 0 0 1px rgb(99 102 241 / 6%);
}

.browse-card__cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 148px;
  font-size: 32px;
  color: #a5b4fc;
  background: linear-gradient(145deg, rgb(99 102 241 / 8%), rgb(129 140 248 / 4%));
  border-radius: 10px;
}

.browse-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.browse-card__top {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
}

.browse-card__meta {
  flex: 1;
  min-width: 0;
}

.browse-card__title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #1e1b4b;
  text-decoration: none;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s;
}

.browse-card__title:hover {
  color: #6366f1;
}

.browse-card__author {
  margin: 4px 0 8px;
  overflow: hidden;
  font-size: 13px;
  color: #6b7280;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.browse-card__category {
  --el-tag-bg-color: rgb(99 102 241 / 8%);
  --el-tag-border-color: rgb(99 102 241 / 12%);
  --el-tag-text-color: #6366f1;
}

.browse-card__stock {
  flex-shrink: 0;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
}

.browse-card__stock.is-available {
  color: #059669;
  background: rgb(16 185 129 / 10%);
}

.browse-card__stock.is-empty {
  color: #dc2626;
  background: rgb(239 68 68 / 10%);
}

.browse-card__extra {
  flex: 1;
  min-height: 0;
}

.browse-card__desc {
  display: -webkit-box;
  flex: 1;
  overflow: hidden;
  margin: 0;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.7;
  color: #4b5563;
  background: rgb(255 255 255 / 72%);
  border-left: 3px solid rgb(99 102 241 / 35%);
  border-radius: 0 10px 10px 0;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.browse-card__footer {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgb(99 102 241 / 8%);
}

.browse-card__detail {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 34px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  color: #6366f1;
  text-decoration: none;
  white-space: nowrap;
  background: rgb(99 102 241 / 6%);
  border: 1px solid rgb(99 102 241 / 18%);
  border-radius: 8px;
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.browse-card__detail:hover {
  color: #4f46e5;
  background: rgb(99 102 241 / 10%);
  border-color: rgb(99 102 241 / 30%);
}

.browse-card__borrow {
  flex: 1;
  height: 34px !important;
  padding: 0 16px !important;
  font-weight: 600;
  line-height: 1 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgb(99 102 241 / 28%);
}

@media (width <= 520px) {
  .browse-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .browse-card__top {
    flex-direction: column;
    align-items: center;
  }

  .browse-card__author {
    white-space: normal;
  }

  .browse-card__desc {
    text-align: left;
  }

  .browse-card__footer {
    width: 100%;
  }
}

:global(html.dark) .browse-card {
  background: linear-gradient(135deg, rgb(255 255 255 / 4%), rgb(99 102 241 / 8%));
  border-color: rgb(99 102 241 / 15%);
}

:global(html.dark) .browse-card__title {
  color: #e0e7ff;
}

:global(html.dark) .browse-card__author {
  color: #9ca3af;
}

:global(html.dark) .browse-card__desc {
  color: #d1d5db;
  background: rgb(99 102 241 / 6%);
}

:global(html.dark) .browse-card__footer {
  border-top-color: rgb(99 102 241 / 12%);
}

:global(html.dark) .browse-card__detail {
  color: #a5b4fc;
  background: rgb(99 102 241 / 10%);
  border-color: rgb(99 102 241 / 22%);
}

:global(html.dark) .browse-card__detail:hover {
  color: #c7d2fe;
  background: rgb(99 102 241 / 16%);
  border-color: rgb(99 102 241 / 35%);
}
</style>
