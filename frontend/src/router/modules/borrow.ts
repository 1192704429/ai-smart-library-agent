export default {
  path: "/my-borrows",
  name: "MyBorrows",
  component: () => import("@/views/borrow/index.vue"),
  meta: { title: "借阅记录", icon: "ep:tickets", roles: ["admin", "reader"] }
};
