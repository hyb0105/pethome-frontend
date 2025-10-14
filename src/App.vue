<template>
  <div id="app">
    <Navbar v-if="shouldShowNavbar" />
    <main :class="{ 'main-content': shouldShowNavbar }">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar
  },
  computed: {
    // 【修改】更新计算属性，使其同时检查登录和注册页
    shouldShowNavbar() {
      const path = this.$route.path;
      return path !== '/login' && path !== '/register';
    }
  }
};
</script>

<style>
/* 我们添加一些全局样式，让布局更好看 */
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: #f8f9fa; /* 给页面一个浅灰色背景 */
}

.main-content {
  /* 只有在显示导航栏时，才需要这个内边距 */
  padding-top: 60px;
}
</style>