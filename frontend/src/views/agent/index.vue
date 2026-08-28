<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import {
  createSession, getSessions, deleteSession, getMessages,
  chatStreamUrl, type ChatSession, type ChatMessage
} from "@/api/agent";

import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import BookCard from "@/components/BookCard.vue";
import robotAvatar from "@/assets/robot.png";
import userAvatar from "@/assets/user.png";

defineOptions({ name: "AgentChat" });

const sessions = ref<ChatSession[]>([]);
const currentSessionId = ref<number | null>(null);
const messages = ref<ChatMessage[]>([]);
const inputText = ref("");
const sending = ref(false);
const messagesRef = ref<HTMLElement | null>(null);
let currentEs: EventSource | null = null;

const currentSessionTitle = () => {
  const session = sessions.value.find(s => s.id === currentSessionId.value);
  return session?.title || "新对话";
};

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}

async function loadSessions() {
  const res = await getSessions();
  if (res.code === 200) sessions.value = res.data;
}

async function selectSession(id: number) {
  currentSessionId.value = id;
  const res = await getMessages(id);
  if (res.code === 200) {
    messages.value = res.data;
    scrollToBottom();
  }
}

async function onNewSession() {
  const res = await createSession();
  if (res.code === 200) {
    sessions.value.unshift(res.data);
    await selectSession(res.data.id);
  }
}

async function onDeleteSession(session: ChatSession) {
  await ElMessageBox.confirm(`确认删除会话"${session.title}"？`, "删除确认", { type: "warning" });
  await deleteSession(session.id);
  sessions.value = sessions.value.filter(s => s.id !== session.id);
  if (currentSessionId.value === session.id) {
    if (sessions.value.length > 0) {
      await selectSession(sessions.value[0].id);
    } else {
      currentSessionId.value = null;
      messages.value = [];
    }
  }
}

async function onSend() {
  const text = inputText.value.trim();
  if (!text || sending.value) return;
  if (!currentSessionId.value) {
    await onNewSession();
  }

  messages.value.push({
    id: Date.now(),
    sessionId: currentSessionId.value!,
    role: "USER",
    content: text,
    sources: null,
    createdAt: new Date().toISOString()
  });

  const assistantMsg: ChatMessage = {
    id: Date.now() + 1,
    sessionId: currentSessionId.value!,
    role: "ASSISTANT",
    content: "",
    sources: null,
    createdAt: new Date().toISOString(),
    streaming: true,
    books: []
  };
  messages.value.push(assistantMsg);

  inputText.value = "";
  sending.value = true;
  scrollToBottom();

  if (currentEs) currentEs.close();

  const url = chatStreamUrl(currentSessionId.value!, text);
  const es = new EventSource(url);
  currentEs = es;

  es.onmessage = event => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "token") {
        assistantMsg.content += data.content;
        scrollToBottom();
      } else if (data.type === "books") {
        assistantMsg.books = data.books;
      } else if (data.type === "done") {
        assistantMsg.streaming = false;
        assistantMsg.id = data.messageId;
        sending.value = false;
        es.close();
        loadSessions();
      } else if (data.type === "error") {
        ElMessage.error(data.message || "AI 服务异常");
        assistantMsg.streaming = false;
        assistantMsg.content = assistantMsg.content || "AI 服务暂时不可用，请稍后再试。";
        sending.value = false;
        es.close();
      }
    } catch { /* ignore parse errors */ }
  };

  es.onerror = () => {
    assistantMsg.streaming = false;
    if (!assistantMsg.content) {
      assistantMsg.content = "连接中断，请重试。";
    }
    sending.value = false;
    es.close();
  };
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
}

onMounted(async () => {
  await loadSessions();
  if (sessions.value.length > 0) {
    await selectSession(sessions.value[0].id);
  }
});

onUnmounted(() => {
  if (currentEs) currentEs.close();
});
</script>

