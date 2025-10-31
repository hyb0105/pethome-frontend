<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header-flex">
          <h2>我的帖子</h2>
          <el-button type="primary" :icon="Plus" @click="$router.push('/posts/create')">
            发布新帖子
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待审核" name="pending"></el-tab-pane>
        <el-tab-pane label="已审核" name="approved"></el-tab-pane>
        <el-tab-pane label="已拒绝" name="rejected"></el-tab-pane>
      </el-tabs>

      <el-table :data="posts" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="您还没有发布任何帖子" />
        </template>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="category" label="领域" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tooltip
                v-if="scope.row.status === 2 && scope.row.rejectionReason"
                effect="dark"
                :content="scope.row.rejectionReason"
                placement="top"
            >
              <el-tag :type="getStatusType(scope.row.status)" style="cursor: help;">
                {{ formatStatus(scope.row.status) }}
              </el-tag>
            </el-tooltip>
            <el-tag v-else :type="getStatusType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="$router.push(`/posts/${scope.row.id}`)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(true);
const posts = ref([]);
const total = ref(0);
const activeTab = ref('all');

const page = reactive({
  pageNum: 1,
  pageSize: 10,
});

const statusMap = {
  all: null,
  pending: 0,
  approved: 1,
  rejected: 2
};

const fetchPosts = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const params = {
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      status: statusMap[activeTab.value]
    };
    const response = await axios.get('http://localhost:8080/api/posts/my', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    posts.value = response.data.records;
    total.value = response.data.total;
  } catch (err) {
    ElMessage.error('加载我的帖子列表失败。');
  } finally {
    loading.value = false;
  }
};

// 【【【 修复：重命名为 handleTabChange 】】】
const handleTabChange = (tabName) => {
  page.pageNum = 1;
  fetchPosts();
};

const handlePageChange = (currentPage) => {
  page.pageNum = currentPage;
  fetchPosts();
};

const handleDelete = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要永久删除这个帖子吗？', '确认删除', { type: 'warning' });
    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('删除成功！');
    fetchPosts();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.response?.data?.message || '删除失败');
    }
  }
};

// 状态格式化
const formatStatus = (status) => {
  switch (status) {
    case 0:
      return '待审核';
    case 1:
      return '已审核';
    case 2:
      return '已拒绝';
    default:
      return '未知';
  }
};
const getStatusType = (status) => {
  switch (status) {
    case 0:
      return 'warning';
    case 1:
      return 'success';
    case 2:
      return 'danger';
    default:
      'info';
  }
};

onMounted(fetchPosts);
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>