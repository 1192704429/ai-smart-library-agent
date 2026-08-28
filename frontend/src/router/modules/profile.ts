const Layout = () => import("@/layout/index.vue");

export default {
  path: "/profile",
  name: "ProfileLayout",
  component: Layout,
  redirect: "/profile/index",
  meta: {
    title: "我的主页",
    showLink: false,
    rank: 99
  },
  children: [
    {
      path: "/profile/index",
      name: "Profile",
      component: () => import("@/views/profile/index.vue"),
      meta: {
        title: "我的主页",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
