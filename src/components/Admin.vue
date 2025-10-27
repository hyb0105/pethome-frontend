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
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <div v-if="scope.row.status === 0" style="display: inline-block; margin-right: 10px;">
              <el-button size="small" type="success" @click="handleApproval(scope.row.id, 1)">批准</el-button>
              <el-button size="small" type="danger" @click="handleApproval(scope.row.id, 2)">拒绝</el-button>
            </div>
            <span v-else style="display: inline-block; margin-right: 10px; color: #999;">已处理</span>

            <el-button
                size="small"
                :icon="MoreFilled"
                circle
                @click="openDetailModal(scope.row.id)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <ApplicationDetailModal
        v-if="isDetailModalVisible"
        :application-data="selectedApplicationDetail"
        @close="closeDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
// 【新增】导入详情弹窗组件
import ApplicationDetailModal from './ApplicationDetailModal.vue';
// 【新增】导入 MoreFilled 图标
import { MoreFilled } from '@element-plus/icons-vue';

// 【新增】详情弹窗相关状态
const isDetailModalVisible = ref(false);
const selectedApplicationDetail = ref(null);
const isDetailLoading = ref(false); // 详情加载状态

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
  let reason = null;
  try {
    // 如果是拒绝，先弹出输入框获取理由
    if (status === 2) {
      const { value } = await ElMessageBox.prompt('请输入拒绝理由：', '拒绝申请', {
        confirmButtonText: '确定拒绝',
        cancelButtonText: '取消',
        inputPattern: /\S/, // 确保理由不为空或只有空格
        inputErrorMessage: '拒绝理由不能为空',
      });
      reason = value; // 获取输入的理由
    } else {
      // 如果是批准，弹出普通确认框
      await ElMessageBox.confirm(
          `您确定要“${action}”这个申请吗？`,
          '确认操作',
          { type: 'warning' } // 批准用 warning 也可以
      );
    }

    // 用户确认后，发送请求
    const token = localStorage.getItem('authToken');
    const payload = {
      status: status,
      // 【修改】包含理由 (如果 status 是 2)
      rejectionReason: status === 2 ? reason : null
    };
    await axios.put(
        `http://localhost:8080/api/applications/${applicationId}/status`,
        payload, // 【修改】发送包含理由的 payload
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    ElMessage.success(`申请 #${applicationId} 已成功${action}！`);
    await fetchAllApplications(); // 刷新列表

  } catch (error) {
    if (error !== 'cancel' && error?.message !== 'Input validation failed') { // 排除取消和输入验证失败
      ElMessage.error(error.response?.data || `审批操作失败！`); // 显示后端返回的错误信息
    } else if (error?.message === 'Input validation failed') {
      // ElMessageBox.prompt 内部会提示错误，这里可以不提示
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

// 【新增】打开详情弹窗的方法
const openDetailModal = async (applicationId) => {
  isDetailLoading.value = true;
  isDetailModalVisible.value = true;
  selectedApplicationDetail.value = null; // 先清空旧数据
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`http://localhost:8080/api/applications/${applicationId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    selectedApplicationDetail.value = response.data;
  } catch (err) {
    ElMessage.error('加载申请详情失败');
    isDetailModalVisible.value = false; // 加载失败直接关闭弹窗
  } finally {
    isDetailLoading.value = false;
  }
};

// 【新增】关闭详情弹窗的方法
const closeDetailModal = () => {
  isDetailModalVisible.value = false;
  selectedApplicationDetail.value = null;
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