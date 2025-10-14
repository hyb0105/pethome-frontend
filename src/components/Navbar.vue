<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-brand">PetHome</router-link>
      <div class="navbar-links">
        <router-link to="/" class="nav-link">主页</router-link>
        <router-link to="/my-applications" class="nav-link">我的申请</router-link>

        <div v-if="isAdmin" class="admin-links">
          <router-link to="/admin" class="nav-link admin-link">申请审批</router-link>
          <router-link to="/admin/pets" class="nav-link admin-link">宠物管理</router-link>
        </div>
      </div>
      <div class="navbar-actions">
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppNavbar',
  computed: {
    // 【新增】一个计算属性，用来判断当前用户是否是管理员
    isAdmin() {
      // 从 localStorage 读取角色信息并判断
      // 注意：localStorage 存的是字符串，所以要和 '1' 比较
      return localStorage.getItem('userRole') === '1';
    }
  },
  methods: {
    logout() {
      // 【修改】退出时同时清除角色信息
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 2rem;
}
.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
}
.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}
.navbar-links {
  display: flex;
  gap: 20px;
}
.nav-link {
  text-decoration: none;
  color: #555;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s;
}
.nav-link:hover, .router-link-active {
  background-color: #f0f0f0;
  color: #007bff;
}
.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.admin-link {
  color: #ffc107;
  font-weight: bold;
}
.admin-links {
  display: flex;
  gap: 10px;
  margin-left: 20px; /* 与普通链接隔开一点距离 */
  border-left: 1px solid #ddd;
  padding-left: 20px;
}
</style>