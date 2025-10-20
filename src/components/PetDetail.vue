<template>
  <div class="page-container">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-container">
          <el-skeleton-item variant="image" class="skeleton-img" />
          <div class="skeleton-info">
            <el-skeleton-item variant="p" style="width: 50%" />
            <el-skeleton :rows="5" />
          </div>
        </div>
      </template>
      <template #default>
        <el-card v-if="pet" class="pet-detail-card">
          <el-row :gutter="20">
            <el-col :span="10">
              <el-image :src="pet.photoUrl || defaultPetImage" fit="cover" class="pet-photo-large" />
            </el-col>
            <el-col :span="14">
              <div class="pet-info-large">
                <h1>{{ pet.name }}</h1>
                <p class="description">{{ pet.description }}</p>
                <el-descriptions :column="2" border class="info-grid">
                  <el-descriptions-item label="类型">{{ pet.type }}</el-descriptions-item>
                  <el-descriptions-item label="品种">{{ pet.breed }}</el-descriptions-item>
                  <el-descriptions-item label="城市">{{ pet.city }}</el-descriptions-item>
                  <el-descriptions-item label="年龄">{{ pet.age }} 岁</el-descriptions-item>
                  <el-descriptions-item label="性别">
                    <el-tag size="small">{{ pet.gender === 1 ? '雄性' : '雌性' }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="健康状况">{{ pet.healthStatus }}</el-descriptions-item>
                  <el-descriptions-item label="疫苗情况">{{ pet.vaccination }}</el-descriptions-item>
                  <el-descriptions-item label="是否绝育">
                    <el-tag :type="pet.sterilization === 1 ? 'success' : 'info'" size="small">
                      {{ pet.sterilization === 1 ? '是' : '否' }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
                <div class="actions">
                  <el-button v-if="!isAdmin" type="success" size="large" @click="isModalVisible = true">申请领养</el-button>
                  <el-button size="large" @click="$router.push('/')">返回主页</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </template>
    </el-skeleton>

    <el-dialog v-model="isModalVisible" title="领养申请" width="500px">
      <el-form :model="applicationForm" label-position="top">
        <el-form-item label="您的姓名" required>
          <el-input v-model="applicationForm.adopterName" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="applicationForm.adopterPhone" />
        </el-form-item>
        <el-form-item label="申请理由" required>
          <el-input v-model="applicationForm.reason" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isModalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApplication" :loading="isSubmitting">
          {{ isSubmitting ? '提交中...' : '确认提交' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// ======================================================
// 【修改】从 vue 导入 computed
// ======================================================
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import defaultPetImage from '@/assets/test-cat.jpg';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const pet = ref(null);
const loading = ref(true);
const error = ref(null);

const isModalVisible = ref(false);
const isSubmitting = ref(false);
const applicationForm = ref({
  adopterName: '',
  adopterPhone: '',
  reason: ''
});

// ======================================================
// 【新增】一个计算属性，用来判断当前用户是否是管理员
// ======================================================
const isAdmin = computed(() => {
  return localStorage.getItem('userRole') === '1';
});

onMounted(async () => {
  const petId = route.params.id;
  if (!petId) {
    error.value = "未找到宠物ID";
    loading.value = false;
    return;
  }
  try {
    const response = await axios.get(`http://localhost:8080/api/pets/${petId}`);
    pet.value = response.data;
  } catch (err) {
    error.value = '无法加载宠物详情。';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
});

const submitApplication = async () => {
  isSubmitting.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const payload = {
      petId: pet.value.id,
      ...applicationForm.value,
    };
    await axios.post('http://localhost:8080/api/applications', payload, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('您的领养申请已成功提交！');
    isModalVisible.value = false;
  } catch (err) {
    ElMessage.error('提交失败，可能该宠物已被申请或服务器出错。');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.page-container { max-width: 1000px; margin: 20px auto; padding: 20px; }
.pet-photo-large { width: 100%; height: 400px; border-radius: 8px; }
.description { color: #666; margin-bottom: 20px; }
.actions { margin-top: 20px; }
.skeleton-container { display: flex; gap: 20px; }
.skeleton-img { width: 400px; height: 400px; }
.skeleton-info { flex: 1; }
</style>