<template>
  <div class="profile-container">
    <h2>个人中心</h2>
    <div v-if="loading" class="loading">正在加载您的信息...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="user" class="profile-form">
      <div class="avatar-section">
        <img :src="user.avatar || defaultAvatar" alt="User Avatar" class="avatar-preview">
        <input type="file" @change="handleFileChange" accept="image/*" ref="fileInput" style="display: none;">
        <button @click="$refs.fileInput.click()" class="btn-upload">更换头像</button>
        <button @click="uploadAvatar" v-if="selectedFile" class="btn-confirm-upload">确认上传</button>
      </div>
      <div class="form-group">
        <label>用户名</label>
        <input :value="user.username" type="text" disabled>
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="user.email" type="email">
      </div>
      <div class="form-group">
        <label>电话</label>
        <input v-model="user.phone" type="tel">
      </div>
      <div class="form-group">
        <label>真实姓名</label>
        <input v-model="user.realName" type="text">
      </div>
      <div class="form-group">
        <label>身份证号</label>
        <input v-model="user.idCard" type="text">
      </div>
      <button @click="updateProfile" class="btn-save">保存更改</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import defaultAvatar from '@/assets/test-cat.jpg'; // 我们暂时复用这张图片作为默认头像

export default {
  name: 'UserProfile',
  data() {
    return {
      user: null,
      loading: true,
      error: null,
      selectedFile: null,
      defaultAvatar: defaultAvatar
    };
  },
  async created() {
    await this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.user = response.data;
      } catch (err) {
        this.error = '加载用户信息失败。';
      } finally {
        this.loading = false;
      }
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
      // 创建一个临时的URL用于本地预览
      if (this.selectedFile) {
        this.user.avatar = URL.createObjectURL(this.selectedFile);
      }
    },
    async uploadAvatar() {
      if (!this.selectedFile) return;
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.post('http://localhost:8080/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        this.user.avatar = response.data.url; // 将返回的URL更新到用户信息中
        this.selectedFile = null; // 清空已选择的文件
        alert('头像上传成功！请点击“保存更改”来更新您的资料。');
      } catch (err) {
        alert('头像上传失败！');
      }
    },
    async updateProfile() {
      const token = localStorage.getItem('authToken');
      try {
        await axios.put('http://localhost:8080/api/user/profile', this.user, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('个人资料更新成功！');
        await this.fetchUserProfile(); // 刷新以获取最新的updateTime等信息
      } catch (err) {
        alert('资料更新失败！');
      }
    }
  }
};
</script>

<style scoped>
.profile-container { max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
h2 { text-align: center; margin-bottom: 30px; }
.avatar-section { text-align: center; margin-bottom: 30px; }
.avatar-preview { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #eee; margin-bottom: 15px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.form-group input:disabled { background-color: #f8f9fa; cursor: not-allowed; }
.btn-upload, .btn-confirm-upload, .btn-save { width: 100%; padding: 12px; border: none; border-radius: 5px; cursor: pointer; color: white; font-size: 1em; }
.btn-upload { background-color: #007bff; margin-bottom: 10px; }
.btn-confirm-upload { background-color: #ffc107; color: #333; }
.btn-save { background-color: #28a745; margin-top: 10px; }
</style>