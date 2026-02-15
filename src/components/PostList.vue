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
              <el-image :src="post.coverImageUrl || defaultImage" fit="cover" class="post-photo-horizontal" />
              <div class="post-info-horizontal">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-summary">{{ formatSummary(post.summary) }}</p>

                <div class="post-meta">
                  <span>作者: {{ post.authorName }}</span>
                  <div class="meta-stats">
                  <span class="meta-stat-item" :class="{ 'is-collected': post.likedByCurrentUser }">
                    <el-icon v-if="post.likedByCurrentUser" color="#E6A23C"><StarFilled /></el-icon>
                    <el-icon v-else><Star /></el-icon>
                    {{ post.likes }} 收藏
                  </span>

                    <span class="meta-stat-item">
                    <el-icon><View /></el-icon>
                    {{ post.views }}
                  </span>
                    <el-tag size="small">{{ post.category }}</el-tag>
                  </div>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Search, View, Star, StarFilled } from '@element-plus/icons-vue';
import defaultImage from '@/assets/test-cat.jpg';



const router = useRouter();
const posts = ref([]);
const loading = ref(true);
const error = ref(null);
const total = ref(0);
const searchQuery = ref('');


const page = reactive({
  pageNum: 1,
  pageSize: 10,
});

const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('authToken');
    const params = {
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      title: searchQuery.value || null
    };
    const response = await axios.get('http://localhost:8080/api/posts', {
      params,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
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

const handleSearch = () => {
  page.pageNum = 1;
  fetchPosts();
};

// 【新增】处理摘要文字长度
const formatSummary = (text) => {
  if (!text) return '暂无摘要';
  const maxLength = 50; // 限制显示 50 个字，你可以根据需要调整
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

onMounted(fetchPosts);
</script>

<style scoped>
/* ... (大部分样式保持不变) ... */
.page-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-box {
  display: flex;
  gap: 10px;
  width: 300px;
}
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
/* 修改对应的 CSS */
.post-summary {
  font-size: 0.9em;
  color: #666;
  /* flex-grow: 1;  <-- 建议注释掉或删除这行，防止它过度撑开 */
  margin-bottom: 10px; /* 给下方留点空隙 */
  height: 45px; /* 给一个大概的高度，容纳3行文字 */
  line-height: 1.5; /* 设置行高 */
  overflow: hidden;
  /* 保持 CSS 截断作为双重保障 */
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
.meta-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 【【【 修复：确保 CSS 类名 .meta-stat-item 与 HTML 匹配 】】】 */
.meta-stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px; /* 图标和文字的间距 */
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
/* 给收藏加个颜色样式 */
.is-collected {
  color: #E6A23C; /* 橙色代表收藏 */
  font-weight: bold;
}

</style>