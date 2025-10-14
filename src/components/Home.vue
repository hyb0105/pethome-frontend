<template>
  <div class="home-container">
    <el-card class="search-card">
      <div class="search-bar">
        <el-input v-model="searchParams.type" placeholder="类型 (如: 猫)" clearable />
        <el-input v-model="searchParams.breed" placeholder="品种 (如: 布偶)" clearable />
        <el-input v-model="searchParams.city" placeholder="城市" clearable />
        <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </el-card>

    <div v-if="loading" v-loading.fullscreen.lock="loading" element-loading-text="正在加载宠物信息..."></div>
    <div v-if="error" class="error-text">{{ error }}</div>

    <el-row :gutter="20" class="pet-list">
      <el-col :xs="24" :sm="12" :md="8" v-for="pet in pets" :key="pet.id">
        <router-link :to="`/pet/${pet.id}`" class="pet-card-link">
          <el-card shadow="hover" class="pet-card">
            <el-image :src="pet.photoUrl || defaultPetImage" fit="cover" class="pet-photo" />
            <div class="pet-info">
              <h3>{{ pet.name }}</h3>
              <div class="pet-tags">
                <span>{{ pet.breed }} ({{ pet.type }})</span>
                <span>{{ pet.age }} 岁</span>
              </div>
            </div>
          </el-card>
        </router-link>
      </el-col>
    </el-row>

    <div v-if="!loading && pets.length === 0" class="no-data">
      没有找到符合条件的宠物。
    </div>

    <div v-if="totalPages > 1" class="pagination-container">
      <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="page.pageSize"
          v-model:current-page="page.pageNum"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
// 【重要修改】我们开始使用 <script setup> 语法，这是Vue3更推荐的写法，代码更简洁
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import defaultPetImage from '@/assets/test-cat.jpg';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue'; // 导入搜索图标

const router = useRouter();

const pets = ref([]);
const loading = ref(true);
const error = ref(null);
const total = ref(0);

const page = reactive({
  pageNum: 1,
  pageSize: 6,
});

const searchParams = reactive({
  type: '',
  breed: '',
  city: ''
});

const totalPages = computed(() => Math.ceil(total.value / page.pageSize));

const fetchPets = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const params = {
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      type: searchParams.type || null,
      breed: searchParams.breed || null,
      city: searchParams.city || null,
    };
    const response = await axios.get('http://localhost:8080/api/pets', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    pets.value = response.data.records;
    total.value = response.data.total;
  } catch (err) {
    error.value = '无法加载宠物列表，请稍后再试。';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (currentPage) => {
  page.pageNum = currentPage;
  fetchPets();
};

const handleSearch = () => {
  page.pageNum = 1;
  fetchPets();
};

const resetSearch = () => {
  searchParams.type = '';
  searchParams.breed = '';
  searchParams.city = '';
  page.pageNum = 1;
  fetchPets();
};

// onMounted 是一个新的生命周期钩子，在 <script setup> 中使用，等同于之前的 created
onMounted(() => {
  fetchPets();
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.search-bar {
  display: flex;
  gap: 15px;
}
.pet-list {
  margin-top: 20px;
}
.pet-card-link {
  text-decoration: none;
}
.pet-photo {
  width: 100%;
  height: 200px;
}
.pet-info {
  padding: 14px;
}
.pet-info h3 {
  margin: 0 0 10px;
}
.pet-tags {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #999;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
.no-data, .error-text {
  text-align: center;
  margin-top: 40px;
  font-size: 1.2rem;
  color: #666;
}
</style>