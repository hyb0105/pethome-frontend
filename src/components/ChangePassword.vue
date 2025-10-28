<template>
  <div class="page-container">
    <el-card class="password-card">
      <template #header>
        <h2>修改密码</h2>
      </template>

      <el-form
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordFormRef"
          label-width="100px"
          status-icon
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password autocomplete="off" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const passwordFormRef = ref(null);
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 验证 "确认新密码"
const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入的新密码不一致!"));
  } else {
    callback();
  }
};
// 验证 "新密码"
const validateNewPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'));
  } else {
    // 如果确认密码不为空，也触发一次确认密码的验证
    if (passwordForm.confirmPassword !== '') {
      passwordFormRef.value?.validateField('confirmPassword');
    }
    callback();
  }
};

const passwordRules = reactive({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, validator: validateNewPass, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPass, trigger: 'blur' }]
});

// 提交修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      // 验证通过
      try {
        const token = localStorage.getItem('authToken');
        // 【重要】只发送 DTO 需要的 oldPassword 和 newPassword
        const payload = {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        };
        await axios.put('http://localhost:8080/api/user/password', payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        ElMessage.success('密码修改成功！');
        passwordFormRef.value.resetFields(); // 清空表单

      } catch (err) {
        // 后端在旧密码错误时会返回 400 Bad Request
        ElMessage.error(err.response?.data?.message || '旧密码错误或操作失败');
      }
    } else {
      // 验证不通过
      ElMessage.error('请检查表单填写');
      return false;
    }
  });
};
</script>

<style scoped>
.page-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}
.password-card {
  /* 移除了 margin-top，因为这是此页面的主要内容 */
}
</style>