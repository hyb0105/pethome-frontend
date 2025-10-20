<template>
  <div id="app">
    <div v-if="isAdminRoute" class="admin-layout">
      <AdminSidebar />
      <main class="admin-content">
        <router-view></router-view>
      </main>
    </div>

    <div v-else-if="shouldShowNavbar" class="user-layout">
      <Navbar />
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>

    <div v-else class="auth-layout">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
// 【新增】导入管理员侧边栏
import AdminSidebar from './components/AdminSidebar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    AdminSidebar // 【新增】注册组件
  },
  computed: {
    // 【新增】判断是否为管理员页面
    isAdminRoute() {
      // 检查当前路由是否以 /admin 开头
      return this.$route.path.startsWith('/admin');
    },
    shouldShowNavbar() {
      const path = this.$route.path;
      // 【修改】同时排除登录、注册和管理员页面
      return path !== '/login' && path !== '/register' && !this.isAdminRoute;
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

/* 【修改】为不同布局设置不同的内容区样式 */
.main-content {
  padding-top: 60px; /* 顶部导航栏的高度 */
}
.admin-layout {
  display: flex;
}
.admin-content {
  flex-grow: 1;
  padding-left: 220px; /* 左侧菜单的宽度 */
  /* 我们给内容区也加一点内边距，让它在el-card之外有呼吸空间 */
  padding: 20px;
  box-sizing: border-box; /* 确保 padding 不会撑大宽度 */
}

/* 登录/注册页的布局(如果有需要) */
.auth-layout {
  /* 登录和注册页自己会处理居中 */
}
</style>