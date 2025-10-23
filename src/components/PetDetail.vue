<template>
  <div class="page-container">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-card class="pet-detail-card-new skeleton-card">
          <el-skeleton-item variant="h1" style="width: 30%; margin-bottom: 10px;" />
          <div class="skeleton-tags">
            <el-skeleton-item variant="text" style="width: 80px; margin-right: 10px;" />
            <el-skeleton-item variant="text" style="width: 50px; margin-right: 10px;" />
            <el-skeleton-item variant="text" style="width: 50px; margin-right: 10px;" />
            <el-skeleton-item variant="text" style="width: 100px;" />
          </div>
          <el-skeleton-item variant="image" class="skeleton-img-new" />
          <el-skeleton :rows="3" style="margin-top: 20px;"/>
        </el-card>
      </template>

      <template #default>
        <el-card v-if="pet" class="pet-detail-card-new">
          <h1 class="pet-name">{{ pet.name }}</h1>

          <div class="pet-tags-new">
            <el-tag effect="plain" round>{{ pet.type }} / {{ pet.breed }}</el-tag>
            <el-tag effect="plain" round>{{ genderText }}</el-tag>
            <el-tag effect="plain" round>{{ pet.age }} 岁</el-tag>
            <el-tag type="success" effect="plain" round>{{ pet.vaccination }}</el-tag>
            <el-tag v-if="pet.sterilization === 1" type="info" effect="plain" round>已绝育</el-tag>
          </div>

          <el-image
              :src="pet.photoUrl || defaultPetImage"
              fit="cover"
              class="pet-photo-main"
              :preview-src-list="[pet.photoUrl || defaultPetImage]"
              hide-on-click-modal
              preview-teleported
          />

          <div class="description-section">
            <h3>宠物介绍</h3>
            <p class="description-text">{{ pet.description || '暂无详细介绍。' }}</p>
          </div>

          <div class="actions-new">
            <el-button v-if="!isAdmin" type="success" size="large" @click="isModalVisible = true">申请领养</el-button>
            <el-button size="large" @click="$router.push('/')">返回主页</el-button>
          </div>

        </el-card>
        <el-empty v-else-if="!loading" description="未找到该宠物的信息" />
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
import { ref, onMounted, computed, watch } from 'vue';
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
  reason: '',
  addressId: null
});

const isAdmin = computed(() => {
  return localStorage.getItem('userRole') === '1';
});

// 【新增】计算属性用于显示性别文字
const genderText = computed(() => {
  if (!pet.value) return '';
  // 根据目标图片调整文字
  return pet.value.gender === 1 ? '公' : '母';
});
// 【新增】存储用户地址列表
const userAddresses = ref([]);
const isFetchingAddresses = ref(false);

