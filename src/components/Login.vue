<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>登录 PetHome</h2>
        </div>
      </template>

      <el-form :model="form" label-width="80px" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
          <div style="text-align: center; margin-top: 10px;">
            <el-button link @click="goBackHome">返回主页</el-button>
          </div>
        </el-form-item>
      </el-form>

      <p class="register-link">
        还没有账号？ <router-link to="/register">立即注册</router-link>
      </p>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ElMessage } from 'element-plus';

export default {
  name: 'UserLogin',
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      loading: false,
    };
  },
  methods: {
    // 【修复】点击返回主页的方法
    goBackHome() {
      // 使用 replace 而不是 push，这样可以把历史记录里的“登录页”替换掉，防止返回死循环
      this.$router.replace('/');
    },

    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        ElMessage.error('用户名和密码不能为空！');
        return;
      }
      this.loading = true;
      try {
        const response = await axios.post('http://localhost:8080/api/user/login', {
          username: this.form.username,
          password: this.form.password
        });

        if (response.data.code === 200 && response.data.token) {
          const token = response.data.token;
          const decodedToken = jwtDecode(token);
          const userRole = String(decodedToken.role); // 确保转为字符串比较

          localStorage.setItem('authToken', token);
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('username', this.form.username);

          ElMessage.success('登录成功！');

          // 【修复】登录后的跳转逻辑
          if (userRole === '1') {
            this.$router.replace('/admin/dashboard'); // 管理员去看板
          } else {
            this.$router.replace('/'); // 用户回首页
          }

        } else {
          ElMessage.error(response.data.message || '登录失败，请重试。');
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('用户名或密码错误，或服务器无法连接。');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
}
.login-button {
  width: 100%;
}
.register-link {
  margin-top: 15px;
  text-align: center;
  font-size: 0.9em;
}
</style>