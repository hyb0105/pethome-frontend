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
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const router = useRouter();
const applications = ref([]);
const loading = ref(true);

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

onMounted(fetchMyApplications);
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
</style>