onMounted(async () => {
  const petId = route.params.id;
  if (!petId) {
    error.value = "未找到宠物ID";
    loading.value = false;
    return;
  }
  try {
    // 【修改】确保请求时带上 Auth Token，即使 GET /api/pets/{id} 是公开的
    // 因为后端 PetService/PetMapper 可能未来会根据用户角色返回不同信息
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`http://localhost:8080/api/pets/${petId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    pet.value = response.data;
  } catch (err) {
    error.value = '无法加载宠物详情。';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
});

const submitApplication = async () => {
  // 添加地址校验
  if (!applicationForm.value.addressId) {
    ElMessage.error('请选择一个收货地址');
    return;
  }
  // 添加其他字段校验 (如果需要)
  if (!applicationForm.value.adopterName || !applicationForm.value.adopterPhone || !applicationForm.value.reason) {
    ElMessage.error('请填写完整的申请信息');
    return;
  }
  isSubmitting.value = true;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // 如果没有 token，提示登录
      ElMessage.warning('请先登录后再提交申请。');
      router.push('/login');
      return;
    }
    const payload = {
      petId: pet.value.id,
      ...applicationForm.value,
    };
    await axios.post('http://localhost:8080/api/applications', payload, {
      headers: {'Authorization': `Bearer ${token}`}
    });
    ElMessage.success('您的领养申请已成功提交！');
    isModalVisible.value = false;
    // 清空表单，以便下次打开是空的
    applicationForm.value = {adopterName: '', adopterPhone: '', reason: '', addressId: null };
  } catch (err) {
    ElMessage.error('提交失败，可能该宠物已被申请或服务器出错。');
  } finally {
    isSubmitting.value = false;
  }
};

// 【新增】获取用户地址的方法
const fetchUserAddresses = async () => {
  // 只有在弹窗可见时才获取
  if (!isModalVisible.value) return;
  isFetchingAddresses.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/addresses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    userAddresses.value = response.data;
    // 如果有默认地址，自动选中
    const defaultAddr = userAddresses.value.find(addr => addr.isDefault === 1);
    if (defaultAddr) {
      applicationForm.value.addressId = defaultAddr.id;
    } else if (userAddresses.value.length > 0) {
      // 如果没有默认，选中第一个
      applicationForm.value.addressId = userAddresses.value[0].id;
    }

  } catch (error) {
    ElMessage.error('加载地址失败，请稍后再试');
    // 加载失败时清空地址列表，避免用户选择无效地址
    userAddresses.value = [];
    applicationForm.value.addressId = null;
  } finally {
    isFetchingAddresses.value = false;
  }
};

// 【新增】格式化地址用于下拉选项显示
const formatAddressOption = (addr) => {
  return `${addr.recipientName} - ${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detailedAddress}`;
};

// 【新增】监听弹窗状态，打开时获取地址
watch(isModalVisible, (newValue) => {
  if (newValue) {
    fetchUserAddresses();
    // 也可以在这里预填姓名和电话 (如果用户信息里有)
    // applicationForm.value.adopterName = ...
    // applicationForm.value.adopterPhone = ...
  } else {
    // 关闭时清空地址列表和选择
    userAddresses.value = [];
    applicationForm.value.addressId = null;
  }
});
</script>

<style scoped>
.page-container {
  max-width: 800px; /* 调整最大宽度以适应单列布局 */
  margin: 20px auto;
  padding: 20px;
}

/* 新卡片样式 */
.pet-detail-card-new {
  padding: 20px; /* 给卡片内部一些边距 */
}

/* 宠物名称 */
.pet-name {
  text-align: center;
  margin-bottom: 10px;
  font-size: 2.2em; /* 增大字号 */
}

/* 标签组 */
.pet-tags-new {
  display: flex;
  justify-content: center; /* 居中显示 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px; /* 标签之间的间距 */
  margin-bottom: 25px; /* 与图片拉开距离 */
}

/* 主图片 */
.pet-photo-main {
  width: 100%;
  height: auto; /* 高度自适应 */
  max-height: 500px; /* 可以设置最大高度 */
  border-radius: 8px; /* 轻微圆角 */
  display: block; /* 避免图片下方出现空隙 */
  margin-bottom: 20px; /* 与描述文字拉开距离 */
  object-fit: cover; /* 保持图片比例 */
}

/* 描述区域 */
.description-section h3 {
  margin-bottom: 10px;
  border-bottom: 1px solid #eee; /* 添加下划线 */
  padding-bottom: 5px;
  font-size: 1.2em;
}

.description-text {
  color: #555; /* 调整文字颜色 */
  line-height: 1.8; /* 增大行高 */
  text-indent: 2em; /* 首行缩进 */
}

/* 操作按钮区域 */
.actions-new {
  margin-top: 30px; /* 与上方内容拉开距离 */
  text-align: center; /* 按钮居中 */
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 骨架屏样式调整 */
.skeleton-card {
  padding: 20px;
}

.skeleton-tags {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}

.skeleton-img-new {
  width: 100%;
  height: 400px; /* 骨架屏图片高度 */
  margin-bottom: 20px;
}

/* 移除旧的特定布局样式 (如果还存在) */
/* .pet-photo-large, .description, .actions, .skeleton-container, .skeleton-img, .skeleton-info { ... } */
</style>