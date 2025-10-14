<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>后台管理 - 宠物信息</h2>
          <el-button type="primary" :icon="Plus" @click="openPetModal(null)">新增宠物</el-button>
        </div>
      </template>

      <el-table :data="pets" v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty description="系统中还没有任何宠物信息" />
        </template>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="breed" label="品种" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" disable-transitions>
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openPetModal(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePet(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <PetFormModal
        v-if="isModalOpen"
        :pet-data="selectedPet"
        @close="closePetModal"
        @save="handleSavePet"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import PetFormModal from './PetFormModal.vue';

const pets = ref([]);
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const selectedPet = ref(null);

const fetchAllPets = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/pets', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { pageNum: 1, pageSize: 200 }
    });
    pets.value = response.data.records;
  } catch (err) {
    error.value = '加载宠物列表失败。';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

const openPetModal = (pet) => {
  selectedPet.value = pet;
  isModalOpen.value = true;
};

const closePetModal = () => {
  isModalOpen.value = false;
  selectedPet.value = null;
};

const handleSavePet = async ({ pet, isEdit }) => {
  try {
    const token = localStorage.getItem('authToken');
    if (isEdit) {
      await axios.put(`http://localhost:8080/api/pets/${pet.id}`, pet, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      ElMessage.success('宠物信息更新成功！');
    } else {
      await axios.post('http://localhost:8080/api/pets', pet, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      ElMessage.success('新宠物添加成功！');
    }
    closePetModal();
    await fetchAllPets();
  } catch (err) {
    ElMessage.error('操作失败，请检查填写的内容。');
  }
};

const deletePet = async (petId) => {
  try {
    await ElMessageBox.confirm(
        `您确定要删除ID为 ${petId} 的宠物吗？此操作不可逆！`,
        '确认删除',
        { type: 'warning' }
    );
    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:8080/api/pets/${petId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success(`宠物 #${petId} 已成功删除！`);
    await fetchAllPets();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除宠物失败！');
    }
  }
};

const formatStatus = (status) => {
  switch (status) {
    case 0: return '待领养';
    case 1: return '已领养';
    case 2: return '审核中';
    default: return '未知';
  }
};

const getStatusType = (status) => {
  switch (status) {
    case 0: return 'success';
    case 1: return 'info';
    case 2: return 'warning';
    default: return '';
  }
};

onMounted(fetchAllPets);
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.status-available { background-color: #67c23a; }
.status-adopted { background-color: #909399; }
.status-pending { background-color: #e6a23c; }
</style>