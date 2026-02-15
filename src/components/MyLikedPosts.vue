<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>我收藏的帖子</h2>
        </div>
      </template>

      <div v-if="loading" v-loading="loading" element-loading-text="正在加载收藏内容..."></div>
      <div v-else-if="error" class="error-text">{{ error }}</div>

      <div v-else class="post-list">
        <router-link :to="`/posts/${post.id}`" v-for="post in posts" :key="post.id" class="post-card-link">
          <el-card shadow="hover" class="post-card-horizontal">
            <div class="card-content">
              <el-image :src="post.coverImageUrl || defaultImage" fit="cover" class="post-photo-horizontal" />
              <div class="post-info-horizontal">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-summary">{{ post.summary }}</p>
                <div class="post-meta">
                  <span>作者: {{ post.authorName }}</span>
                  <div class="meta-stats">
                    <span class="meta-stat-item is-collected">
                      <el-icon color="#E6A23C"><StarFilled /></el-icon>
                      {{ post.likes }} 收藏
                    </span>
                    <span class="meta-stat-item">
                      <el-icon><View /></el-icon>
                      {{ post.views }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </router-link>
      </div>

      <el-empty v-if="!loading && posts.length === 0" description="暂无收藏的帖子" />

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
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { View, StarFilled } from '@element-plus/icons-vue';
import defaultImage from '@/assets/test-cat.jpg';

const posts = ref([]);
const loading = ref(true);
const error = ref(null);
const total = ref(0);
const page = reactive({ pageNum: 1, pageSize: 10 });

const fetchCollectedPosts = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    // 【关键修改】：路径改为 my/collections
    const response = await axios.get('http://localhost:8080/api/posts/my/collections', {
      params: { pageNum: page.pageNum, pageSize: page.pageSize },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    posts.value = response.data.records;
    total.value = response.data.total;
  } catch (err) {
    error.value = '无法加载收藏列表。';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (p) => {
  page.pageNum = p;
  fetchCollectedPosts();
};
onMounted(fetchCollectedPosts);
</script>

<style scoped>
/* 保持原有样式不变 */
.is-collected {
  color: #E6A23C;
  font-weight: bold;
}

.post-card-horizontal {
  margin-bottom: 15px;
}

.card-content {
  display: flex;
  height: 140px;
}

.post-photo-horizontal {
  width: 200px;
  height: 140px;
}

.post-info-horizontal {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.meta-stats {
  display: flex;
  gap: 15px;
}

.meta-stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>