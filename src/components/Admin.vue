<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h2>后台管理 - 所有申请</h2>
      </template>

      <el-table :data="applications" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="当前没有待处理的申请" />
        </template>

        <el-table-column prop="id" label="申请ID" width="80" />
        <el-table-column prop="petId" label="宠物ID" width="80" />
        <el-table-column prop="adopterName" label="申请人" />
        <el-table-column label="申请时间" width="200">
          <template #default="scope">
            {{ new Date(scope.row.applicationTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <div v-if="scope.row.status === 0">
              <el-button size="small" type="success" @click="handleApproval(scope.row.id, 1)">批准</el-button>
              <el-button size="small" type="danger" @click="handleApproval(scope.row.id, 2)">拒绝</el-button>
            </div>
            <span v-else>已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

const applications = ref([]);
const loading = ref(true);
const error = ref(null);

// 【修正】直接在顶层定义 fetchAllApplications 方法，并包含完整逻辑
const fetchAllApplications = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/applications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    applications.value = response.data;
  } catch (err) {
    console.error("加载所有申请列表失败:", err);
    error.value = '加载申请列表失败，请确认您有管理员权限。';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

// 【修正】直接在顶层定义 handleApproval 方法，并移除重复定义
const handleApproval = async (applicationId, status) => {
  const action = status === 1 ? '批准' : '拒绝';
  try {
    await ElMessageBox.confirm(
        `您确定要“${action}”这个申请吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    const token = localStorage.getItem('authToken');
    await axios.put(`http://localhost:8080/api/applications/${applicationId}/status`,
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    ElMessage.success(`申请 #${applicationId} 已成功${action}！`);
    await fetchAllApplications(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审批操作失败！');
    }
  }
};

// 【修正】直接在顶层定义 formatStatus 和 getStatusType 方法
const formatStatus = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning';
    case 1: return 'success';
    case 2: return 'danger';
    default: return 'info';
  }
};

onMounted(fetchAllApplications);
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
</style>