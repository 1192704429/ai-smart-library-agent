<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps<{ content: string }>();

// 配置 marked：启用 gfm + breaks
marked.setOptions({ gfm: true, breaks: true } as any);

/** 渲染 Markdown 并净化 HTML，防 XSS */
const html = computed(() => {
  if (!props.content) return "";
  const raw = marked.parse(props.content) as string;
  return DOMPurify.sanitize(raw);
});
</script>

<template>
  <!-- 使用 v-html 前已经过 DOMPurify 净化，安全 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="markdown-body" v-html="html" />
</template>

<style scoped>
.markdown-body {
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
}
.markdown-body :deep(p) { margin: 0.4em 0; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { padding-left: 1.5em; margin: 0.4em 0; }
.markdown-body :deep(code) {
  background: var(--el-fill-color);
  padding: 0.1em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}
.markdown-body :deep(pre) {
  background: var(--el-fill-color-darker);
  padding: 0.8em;
  border-radius: 6px;
  overflow-x: auto;
}
.markdown-body :deep(pre code) { background: none; padding: 0; }
</style>
