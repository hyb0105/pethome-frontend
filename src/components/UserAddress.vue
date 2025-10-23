<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>我的收货地址</h2>
          <el-button type="primary" :icon="Plus" @click="openAddressModal(null)">新增地址</el-button>
        </div>
      </template>

      <el-table :data="addresses" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="您还没有添加地址" />
        </template>

        <el-table-column prop="recipientName" label="收件人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column label="收货地址">
          <template #default="scope">
            {{ formatAddress(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="默认地址" width="100" align="center">
          <template #default="scope">
            <el-switch
                :model-value="scope.row.isDefault === 1"
                @change="handleSetDefault(scope.row)"
                :disabled="scope.row.isDefault === 1"
            />
            <span v-if="scope.row.isDefault === 1" style="margin-left: 5px; color: #67c23a;">默认</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="openAddressModal(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)" :disabled="scope.row.isDefault === 1">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <AddressFormModal
        v-if="isModalOpen"
        :address-data="selectedAddress"
        @close="closeAddressModal"
        @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import AddressFormModal from './AddressFormModal.vue'; // 下一步创建

const addresses = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selectedAddress = ref(null); // null 表示新增, object 表示编辑

// 获取地址列表
const fetchAddresses = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/addresses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    addresses.value = response.data;
  } catch (error) {
    ElMessage.error('加载地址列表失败');
  } finally {
    loading.value = false;
  }
};

// 格式化地址显示
const formatAddress = (addr) => {
  return `${addr.province || ''} ${addr.city || ''} ${addr.district || ''} ${addr.detailedAddress}`;
};

// 打开弹窗
const openAddressModal = (addr) => {
  selectedAddress.value = addr ? { ...addr } : null; // 传入副本或 null
  isModalOpen.value = true;
};

// 关闭弹窗
const closeAddressModal = () => {
  isModalOpen.value = false;
  selectedAddress.value = null;
};

// 保存地址 (新增或更新)
const handleSave = async (addressData) => {
  const token = localStorage.getItem('authToken');
  const headers = { 'Authorization': `Bearer ${token}` };
  try {
    if (addressData.id) { // 更新
      await axios.put(`http://localhost:8080/api/addresses/${addressData.id}`, addressData, { headers });
      ElMessage.success('地址更新成功');
    } else { // 新增
      await axios.post('http://localhost:8080/api/addresses', addressData, { headers });
      ElMessage.success('地址添加成功');
    }
    closeAddressModal();
    await fetchAddresses(); // 重新加载列表
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

// 删除地址
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '确认删除', { type: 'warning' });
    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:8080/api/addresses/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('地址删除成功');
    await fetchAddresses();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 设置默认地址
const handleSetDefault = async (addr) => {
  loading.value = true; // 开始加载状态，防止快速切换
  const token = localStorage.getItem('authToken');
  try {
    await axios.put(`http://localhost:8080/api/addresses/${addr.id}/default`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('默认地址设置成功');
    await fetchAddresses(); // 重新加载以更新状态
  } catch (error) {
    ElMessage.error('设置失败');
    loading.value = false; // 出错时结束加载
  }
  // 成功后 fetchAddresses 会设置 loading = false
};

onMounted(fetchAddresses);
</script>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>