<template>
  <div id="app">
    <Navbar v-if="!isLoginPage" />
    <main class="main-content">
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
    // 计算属性，用来判断当前是否在登录页
    isLoginPage() {
      return this.$route.path === '/login';
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
  padding-top: 60px; /* 防止内容被导航栏遮挡 */
}
</style>