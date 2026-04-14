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

          <el-card shadow="hover" class="post-card-horizontal" :body-style="{ padding: '0px' }">
            <div class="card-content">

              <div class="image-wrapper">
                <el-image :src="post.coverImageUrl || defaultImage" fit="cover" class="post-photo-horizontal" />
              </div>

              <div class="post-info-horizontal">
                <div>
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-summary">{{ post.summary || '暂无摘要...' }}</p>
                </div>

                <div class="post-meta">
                  <span>作者: {{ post.authorName }}</span>
                  <div class="meta-stats">
                    <span class="meta-stat-item is-collected">
                      <el-icon><StarFilled /></el-icon>
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
.page-container {
  max-width: 1000px; /* 限制一下最大宽度，让排版更好看 */
  margin: 20px auto;
}

.post-card-link {
  text-decoration: none; /* 去除超链接默认的下划线 */
  display: block;
  margin-bottom: 20px;
}

.post-card-horizontal {
  border-radius: 8px;
  overflow: hidden;
}

.card-content {
  display: flex;
  height: 160px; /* 固定卡片整体高度 */
}

/* 【关键修复】图片包装盒：锁定尺寸，flex-shrink: 0 保证绝对不被文字挤压变形 */
.image-wrapper {
  width: 240px;
  height: 160px;
  flex-shrink: 0;
}

.post-photo-horizontal {
  width: 100%;
  height: 100%;
}

/* 【关键修复】信息区：min-width: 0 确保文字溢出隐藏(ellipsis)能正常生效 */
.post-info-horizontal {
  padding: 20px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 让标题和底部信息上下两端对齐 */
}

/* 【关键修复】标题：单行显示，多余变成 ... */
.post-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 【关键修复】摘要：最多显示 2 行，多余变成 ... */
.post-summary {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* 限制2行 */
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between; /* 作者靠左，数据靠右 */
  align-items: center;
  font-size: 13px;
  color: #909399;
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

.is-collected {
  color: #E6A23C;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>