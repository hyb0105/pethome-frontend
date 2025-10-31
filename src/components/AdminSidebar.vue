<template>
  <el-menu
      :default-active="activeIndex"
      class="admin-sidebar"
      :router="true"
  >
    <div class="sidebar-title">
      PetHome 管理后台
    </div>
    <el-menu-item index="/admin/approvals">
      <el-icon><icon-menu /></el-icon>
      <span>申请审批</span>
    </el-menu-item>
    <el-menu-item index="/admin/pets">
      <el-icon><setting /></el-icon>
      <span>宠物管理</span>
    </el-menu-item>
    <el-menu-item index="/admin/users">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </el-menu-item>
    <el-menu-item index="/admin/posts">
      <el-icon><Document /></el-icon>
      <span>帖子管理</span>
    </el-menu-item>

    <div class="flex-grow"></div>
    <el-menu-item @click="logout" class="logout-item">
      <span>退出登录</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 导入Element Plus图标
import {
  Menu as IconMenu,
  Setting,
  User,
  Document
} from '@element-plus/icons-vue'

const route = useRoute();
const router = useRouter();

// 自动高亮当前激活的菜单项
const activeIndex = computed(() => {
  return route.path;
});

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  router.push('/login');
};
</script>

<style scoped>
.admin-sidebar {
  width: 220px;
  height: 100vh; /* 占满整个屏幕高度 */
  position: fixed; /* 固定在左侧 */
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column; /* 让菜单项垂直排列 */
}
.sidebar-title {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 20px;
  text-align: center;
  color: #333;
}
.flex-grow {
  flex-grow: 1; /* 将退出按钮推到底部 */
}
.logout-item {
  color: #F56C6C; /* 红色，表示退出 */
}
.logout-item:hover {
  background-color: #fef0f0;
}
</style>