<template>
  <div class="agent-page">
    <div class="chat-layout">
      <aside class="session-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-brand">
            <span class="sidebar-brand-icon">
              <IconifyIconOnline icon="ep:collection" />
            </span>
            <div class="sidebar-brand-text">
              <strong>会话记录</strong>
              <span>{{ sessions.length }} 条对话</span>
            </div>
          </div>
          <button type="button" class="new-session-btn" @click="onNewSession">
            <IconifyIconOnline icon="ep:plus" />
            <span>新建会话</span>
          </button>
        </div>

        <div class="session-list">
          <div v-if="sessions.length === 0" class="session-empty">
            <span class="session-empty-icon">
              <IconifyIconOnline icon="ep:chat-line-round" />
            </span>
            <p>还没有对话</p>
            <span>点击上方按钮开始交流</span>
          </div>

          <div
            v-for="s in sessions"
            :key="s.id"
            class="session-item"
            :class="{ active: s.id === currentSessionId }"
            @click="selectSession(s.id)"
          >
            <span class="session-item-icon">
              <IconifyIconOnline icon="ep:chat-dot-round" />
            </span>
            <div class="session-item-body">
              <div class="session-title">{{ s.title }}</div>
              <div class="session-time">{{ dayjs(s.updatedAt).format("MM-DD HH:mm") }}</div>
            </div>
            <button
              type="button"
              class="delete-btn"
              title="删除会话"
              @click.stop="onDeleteSession(s)"
            >
              <IconifyIconOnline icon="ep:close" />
            </button>
          </div>
        </div>
      </aside>

      <section class="chat-main">
        <header class="chat-header">
          <div class="chat-header-title">
            <span class="chat-header-icon">
              <img :src="robotAvatar" alt="智阅助手" class="chat-header-icon-img" />
            </span>
            <div>
              <strong>智阅助手</strong>
              <span>{{ currentSessionTitle() }}</span>
            </div>
          </div>
        </header>

        <div ref="messagesRef" class="messages-area">
          <div v-if="messages.length === 0" class="empty-hint">
            <span class="empty-icon-wrap">
              <img :src="robotAvatar" alt="智阅助手" class="empty-icon-img" />
            </span>
            <p class="empty-title">你好，我是智阅助手</p>
            <p class="empty-desc">可以帮你检索馆藏、办理借还、管理书架</p>
          </div>

          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row"
            :class="msg.role.toLowerCase()"
          >
            <div v-if="msg.role === 'ASSISTANT'" class="avatar assistant-avatar">
              <img :src="robotAvatar" alt="智阅助手" class="avatar-img" />
            </div>

            <div class="bubble" :class="msg.role === 'USER' ? 'user-bubble' : 'assistant-bubble'">
              <MarkdownRenderer v-if="msg.role === 'ASSISTANT' && msg.content" :content="msg.content" />
              <template v-else-if="msg.role === 'USER'">{{ msg.content }}</template>
              <span v-if="msg.streaming" class="typing-cursor">▋</span>

              <div v-if="msg.books && msg.books.length" class="books-scroll">
                <BookCard
                  v-for="book in msg.books"
                  :key="book.id"
                  :book="book"
                  :show-borrow-btn="true"
                />
              </div>
            </div>

            <div v-if="msg.role === 'USER'" class="avatar user-avatar">
              <img :src="userAvatar" alt="用户" class="avatar-img" />
            </div>
          </div>
        </div>

        <footer class="input-area">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            :disabled="sending"
            resize="none"
            @keydown="onKeydown"
          />
          <el-button
            type="primary"
            :loading="sending"
            :disabled="!inputText.trim()"
            class="send-btn"
            @click="onSend"
          >
            发送
          </el-button>
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped>
.agent-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 128px);
  min-height: 560px;
}

