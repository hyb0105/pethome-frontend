<template>
  <el-menu
      :default-active="activeIndex"
      class="navbar"
      mode="horizontal"
      :router="true"
      :ellipsis="false" >
    <el-menu-item index="/" class="navbar-brand">PetHome</el-menu-item>

    <div class="flex-grow" />

    <el-menu-item index="/">主页</el-menu-item>

    <el-menu-item index="/posts">养宠经验</el-menu-item>

    <el-menu-item v-if="!isAdmin" index="/my-applications">我的申请</el-menu-item>

    <el-sub-menu v-if="isLoggedIn" index="user-menu">
      <template #title>
        <el-icon><UserFilled /></el-icon> {{ username || '用户' }}
      </template>
      <el-menu-item index="/profile">个人中心</el-menu-item>
      <el-menu-item index="/my-posts">我的帖子</el-menu-item>
      <el-menu-item index="/my-collections">我的收藏</el-menu-item>
      <el-menu-item index="/addresses">地址管理</el-menu-item>
      <el-menu-item index="/change-password">修改密码</el-menu-item>
      <el-menu-item @click="logout">退出登录</el-menu-item>
    </el-sub-menu>

    <div v-if="!isLoggedIn" class="auth-buttons">
      <el-button type="primary" link @click="$router.push('/login')">登录</el-button>
      <el-divider direction="vertical" />
      <el-button type="primary" @click="$router.push('/register')">注册</el-button>
    </div>

  </el-menu>
</template>

<script>
import { UserFilled } from '@element-plus/icons-vue';

export default {
  name: 'AppNavbar',
  components: { UserFilled },
  data() {
    return {
      isLoggedIn: false,
      username: '',
      isAdmin: false
    };
  },
  computed: {
    activeIndex() {
      if (this.$route.path.startsWith('/posts') || this.$route.path.startsWith('/my-posts')) {
        return '/posts';
      }
      return this.$route.path;
    }
  },
  watch: {
    // 监听路由变化，实时更新登录状态 (因为 localStorage 不是响应式的)
    $route() {
      this.checkLoginStatus();
    }
  },
  mounted() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('authToken');
      this.isLoggedIn = !!token;
      this.isAdmin = localStorage.getItem('userRole') === '1';
      // 假设你在登录时存了 username，如果没有存，这里可以不显示名字
      this.username = localStorage.getItem('username') || '用户';
    },
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      this.isLoggedIn = false;
      this.$router.push('/');


    }
  }
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  align-items: center; /* 垂直居中 */
}
.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}
.flex-grow {
  flex-grow: 1;
}
.auth-buttons {
  display: flex;
  align-items: center;
  margin-right: 20px; /* 离右边稍微远一点 */
}
</style>