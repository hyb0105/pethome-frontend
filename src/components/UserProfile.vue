<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h2>个人中心</h2>
      </template>

      <div v-if="loading">正在加载...</div>
      <el-form v-if="user" :model="user" label-width="100px">
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
          >
            <img v-if="user.avatar" :src="user.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input :value="user.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="user.email" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="user.phone" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="user.realName" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="user.idCard" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateProfile">保存更改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const user = ref(null);
const loading = ref(true);

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  };
});

const fetchUserProfile = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    user.value = response.data;
  } catch (err) {
    ElMessage.error('加载用户信息失败。');
  } finally {
    loading.value = false;
  }
};

const handleAvatarSuccess = (response) => {
  user.value.avatar = response.url;
  ElMessage.success('头像上传成功！请点击“保存更改”以生效。');
};

const beforeAvatarUpload = (rawFile) => {
  const isJpgOrPng = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  if (!isJpgOrPng) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!');
    return false;
  }
  const isLt2M = rawFile.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!');
    return false;
  }
  return true;
};

const updateProfile = async () => {
  try {
    const token = localStorage.getItem('authToken');
    await axios.put('http://localhost:8080/api/user/profile', user.value, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('个人资料更新成功！');
    await fetchUserProfile();
  } catch (err) {
    ElMessage.error('资料更新失败！');
  }
};

onMounted(fetchUserProfile);
</script>

<style scoped>
.page-container { max-width: 800px; margin: 20px auto; padding: 20px; }
.avatar-uploader .avatar { width: 128px; height: 128px; display: block; }
</style>

<style>
/* These styles are global for the uploader component */
.avatar-uploader .el-upload { border: 1px dashed var(--el-border-color); border-radius: 6px; cursor: pointer; position: relative; overflow: hidden; transition: var(--el-transition-duration-fast); }
.avatar-uploader .el-upload:hover { border-color: var(--el-color-primary); }
.el-icon.avatar-uploader-icon { font-size: 28px; color: #8c939d; width: 128px; height: 128px; text-align: center; }
</style>