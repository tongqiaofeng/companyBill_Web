import Vue from "vue";
import VueRouter from "vue-router";
import Login from '@/views/login'

Vue.use(VueRouter);

const routes = [{
    path: "/",
    component: Login,
    children: [{
      path: "/login",
      component: Login,
    }]
  },
  { //主页
    path: "/home",
    name: "Home",
    component: () => import("@/views/home"),
  }
];

const router = new VueRouter({
  mode: "history",
  base: "/bill/",
  routes,
});

export default router;