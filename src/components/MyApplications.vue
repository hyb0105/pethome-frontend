<template>
  <div class="my-applications-container">
    <h2>我的领养申请</h2>
    <div v-if="loading" class="loading">正在加载申请记录...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && applications.length === 0" class="no-applications">
      您还没有提交任何申请。
    </div>
    <table v-if="!loading && applications.length > 0" class="applications-table">
      <thead>
      <tr>
        <th>申请宠物</th>
        <th>申请人</th>
        <th>联系电话</th>
        <th>申请时间</th>
        <th>状态</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="app in applications" :key="app.id">
        <td>{{ app.petName }}</td>
        <td>{{ app.adopterName }}</td>
        <td>{{ app.adopterPhone }}</td>
        <td>{{ new Date(app.createTime).toLocaleString() }}</td>
        <td>
            <span :class="['status', getStatusClass(app.status)]">
              {{ formatStatus(app.status) }}
            </span>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MyApplications',
  data() {
    return {
      applications: [],
      loading: true,
      error: null,
    };
  },
  async created() {
    await this.fetchMyApplications();
  },
  methods: {
    async fetchMyApplications() {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem('authToken');

      if (!token) {
        this.error = '请先登录！';
        this.loading = false;
        this.$router.push('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/applications/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.applications = response.data;
      } catch (err) {
        console.error('获取我的申请列表失败:', err);
        this.error = '无法加载申请列表，请稍后重试。';
      } finally {
        this.loading = false;
      }
    },
    formatStatus(status) {
      switch (status) {
        case 0: return '待审核';
        case 1: return '已通过';
        case 2: return '已拒绝';
        default: return '未知';
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 0: return 'status-pending';
        case 1: return 'status-approved';
        case 2: return 'status-rejected';
        default: return '';
      }
    }
  }
};
</script>

<style scoped>
.my-applications-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}
.applications-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.applications-table th, .applications-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}
.applications-table th {
  background-color: #f8f9fa;
}
.status {
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
  font-weight: bold;
}
.status-pending { background-color: #ffc107; } /* 黄色 */
.status-approved { background-color: #28a745; } /* 绿色 */
.status-rejected { background-color: #dc3545; } /* 红色 */
.no-applications, .loading, .error {
  text-align: center;
  margin-top: 40px;
  font-size: 1.2rem;
  color: #666;
}
</style>