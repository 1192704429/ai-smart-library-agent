<script setup lang="ts">
import type { RecommendItem } from "@/api/recommend";
import BrowseBookCard from "@/components/BrowseBookCard.vue";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";

defineProps<{
  item: RecommendItem;
}>();

const emit = defineEmits<{
  borrowed: [bookId: number];
}>();

const isAi = (source: RecommendItem["source"]) => source === "AI";
</script>

<template>
  <BrowseBookCard
    :book="item.book"
    class="recommend-book-card"
    :class="isAi(item.source) ? 'recommend-book-card--ai' : 'recommend-book-card--hot'"
    @borrowed="emit('borrowed', $event)"
  >
    <template #badge>
      <span
        class="recommend-book-card__badge"
        :class="isAi(item.source) ? 'recommend-book-card__badge--ai' : 'recommend-book-card__badge--hot'"
      >
        <IconifyIconOnline
          :icon="isAi(item.source) ? 'ep:magic-stick' : 'ep:promotion'"
        />
        {{ isAi(item.source) ? "AI 推荐" : "热门推荐" }}
      </span>
    </template>
    <template #extra>
      <div class="recommend-book-card__reason">
        <IconifyIconOnline icon="ep:chat-line-round" class="recommend-book-card__reason-icon" />
        <MarkdownRenderer :content="item.reason" />
      </div>
    </template>
  </BrowseBookCard>
</template>

<style scoped>
.recommend-book-card--ai {
  background: linear-gradient(135deg, #fff 0%, rgb(99 102 241 / 5%) 100%);
}

.recommend-book-card--hot {
  background: linear-gradient(135deg, #fff 0%, rgb(245 158 11 / 5%) 100%);
}

.recommend-book-card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: inline-flex;
  gap: 3px;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(30 27 68 / 10%);
}

.recommend-book-card__badge--ai {
  background: linear-gradient(135deg, #6366f1, #818cf8);
}

.recommend-book-card__badge--hot {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.recommend-book-card__reason {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  height: 100%;
  padding: 10px 12px;
  background: rgb(255 255 255 / 72%);
  border-left: 3px solid rgb(99 102 241 / 35%);
  border-radius: 0 10px 10px 0;
}

.recommend-book-card--hot .recommend-book-card__reason {
  border-left-color: rgb(245 158 11 / 45%);
}

.recommend-book-card__reason-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 14px;
  color: #a5b4fc;
}

.recommend-book-card--hot .recommend-book-card__reason-icon {
  color: #fbbf24;
}

.recommend-book-card__reason :deep(.markdown-body) {
  display: -webkit-box;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.7;
  color: #4b5563;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.recommend-book-card__reason :deep(.markdown-body p) {
  margin: 0;
}

:global(html.dark) .recommend-book-card--ai {
  background: linear-gradient(135deg, rgb(255 255 255 / 4%), rgb(99 102 241 / 8%));
}

:global(html.dark) .recommend-book-card--hot {
  background: linear-gradient(135deg, rgb(255 255 255 / 4%), rgb(245 158 11 / 8%));
}

:global(html.dark) .recommend-book-card__reason {
  background: rgb(99 102 241 / 6%);
}

:global(html.dark) .recommend-book-card__reason :deep(.markdown-body) {
  color: #d1d5db;
}
</style>
