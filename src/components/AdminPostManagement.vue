<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h2>宠物经验帖子管理</h2>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待审核" name="pending"></el-tab-pane>
        <el-tab-pane label="已审核" name="approved"></el-tab-pane>
        <el-tab-pane label="已拒绝" name="rejected"></el-tab-pane>
      </el-tabs>

      <el-table :data="posts" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="authorName" label="发布者" />
        <el-table-column prop="category" label="领域" />
        <el-table-column prop="views" label="浏览" />
        <el-table-column prop="likes" label="点赞" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-dropdown>
              <el-button :icon="MoreFilled" circle size="small" />
              <template #dropdown>
                <el-dropdown-menu>

                  <el-dropdown-item
                      v-if="scope.row.status === 0 || scope.row.status === 2"
                      @click="handleAudit(scope.row.id, 1)"
                  >
                    <span style="color: #67C23A;">通过</span>
                  </el-dropdown-item>

                  <el-dropdown-item
                      v-if="scope.row.status === 0 || scope.row.status === 1"
                      @click="handleAudit(scope.row.id, 2)"
                  >
                    <span style="color: #F56C6C;">拒绝</span>
                  </el-dropdown-item>

                  <el-dropdown-item divided @click="handleDelete(scope.row.id)">
                    <span style="color: #F56C6C;">删除</span>
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
import {ref, reactive, onMounted} from 'vue';
import axios from 'axios';
import {ElMessage, ElMessageBox} from 'element-plus';
// 【【修复2：导入 "..." 图标】】
import {MoreFilled} from '@element-plus/icons-vue';

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
    const response = await axios.get('http://localhost:8080/api/posts', {
      params,
      headers: {'Authorization': `Bearer ${token}`}
    });
    posts.value = response.data.records;
    total.value = response.data.total;
  } catch (err) {
    ElMessage.error('加载帖子列表失败。');
  } finally {
    loading.value = false;
  }
};

// 【【修复1：重命名 handleTabClick 为 handleTabChange】】
// (这个函数现在由 @tab-change 触发，v-model 已经保证了 activeTab.value 是最新的)
const handleTabChange = (tabName) => {
  page.pageNum = 1;
  fetchPosts();
};

const handlePageChange = (currentPage) => {
  page.pageNum = currentPage;
  fetchPosts();
};

const handleAudit = async (postId, status) => {
  const token = localStorage.getItem('authToken');
  let reason = 'N/A'; // 默认为 "N/A" (Not Applicable)

  if (status === 2) { // 拒绝
    try {
      const {value} = await ElMessageBox.prompt('请输入拒绝理由：', '拒绝帖子', {
        confirmButtonText: '确定拒绝',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '理由不能为空',
      });
      reason = value;
    } catch (err) {
      return ElMessage.info('操作已取消');
    }
  }
  // 【【修复2：如果是“通过”，理由明确设为 null】】
  else {
    reason = null;
  }

  // 执行审核
  try {
    await axios.put(`http://localhost:8080/api/posts/${postId}/audit`,
        {status, rejectionReason: reason},
        {headers: {'Authorization': `Bearer ${token}`}}
    );
    ElMessage.success('审核操作成功！');
    fetchPosts(); // 刷新列表
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要永久删除这个帖子吗？', '确认删除', {type: 'warning'});
    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
      headers: {'Authorization': `Bearer ${token}`}
    });
    ElMessage.success('删除成功！');
    fetchPosts();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败');
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
</style>