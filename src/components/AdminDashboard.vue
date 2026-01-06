<template>
  <div class="dashboard-container">
    <h2>后台管理概览</h2>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">注册用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pet-icon">
              <el-icon><Menu /></el-icon> </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalPets }}</div>
              <div class="stat-label">入驻宠物总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" @click="$router.push('/admin/approvals')" style="cursor: pointer">
          <div class="stat-content">
            <div class="stat-icon apply-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value red-text">{{ stats.pendingApplications }}</div>
              <div class="stat-label">待审核申请</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" @click="$router.push('/admin/posts')" style="cursor: pointer">
          <div class="stat-content">
            <div class="stat-icon post-icon">
              <el-icon><DocumentCopy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value red-text">{{ stats.pendingPosts }}</div>
              <div class="stat-label">待审核帖子</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>系统公告</span>
        </div>
      </template>
      <div class="welcome-content">
        <p>欢迎管理员进入 PetHome 后台管理系统。</p>
        <p>请及时处理 <strong style="color: #F56C6C;">{{ stats.pendingApplications }}</strong> 条新的领养申请。</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { User, Menu, Bell, DocumentCopy } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const stats = ref({
  totalUsers: 0,
  totalPets: 0,
  pendingApplications: 0,
  pendingPosts: 0
});

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    stats.value = response.data;
  } catch (error) {
    console.error('获取统计数据失败', error);
    ElMessage.error('无法加载仪表盘数据');
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.stat-card {
  height: 120px;
}
.stat-content {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  font-size: 28px;
  color: white;
}
.user-icon { background-color: #409EFF; }
.pet-icon { background-color: #67C23A; }
.apply-icon { background-color: #E6A23C; }
.post-icon { background-color: #909399; }

.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
.red-text {
  color: #F56C6C; /* 待处理事项用红色强调 */
}
</style>