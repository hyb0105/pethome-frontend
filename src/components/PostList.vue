<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header-flex">
          <h2>养宠经验帖子</h2>
          <div class="search-box">
            <el-input
                v-model="searchQuery"
                placeholder="搜索帖子标题"
                :prefix-icon="Search"
                @keyup.enter="handleSearch"
                clearable
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" v-loading.fullscreen.lock="loading" element-loading-text="正在加载帖子..."></div>
      <div v-if="error" class="error-text">{{ error }}</div>

      <div class="post-list">
        <router-link :to="`/posts/${post.id}`" v-for="post in posts" :key="post.id" class="post-card-link">
          <el-card shadow="hover" class="post-card-horizontal">
            <div class="card-content">
              <el-image
                  :src="post.coverImageUrl || defaultImage"
                  fit="cover"
                  class="post-photo-horizontal"
              />
              <div class="post-info-horizontal">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-summary">{{ post.summary }}</p>
                <div class="post-meta">
                  <span>作者: {{ post.authorName }}</span>
                  <el-tag size="small">{{ post.category }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </router-link>
      </div>

      <div v-if="!loading && posts.length === 0" class="no-data">
        {{ searchQuery ? '没有搜到相关帖子' : '还没有人分享经验，快去发布吧！' }}
      </div>

      <div v-if="total > 0" class="pagination-container">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="page.pageSize"
            v-model:current-page="page.pageNum"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue'; // 【【新增】】 导入搜索图标
import defaultImage from '@/assets/test-cat.jpg';

const router = useRouter();
const posts = ref([]);
const loading = ref(true);
const error = ref(null);
const total = ref(0);
const searchQuery = ref(''); // 【【新增】】 搜索框数据

const page = reactive({
  pageNum: 1,
  pageSize: 10, // 【【修改】】 按照你的要求，从 5 改为 10
});

// totalPages 已不再需要，分页组件会自动计算
// const totalPages = computed(() => Math.ceil(total.value / page.pageSize));

const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('authToken');
    const params = {
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      title: searchQuery.value || null // 【【新增】】 发送搜索关键词
    };
    const response = await axios.get('http://localhost:8080/api/posts', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    posts.value = response.data.records;
    total.value = response.data.total;
  } catch (err)
  {
    error.value = '无法加载帖子列表。';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (currentPage) => {
  page.pageNum = currentPage;
  fetchPosts();
};

// 【【新增】】 搜索处理
const handleSearch = () => {
  page.pageNum = 1; // 搜索时永远回到第一页
  fetchPosts();
};

onMounted(fetchPosts);
</script>

<style scoped>
/* 【【修改】】 页面加宽 */
.page-container {
  max-width: 1000px; /* 从 900px 增大到 1000px */
  margin: 20px auto;
  padding: 20px;
}

/* 【【新增】】 卡片头部 Flex 布局 */
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-box {
  display: flex;
  gap: 10px;
  width: 300px; /* 限制搜索框宽度 */
}

/* 列表样式 (保持不变) */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.post-card-link {
  text-decoration: none;
  color: inherit;
}
.post-card-horizontal {
  --el-card-padding: 0px;
}
.card-content {
  display: flex;
  height: 160px;
}
.post-photo-horizontal {
  width: 240px;
  height: 160px;
  flex-shrink: 0;
}
.post-info-horizontal {
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  overflow: hidden;
  flex-grow: 1;
}
.post-title {
  font-size: 1.2em;
  font-weight: bold;
  margin: 0 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.post-summary {
  font-size: 0.9em;
  color: #666;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 0.85em;
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