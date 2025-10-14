<template>
  <div class="register-container">
    <div class="register-form">
      <h2>注册 PetHome 账号</h2>
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="form.username" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="form.password" required>
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" v-model="form.email" required>
      </div>
      <div class="form-group">
        <label for="phone">电话</label>
        <input type="tel" id="phone" v-model="form.phone">
      </div>
      <button @click="handleRegister" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="login-link">
        已有账号？ <router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserRegister',
  data() {
    return {
      form: {
        username: '',
        password: '',
        email: '',
        phone: ''
      },
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async handleRegister() {
      if (!this.form.username || !this.form.password || !this.form.email) {
        this.errorMessage = '用户名、密码和邮箱不能为空！';
        return;
      }
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await axios.post('http://localhost:8080/api/user/register', this.form);
        if (response.data.code === 200) {
          alert('注册成功！现在您可以登录了。');
          this.$router.push('/login'); // 注册成功后跳转到登录页
        } else {
          this.errorMessage = response.data.message || '注册失败，请重试。';
        }
      } catch (error) {
        console.error("注册失败:", error);
        this.errorMessage = '注册失败，用户名可能已被占用或服务器出错。';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* 样式与登录页面非常相似 */
.register-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f4f4f4; }
.register-form { padding: 40px; background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); width: 380px; text-align: center; }
.form-group { margin-bottom: 20px; text-align: left; }
label { display: block; margin-bottom: 5px; }
input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
button { width: 100%; padding: 10px; border: none; border-radius: 4px; background-color: #28a745; color: white; font-size: 16px; cursor: pointer; }
.error-message { color: red; margin-top: 15px; }
.login-link { margin-top: 20px; font-size: 0.9em; }
</style>