<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h2>我收藏过的帖子</h2>
      </template>

      <el-table :data="posts" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="您还没有收藏过任何帖子" />
        </template>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="authorName" label="作者" />
        <el-table-column prop="category" label="领域" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" @click="$router.push(`/posts/${scope.row.id}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

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
import { ElMessage } from 'element-plus';

const loading = ref(true);
const posts = ref([]);
const total = ref(0);
const page = reactive({ pageNum: 1, pageSize: 10 });

const fetchLikedPosts = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const params = { pageNum: page.pageNum, pageSize: page.pageSize };
    const response = await axios.get('http://localhost:8080/api/posts/my/likes', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    posts.value = response.data.records;
    total.value = response.data.total;
  } catch (err) {
    ElMessage.error('加载点赞列表失败。');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (currentPage) => {
  page.pageNum = currentPage;
  fetchLikedPosts();
};

onMounted(fetchLikedPosts);
</script>

<style scoped>
.page-container { max-width: 1200px; margin: 20px auto; padding: 20px; }
.pagination-container { display: flex; justify-content: center; margin-top: 20px; }
</style>