.chat-layout {
  display: flex;
  flex: 1;
  width: 100%;
  max-width: 1280px;
  height: 100%;
  min-height: 0;
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgb(99 102 241 / 12%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgb(99 102 241 / 10%);
}

.session-sidebar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 260px;
  min-height: 0;
  background: linear-gradient(180deg, rgb(99 102 241 / 6%), rgb(99 102 241 / 2%) 48%, #fff 100%);
  border-right: 1px solid rgb(99 102 241 / 10%);
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 14px 14px;
  border-bottom: 1px solid rgb(99 102 241 / 8%);
}

.sidebar-brand {
  display: flex;
  gap: 10px;
  align-items: center;
}

.sidebar-brand-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 17px;
  color: #6366f1;
  background: rgb(99 102 241 / 12%);
  border: 1px solid rgb(99 102 241 / 14%);
  border-radius: 10px;
}

.sidebar-brand-text strong {
  display: block;
  font-size: 14px;
  line-height: 1.3;
  color: #1e1b4b;
}

.sidebar-brand-text span {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #9ca3af;
}

.new-session-btn {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgb(99 102 241 / 28%);
  transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
}

.new-session-btn:hover {
  filter: brightness(1.03);
  box-shadow: 0 6px 18px rgb(99 102 241 / 34%);
  transform: translateY(-1px);
}

.new-session-btn:active {
  transform: translateY(0);
}

.session-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 12px 10px 14px;
  overflow-y: auto;
}

.session-item {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 10px 12px 12px;
  cursor: pointer;
  background: rgb(255 255 255 / 72%);
  border: 1px solid rgb(99 102 241 / 8%);
  border-radius: 12px;
  transition: background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.18s;
}

.session-item:hover {
  background: #fff;
  border-color: rgb(99 102 241 / 18%);
  box-shadow: 0 4px 12px rgb(99 102 241 / 10%);
  transform: translateY(-1px);
}

.session-item.active {
  background: #fff;
  border-color: rgb(99 102 241 / 32%);
  box-shadow: 0 4px 16px rgb(99 102 241 / 14%);
}

.session-item.active::before {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 0;
  width: 3px;
  content: "";
  background: linear-gradient(180deg, #6366f1, #818cf8);
  border-radius: 0 3px 3px 0;
}

.session-item-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 15px;
  color: #818cf8;
  background: rgb(99 102 241 / 10%);
  border-radius: 9px;
  transition: color 0.18s, background 0.18s;
}

.session-item.active .session-item-icon {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #818cf8);
}

.session-item-body {
  flex: 1;
  min-width: 0;
}

.session-title {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #312e81;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 3px;
  font-size: 11px;
  color: #9ca3af;
}

.session-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  text-align: center;
}

.session-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 12px;
  font-size: 24px;
  color: #a5b4fc;
  background: rgb(99 102 241 / 8%);
  border: 1px dashed rgb(99 102 241 / 22%);
  border-radius: 14px;
}

.session-empty p {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.session-empty span {
  font-size: 12px;
  line-height: 1.5;
  color: #9ca3af;
}

.delete-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  font-size: 13px;
  color: #9ca3af;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, background 0.15s;
}

.session-item:hover .delete-btn,
.session-item.active .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgb(239 68 68 / 10%);
}

.chat-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.chat-header {
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgb(99 102 241 / 8%);
}

.chat-header-title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-header-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  background: linear-gradient(135deg, rgb(99 102 241 / 14%), rgb(129 140 248 / 10%));
  border: 2px solid rgb(99 102 241 / 18%);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(99 102 241 / 12%);
}

.chat-header-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-header-title strong {
  display: block;
  font-size: 15px;
  line-height: 1.3;
  color: #1e1b4b;
}

.chat-header-title span {
  display: block;
  overflow: hidden;
  font-size: 12px;
  color: #9ca3af;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messages-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  padding: 20px 24px;
  overflow-y: auto;
  background: linear-gradient(180deg, rgb(99 102 241 / 2%), transparent 120px);
}

.empty-hint {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, rgb(99 102 241 / 14%), rgb(129 140 248 / 10%));
  border: 2px solid rgb(99 102 241 / 18%);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgb(99 102 241 / 14%);
}

