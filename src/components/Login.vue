<template>
  <div class="login-container">
    <div class="login-form">
      <h2>登录 PetHome</h2>
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="username" placeholder="请输入用户名">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码">
      </div>
      <button @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserLogin',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        this.errorMessage = '用户名和密码不能为空！';
        return;
      }
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await axios.post('http://localhost:8080/api/user/login', {
          username: this.username,
          password: this.password
        });
        if (response.data.code === 200 && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          // 【修改】使用路由跳转到主页
          this.$router.push('/');
        } else {
          this.errorMessage = response.data.message || '登录失败，请重试。';
        }
      } catch (error) {
        this.errorMessage = '用户名或密码错误，或服务器无法连接。';
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
  height: 100vh;
  background-color: #f4f4f4;
}
.login-form {
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 350px;
  text-align: center;
}
.form-group {
  margin-bottom: 20px;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
button:disabled {
  background-color: #aaa;
}
.error-message {
  color: red;
  margin-top: 15px;
}
</style>