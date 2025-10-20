<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>注册 PetHome 账号</h2>
        </div>
      </template>

      <el-form :model="form" label-position="top">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" size="large" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" type="tel" placeholder="请输入电话号码 (可选)" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="handleRegister" :loading="loading" class="register-button">
            {{ loading ? '注册中...' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <p class="login-link">
        已有账号？ <router-link to="/login">立即登录</router-link>
      </p>
    </el-card>
  </div>
</template>

<script setup>
// 【修改】使用 <script setup> 语法，更简洁
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const router = useRouter();

const form = ref({
  username: '',
  password: '',
  email: '',
  phone: ''
});
const loading = ref(false);

const handleRegister = async () => {
  if (!form.value.username || !form.value.password || !form.value.email) {
    ElMessage.error('用户名、密码和邮箱不能为空！');
    return;
  }
  loading.value = true;
  try {
    const response = await axios.post('http://localhost:8080/api/user/register', form.value);
    if (response.data.code === 200) {
      ElMessage.success('注册成功！现在您可以登录了。');
      router.push('/login'); // 注册成功后跳转到登录页
    } else {
      ElMessage.error(response.data.message || '注册失败，请重试。');
    }
  } catch (error) {
    console.error("注册失败:", error);
    ElMessage.error('注册失败，用户名可能已被占用或服务器出错。');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
.register-card {
  width: 400px;
}
.card-header {
  text-align: center;
}
.register-button {
  width: 100%;
}
.login-link {
  margin-top: 15px;
  text-align: center;
  font-size: 0.9em;
}
</style>