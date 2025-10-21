<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h2>后台管理 - 用户信息</h2>
      </template>

      <el-table :data="users" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="系统中没有用户信息" />
        </template>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column label="角色">
          <template #default="scope">
            <el-tag :type="scope.row.role === 1 ? 'danger' : 'success'" disable-transitions>
              {{ scope.row.role === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button size="small" @click="openUserModal(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="warning" @click="openPasswordModal(scope.row)">
              重置密码
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteUser(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <UserFormModal
        v-if="isModalOpen"
        :user-data="selectedUser"
        @close="closeUserModal"
        @save="handleSaveUser"
    />

    <UserPasswordResetModal
        v-if="isPasswordModalOpen"
        :user-id="selectedUserForPassword.id"
        :username="selectedUserForPassword.username"
        @close="closePasswordModal"
        @save="handleSavePassword"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
// 引入我们下一步要创建的弹窗组件
import UserFormModal from './UserFormModal.vue';
// 【新增】导入密码重置弹窗
import UserPasswordResetModal from './UserPasswordResetModal.vue';

const users = ref([]);
const loading = ref(true);
// 用户编辑弹窗
const isModalOpen = ref(false);
const selectedUser = ref(null);
// 密码重置弹窗
const isPasswordModalOpen = ref(false);
const selectedUserForPassword = ref(null);

// 从后端API获取所有用户
const fetchAllUsers = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/user/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    users.value = response.data;
  } catch (err) {
    ElMessage.error('加载用户列表失败。');
  } finally {
    loading.value = false;
  }
};

// --- 编辑用户 ---
const openUserModal = (user) => {
  selectedUser.value = user;
  isModalOpen.value = true;
};

const closeUserModal = () => {
  isModalOpen.value = false;
  selectedUser.value = null;
};

// 处理保存逻辑
const handleSaveUser = async (user) => {
  try {
    const token = localStorage.getItem('authToken');
    // 调用我们后端创建的 /api/user/{id} 接口
    await axios.put(`http://localhost:8080/api/user/${user.id}`, user, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('用户信息更新成功！');
    closeUserModal();
    await fetchAllUsers(); // 重新加载数据
  } catch (err) {
    ElMessage.error('操作失败，请重试。');
  }
};
// --- 【新增】重置密码 ---
const openPasswordModal = (user) => {
  selectedUserForPassword.value = user;
  isPasswordModalOpen.value = true;
};
const closePasswordModal = () => {
  isPasswordModalOpen.value = false;
  selectedUserForPassword.value = null;
};
const handleSavePassword = async ({ userId, newPassword }) => {
  try {
    const token = localStorage.getItem('authToken');
    // 调用我们后端创建的 /api/user/{id}/password 接口
    await axios.put(`http://localhost:8080/api/user/${userId}/password`,
        { newPassword }, // 传入 newPassword
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    ElMessage.success('密码重置成功！');
    closePasswordModal();
    // 密码重置成功后不需要刷新列表
  } catch (err) {
    ElMessage.error('操作失败，请重试。');
  }
};

// --- 【新增】删除用户 ---
const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
        `您确定要删除用户 “${user.username}” (ID: ${user.id}) 吗？此操作不可逆！`,
        '确认删除',
        { type: 'warning' }
    );

    // 用户点击了“确认”
    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:8080/api/user/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success(`用户 #${user.id} 已成功删除！`);
    await fetchAllUsers(); // 重新加载数据

  } catch (error) {
    if (error !== 'cancel') {
      // API 请求失败或用户取消
      ElMessage.error('删除用户失败！');
    }
  }
};

onMounted(fetchAllUsers);
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
</style>