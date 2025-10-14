<template>
  <div class="admin-container">
    <h2>后台管理 - 所有申请</h2>
    <div v-if="loading" class="loading-text">正在加载申请记录...</div>
    <div v-if="error" class="error-text">{{ error }}</div>
    <table v-if="applications.length > 0" class="applications-table">
      <thead>
      <tr>
        <th>申请ID</th>
        <th>宠物名称 (ID)</th>
        <th>申请人</th>
        <th>联系电话</th>
        <th>申请时间</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="app in applications" :key="app.id">
        <td>{{ app.id }}</td>
        <td>{{ app.petName }} (ID: {{ app.petId }})</td>
        <td>{{ app.adopterName }}</td>
        <td>{{ app.adopterPhone }}</td>
        <td>{{ new Date(app.applicationTime).toLocaleString() }}</td>
        <td>
            <span :class="['status', getStatusClass(app.status)]">
              {{ formatStatus(app.status) }}
            </span>
        </td>
        <td class="actions">
          <div v-if="app.status === 0">
            <button @click="handleApproval(app.id, 1)" class="btn-approve">批准</button>
            <button @click="handleApproval(app.id, 2)" class="btn-reject">拒绝</button>
          </div>
          <span v-else class="status-processed">已处理</span>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="!loading && applications.length === 0" class="no-data">
      当前没有待处理的申请。
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminPage',
  data() {
    return {
      applications: [],
      loading: true,
      error: null
    };
  },
  async created() {
    await this.fetchAllApplications();
  },
  methods: {
    async fetchAllApplications() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8080/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.applications = response.data;
      } catch (err) {
        console.error("加载所有申请列表失败:", err);
        this.error = '加载申请列表失败，请确认您有管理员权限。';
      } finally {
        this.loading = false;
      }
    },
    async handleApproval(applicationId, status) {
      const action = status === 1 ? '批准' : '拒绝';
      if (!confirm(`您确定要“${action}”这个申请吗？`)) {
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        await axios.put(`http://localhost:8080/api/applications/${applicationId}/status`,
            { status: status },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert(`申请 #${applicationId} 已成功${action}！`);
        // 审批成功后，刷新列表
        await this.fetchAllApplications();
      } catch (err) {
        console.error("审批操作失败:", err);
        alert('审批操作失败！');
      }
    },
    // 格式化状态文字
    formatStatus(status) {
      switch (status) {
        case 0: return '待审核';
        case 1: return '已通过';
        case 2: return '已拒绝';
        default: return '未知';
      }
    },
    // 根据状态返回不同的CSS类
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
.admin-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
h2 {
  text-align: center;
  margin-bottom: 20px;
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
  vertical-align: middle;
}
.applications-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}
.actions button {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-size: 0.9em;
}
.btn-approve {
  background-color: #28a745;
}
.btn-reject {
  background-color: #dc3545;
  margin-left: 8px;
}
.status-processed {
  color: #6c757d;
  font-style: italic;
}
.status {
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
  font-weight: bold;
  font-size: 0.85em;
  display: inline-block;
  text-align: center;
}
.status-pending { background-color: #ffc107; color: #333; } /* 黄色 */
.status-approved { background-color: #28a745; } /* 绿色 */
.status-rejected { background-color: #dc3545; } /* 红色 */
.loading-text, .error-text, .no-data {
  text-align: center;
  margin-top: 40px;
  font-size: 1.2rem;
  color: #666;
}
</style>