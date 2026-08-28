export default {
  path: "/admin",
  redirect: "/admin/books",
  meta: { title: "图书管理", icon: "ep:setting", roles: ["admin"] },
  children: [
    {
      path: "/admin/books",
      name: "AdminBooks",
      component: () => import("@/views/admin/book/index.vue"),
      meta: { title: "书籍列表", roles: ["admin"] }
    },
    {
      path: "/admin/borrows",
      name: "AdminBorrows",
      component: () => import("@/views/admin/borrow/index.vue"),
      meta: { title: "借还审核", roles: ["admin"] }
    },
    {
      path: "/admin/users",
      name: "AdminUsers",
      component: () => import("@/views/admin/user/index.vue"),
      meta: { title: "账号管理", roles: ["admin"] }
    },
    {
      path: "/admin/dashboard",
      name: "AdminDashboard",
      component: () => import("@/views/dashboard/index.vue"),
      meta: { title: "运营统计", roles: ["admin"] }
    }
  ]
};
