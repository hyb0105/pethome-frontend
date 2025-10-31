<template>
  <div class="page-container">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-card class="post-detail-card">
          <el-skeleton-item variant="h1" style="width: 60%; margin-bottom: 20px;" />
          <div class="meta-skeleton">
            <el-skeleton-item variant="text" style="width: 150px; margin-right: 20px;" />
            <el-skeleton-item variant="text" style="width: 100px;" />
          </div>
          <el-skeleton :rows="8" style="margin-top: 30px;"/>
        </el-card>
      </template>

      <template #default>
        <el-card v-if="post" class="post-detail-card">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <span>作者: {{ post.authorName }}</span>
            <span>发布于: {{ new Date(post.createTime).toLocaleString() }}</span>
            <el-tag>{{ post.category }}</el-tag>
          </div>

          <div class="post-content ql-snow">
            <div class="ql-editor" v-html="post.content"></div>
          </div>

          <el-divider />
          <div style="text-align: center; margin-top: 20px;">
            <el-button @click="$router.go(-1)">返回</el-button>
          </div>

        </el-card>
        <el-empty v-else-if="!loading" description="未找到该帖子或帖子未审核" />
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // 【【修改】】 导入 useRouter
import axios from 'axios';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter(); // 【【新增】】 定义 router
const post = ref(null);
const loading = ref(true);

onMounted(async () => {
  const postId = route.params.id;
  if (!postId) {
    loading.value = false;
    return;
  }
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`http://localhost:8080/api/posts/${postId}`, {
      // 【【修改】】 确保 token 存在时才发送
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    post.value = response.data;
  } catch (err) {
    ElMessage.error('无法加载帖子详情，可能帖子未通过审核。');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}
.post-detail-card {
  padding: 20px;
}
.post-title {
  font-size: 2em;
  margin-bottom: 15px;
  text-align: center;
}
.post-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  color: #888;
  font-size: 0.9em;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.meta-skeleton {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 这个样式块用于“重置” v-html 渲染的内容，
  使其看起来像普通文章，而不是在编辑器里
*/
.post-content.ql-snow {
  border: none; /* 移除 ql-snow 默认边框 */
}
/* 【【修改】】 :deep() 确保样式能生效 */
.post-content :deep(.ql-editor) {
  padding: 0; /* 移除 ql-editor 默认内边距 */
  font-size: 16px;
  line-height: 1.8;
}
/* 【【新增】】 确保 v-html 里的图片自适应 */
.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>