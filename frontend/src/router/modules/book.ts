export default [
  {
    path: "/books",
    name: "BookList",
    component: () => import("@/views/book/index.vue"),
    meta: {
      title: "书籍查询",
      icon: "ep:reading",
      roles: ["admin", "reader"],
      rank: 2
    }
  },
  {
    path: "/books/:id",
    name: "BookDetail",
    component: () => import("@/views/book/detail.vue"),
    meta: {
      title: "书目详情",
      roles: ["admin", "reader"],
      showLink: false
    }
  }
];
