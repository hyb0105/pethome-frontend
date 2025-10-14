<template>
  <el-menu
      :default-active="activeIndex"
      class="navbar"
      mode="horizontal"
      :router="true"
  >
    <el-menu-item index="/" class="navbar-brand">PetHome</el-menu-item>

    <div class="flex-grow" />

    <el-menu-item index="/">主页</el-menu-item>
    <el-menu-item v-if="!isAdmin" index="/my-applications">我的申请</el-menu-item>
    <el-menu-item index="/profile">个人中心</el-menu-item>

    <el-sub-menu v-if="isAdmin" index="/admin">
      <template #title>后台管理</template>
      <el-menu-item index="/admin">申请审批</el-menu-item>
      <el-menu-item index="/admin/pets">宠物管理</el-menu-item>
    </el-sub-menu>

    <el-menu-item @click="logout">退出登录</el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: 'AppNavbar',
  data() {
    return {
      // data中不再需要 activeIndex，因为 ElMenu 配合 :router="true" 会自动高亮
    };
  },
  computed: {
    isAdmin() {
      return localStorage.getItem('userRole') === '1';
    },
    // 计算属性，确保导航栏能正确高亮当前页面
    activeIndex() {
      return this.$route.path;
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.navbar {
  position: fixed; /* 固定在页面顶部 */
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}
.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}
.flex-grow {
  flex-grow: 1; /* 占据所有剩余空间，将右侧菜单推到最右 */
}
</style>