.empty-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #312e81;
}

.empty-desc {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
}

.message-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}

.message-row.user {
  justify-content: flex-end;
}

.avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.assistant-avatar {
  background: linear-gradient(135deg, rgb(99 102 241 / 14%), rgb(129 140 248 / 10%));
  border: 2px solid rgb(99 102 241 / 18%);
  box-shadow: 0 2px 8px rgb(99 102 241 / 12%);
}

.user-avatar {
  background: linear-gradient(135deg, rgb(99 102 241 / 10%), rgb(129 140 248 / 6%));
  border: 2px solid rgb(99 102 241 / 14%);
  box-shadow: 0 2px 8px rgb(99 102 241 / 10%);
}

.bubble {
  max-width: min(720px, 78%);
  min-width: 0;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  overflow-wrap: anywhere;
  border-radius: 12px;
}

.user-bubble {
  color: #fff;
  white-space: pre-wrap;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  border-bottom-right-radius: 3px;
}

.assistant-bubble {
  color: #374151;
  background: #fff;
  border: 1px solid rgb(99 102 241 / 10%);
  border-bottom-left-radius: 3px;
  box-shadow: 0 1px 4px rgb(99 102 241 / 6%);
}

.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  color: #6366f1;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.books-scroll {
  display: flex;
  gap: 10px;
  padding-bottom: 2px;
  margin-top: 10px;
  overflow-x: auto;
}

.books-scroll :deep(.book-card) {
  max-width: 160px;
}

.books-scroll :deep(.cover-wrap) {
  height: 180px;
}

.input-area {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: flex-end;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid rgb(99 102 241 / 8%);
}

.send-btn {
  flex-shrink: 0;
  min-width: 72px;
  height: 40px;
}

.input-area :deep(.el-textarea__inner) {
  min-height: 56px !important;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 10px;
  box-shadow: none;
}

.input-area :deep(.el-textarea__inner:focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgb(99 102 241 / 12%);
}

:global(html.dark) .chat-layout {
  background: linear-gradient(180deg, rgb(255 255 255 / 4%), rgb(99 102 241 / 8%));
  border-color: rgb(99 102 241 / 15%);
}

:global(html.dark) .session-sidebar {
  background: linear-gradient(180deg, rgb(99 102 241 / 12%), rgb(99 102 241 / 4%) 50%, rgb(15 15 30 / 40%) 100%);
}

:global(html.dark) .sidebar-brand-text strong,
:global(html.dark) .session-title,
:global(html.dark) .chat-header-title strong,
:global(html.dark) .empty-title {
  color: #e0e7ff;
}

:global(html.dark) .session-item {
  background: rgb(255 255 255 / 4%);
  border-color: rgb(99 102 241 / 12%);
}

:global(html.dark) .session-item:hover,
:global(html.dark) .session-item.active {
  background: rgb(255 255 255 / 7%);
  border-color: rgb(99 102 241 / 28%);
}

:global(html.dark) .session-empty p {
  color: #c7d2fe;
}

:global(html.dark) .assistant-bubble {
  color: #d1d5db;
  background: rgb(255 255 255 / 4%);
  border-color: rgb(99 102 241 / 15%);
}

:global(html.dark) .input-area {
  background: transparent;
}

@media (width <= 768px) {
  .agent-page {
    height: calc(100vh - 108px);
    min-height: 480px;
  }

  .session-sidebar {
    width: 200px;
  }

  .sidebar-header {
    padding: 14px 10px 12px;
  }

  .sidebar-brand-text strong {
    font-size: 13px;
  }

  .new-session-btn {
    height: 38px;
    font-size: 13px;
  }

  .session-list {
    padding: 10px 8px 12px;
  }

  .session-item {
    padding: 10px 8px 10px 10px;
  }

  .session-item-icon {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .messages-area {
    padding: 14px 16px;
  }

  .bubble {
    max-width: 88%;
  }
}
</style>
