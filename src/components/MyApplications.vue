<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h2>我的领养申请</h2>
      </template>

      <el-table :data="applications" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="您还没有提交任何申请" />
        </template>

        <el-table-column prop="id" label="申请ID" width="80" />
        <el-table-column prop="petName" label="申请宠物" />
        <el-table-column prop="adopterName" label="申请人" />
        <el-table-column prop="adopterPhone" label="联系电话" />
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
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
                v-if="scope.row.status === 2"
                size="small"
                type="primary"
                @click="handleResubmit(scope.row.id)"
            >
              重新提交
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>

      </el-table>
    </el-card>
    <ResubmitApplicationModal
        v-if="isResubmitModalVisible"
        :application-data="selectedApplicationForResubmit"
        @close="closeResubmitModal"
        @save="handleSaveResubmission"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
// 【新增】导入重新提交弹窗
import ResubmitApplicationModal from './ResubmitApplicationModal.vue';

const router = useRouter();
const applications = ref([]);
const loading = ref(true);

// 【新增】重新提交弹窗状态
const isResubmitModalVisible = ref(false);
const selectedApplicationForResubmit = ref(null);

const fetchMyApplications = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const response = await axios.get('http://localhost:8080/api/applications/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    applications.value = response.data;
  } catch (err) {
    ElMessage.error('无法加载申请列表，请稍后重试。');
  } finally {
    loading.value = false;
  }
};

const formatStatus = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

// 根据状态返回不同的Tag类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'; // warning-黄色
    case 1: return 'success'; // success-绿色
    case 2: return 'danger';  // danger-红色
    default: return 'info';
  }
};

// 【修改】打开重新提交弹窗的方法
const openResubmitModal = (application) => {
  selectedApplicationForResubmit.value = application; // 传递整个申请对象
  isResubmitModalVisible.value = true;
};
// 【新增】关闭重新提交弹窗
const closeResubmitModal = () => {
  isResubmitModalVisible.value = false;
  selectedApplicationForResubmit.value = null;
};

// 【修改】原 handleResubmit 逻辑改为调用 API，并接收更新后的数据
const handleSaveResubmission = async (updatedApplicationData) => {
  // updatedApplicationData 是从 ResubmitApplicationModal.vue 的 @save 事件传来的
  const applicationId = updatedApplicationData.id;
  try {
    // 这里不需要 ElMessageBox.confirm 了，因为弹窗本身就是确认
    loading.value = true; // 可以加个 loading 状态
    const token = localStorage.getItem('authToken');
    await axios.put(
        `http://localhost:8080/api/applications/${applicationId}/resubmit`,
        updatedApplicationData, // 发送更新后的数据
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    ElMessage.success('申请已重新提交！');
    closeResubmitModal(); // 关闭弹窗
    await fetchMyApplications(); // 刷新列表

  } catch (error) {
    ElMessage.error(error.response?.data?.message || '重新提交失败，请稍后再试或联系管理员。');
  } finally {
    loading.value = false; // 结束 loading
  }
};

onMounted(fetchMyApplications);
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
</style>