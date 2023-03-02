import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    baseUrl: 'http://192.168.0.164:8085',
    // baseUrl: 'http://cn.api.wistechx.cn:9004'
    // baseUrl: 'http://cn.api.wistechx.cn:8686/wistechx/bill',
    // baseUrl: 'https://cn.api.wistechx.cn:8686/wistechx/bill'
  },
  getters: {},
  mutations: {},
  actions: {},
  modules: {},
});