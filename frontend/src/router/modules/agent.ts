export default {
  path: "/chat",
  name: "AgentChat",
  component: () => import("@/views/agent/index.vue"),
  meta: {
    title: "智阅助手",
    icon: "ep:chat-dot-round",
    roles: ["admin", "reader"],
    hideFooter: true,
    noMargin: true
  }
};
