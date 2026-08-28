export default {
  path: "/my-favorites",
  name: "MyFavorites",
  component: () => import("@/views/favorite/index.vue"),
  meta: { title: "藏书书架", icon: "ep:star", roles: ["admin", "reader"] }
};
