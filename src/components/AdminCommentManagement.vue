<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header-flex">
          <h2>评论管理</h2>
          <div class="search-box">
            <el-input
                v-model="searchParams.content"
                placeholder="搜索评论内容"
                :prefix-icon="Search"
                @keyup.enter="handleSearch"
                clearable
            />
            <el-input
                v-model="searchParams.authorName"
                placeholder="搜索作者名"
                :prefix-icon="User"
                @keyup.enter="handleSearch"
                clearable
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table :data="comments" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="没有找到相关评论" />
        </template>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="content" label="评论内容" min-width="200" />
        <el-table-column prop="authorName" label="发布者" width="120" />
        <el-table-column prop="petName" label="所属宠物" width="120" />
        <el-table-column label="发布时间" width="180">
          <template #default="scope">
            {{ new Date(scope.row.createTime).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-dropdown>
              <el-button :icon="MoreFilled" circle size="small" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="viewPet(scope.row.petId)">
                    查看宠物
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(scope.row.id)" style="color: #F56C6C;">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { Search, User, MoreFilled } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(true);
const comments = ref([]);
const total = ref(0);

const page = reactive({
  pageNum: 1,
  pageSize: 10,
});

const searchParams = reactive({
  content: '',
  authorName: ''
});

const fetchComments = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const params = {
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      content: searchParams.content || null,
      authorName: searchParams.authorName || null
    };
    const response = await axios.get('http://localhost:8080/api/comments/all', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    comments.value = response.data.records;
    total.value = response.data.total;
  } catch (err) {
    ElMessage.error('加载评论列表失败。');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.pageNum = 1;
  fetchComments();
};

const handlePageChange = (currentPage) => {
  page.pageNum = currentPage;
  fetchComments();
};

// 查看按钮：跳转到宠物详情页
const viewPet = (petId) => {
  router.push(`/pet/${petId}`);
};

const handleDelete = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要永久删除这条评论吗？', '确认删除', { type: 'warning' });
    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('删除成功！');
    fetchComments();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.response?.data?.message || '删除失败');
    }
  }
};

onMounted(fetchComments);
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
.search-box {
  display: flex;
  gap: 10px;
  width: 500px; /* 搜索框宽度 */
}
</style>