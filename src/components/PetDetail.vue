<template>
  <div class="detail-container">
    <div v-if="loading" class="loading">正在加载宠物信息...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="pet" class="pet-detail-card">
      <img :src="pet.photoUrl || defaultPetImage" :alt="pet.name" class="pet-photo-large">
      <div class="pet-info-large">
        <h1>{{ pet.name }}</h1>
        <div class="info-grid">
          <p><strong>类型:</strong> {{ pet.type }}</p>
          <p><strong>品种:</strong> {{ pet.breed }}</p>
          <p><strong>年龄:</strong> {{ pet.age }} 岁</p>
          <p><strong>性别:</strong> {{ pet.gender === 1 ? '雄性' : '雌性' }}</p>
          <p><strong>健康状况:</strong> {{ pet.healthStatus }}</p>
          <p><strong>疫苗情况:</strong> {{ pet.vaccination }}</p>
          <p><strong>是否绝育:</strong> {{ pet.sterilization === 1 ? '是' : '否' }}</p>
        </div>
        <p class="description"><strong>描述:</strong> {{ pet.description }}</p>
        <div class="actions">
          <button class="apply-btn">申请领养</button>
          <router-link to="/" class="back-link">返回主页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import defaultPetImage from '@/assets/test-cat.jpg'; // 复用我们的默认图片

export default {
  name: 'PetDetail',
  data() {
    return {
      pet: null,
      loading: true,
      error: null,
      defaultPetImage: defaultPetImage,

      // 【新增】与弹窗和表单相关的数据
      isModalVisible: false, // 控制弹窗是否显示
      isSubmitting: false, // 控制提交按钮状态，防止重复提交
      formError: '', // 用于显示表单的错误信息
      applicationForm: {
        adopterName: '',
        adopterPhone: '',
        reason: ''
      }
    };
  },
  async created() {
    const petId = this.$route.params.id; // 从URL中获取宠物ID
    if (!petId) {
      this.error = "未找到宠物ID";
      this.loading = false;
      return;
    }


    try {
      const response = await axios.get(`http://localhost:8080/api/pets/${petId}`);
      this.pet = response.data;
    } catch (err) {
      console.error('获取宠物详情失败:', err);
      this.error = '无法加载宠物详情，请检查ID是否正确。';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    // 【新增】显示弹窗的方法
    showApplicationModal() {
      // 【在这里新增一行日志代码】
      // ======================================================
      console.log('“申请领养”按钮被点击了！');
      this.isModalVisible = true;
    },
    // 【新增】关闭弹窗的方法
    closeApplicationModal() {
      this.isModalVisible = false;
      this.formError = ''; // 关闭时清空错误信息
    },
    // 【新增】提交申请的方法
    async submitApplication() {
      this.isSubmitting = true;
      this.formError = '';
      const token = localStorage.getItem('authToken');

      if (!token) {
        this.formError = '请先登录再提交申请！';
        this.isSubmitting = false;
        this.$router.push('/login');
        return;
      }

      try {
        const payload = {
          petId: this.pet.id,
          adopterName: this.applicationForm.adopterName,
          adopterPhone: this.applicationForm.adopterPhone,
          reason: this.applicationForm.reason,
        };

        await axios.post('http://localhost:8080/api/applications', payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        alert('您的领养申请已成功提交！');
        this.closeApplicationModal();
        // 提交成功后可以考虑跳转到“我的申请”页面，或者刷新当前页面状态
        // this.$router.push('/my-applications');
      } catch (err) {
        console.error('申请提交失败:', err);
        this.formError = '提交失败，可能该宠物已被申请或服务器出错。';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.detail-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
}
.pet-detail-card {
  display: flex;
  gap: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
}
.pet-photo-large {
  width: 400px;
  height: 400px;
  object-fit: cover;
}
.pet-info-large {
  padding: 20px;
  flex: 1;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 20px 0;
}
.description {
  margin-top: 20px;
}
.actions {
  margin-top: 30px;
}
.apply-btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.back-link {
  margin-left: 20px;
  color: #007bff;
}
/* ====================================================== */
/* 【新增】弹窗相关的样式                                     */
/* ====================================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.modal-content h3 {
  margin-top: 0;
  text-align: center;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-actions .cancel-btn {
  background-color: #6c757d;
  color: white;
}
.error-message {
  color: red;
  font-size: 0.9em;
  text-align: center;
}
</style>