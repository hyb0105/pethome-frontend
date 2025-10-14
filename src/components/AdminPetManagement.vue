<template>
  <div class="pet-management-container">
    <h2>后台管理 - 宠物信息</h2>
    <div class="actions-header">
      <button @click="openPetModal(null)" class="btn-add">新增宠物</button>
    </div>

    <div v-if="loading" class="loading-text">正在加载宠物列表...</div>
    <div v-if="error" class="error-text">{{ error }}</div>

    <table v-if="pets.length > 0" class="pets-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>名称</th>
        <th>类型</th>
        <th>品种</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="pet in pets" :key="pet.id">
        <td>{{ pet.id }}</td>
        <td>{{ pet.name }}</td>
        <td>{{ pet.type }}</td>
        <td>{{ pet.breed }}</td>
        <td>
            <span :class="['status', getStatusClass(pet.status)]">
              {{ formatStatus(pet.status) }}
            </span>
        </td>
        <td class="actions">
          <button @click="openPetModal(pet)" class="btn-edit">编辑</button>
          <button @click="deletePet(pet.id)" class="btn-delete">删除</button>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="!loading && pets.length === 0" class="no-data">
      系统中还没有任何宠物信息。
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// 【新增】导入我们刚刚创建的弹窗组件
import PetFormModal from './PetFormModal.vue';

export default {
  name: 'AdminPetManagement',
  // 【新增】注册弹窗组件
  components: {
    PetFormModal
  },
  data() {
    return {
      pets: [],
      loading: true,
      error: null,
      // 【新增】与弹窗相关的数据
      isModalOpen: false, // 控制弹窗是否打开
      selectedPet: null   // 存放当前正在编辑的宠物数据
    };
  },
  async created() {
    await this.fetchAllPets();
  },
  methods: {
    async fetchAllPets() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('authToken');
        // 管理员调用 /api/pets 接口会自动获取所有宠物
        const response = await axios.get('http://localhost:8080/api/pets', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            // 为了获取所有数据，我们可以设置一个很大的pageSize
            pageNum: 1,
            pageSize: 200
          }
        });
        this.pets = response.data.records;
      } catch (err) {
        console.error("加载所有宠物列表失败:", err);
        this.error = '加载宠物列表失败，请稍后重试。';
      } finally {
        this.loading = false;
      }
    },
    // 【修改】openPetModal的逻辑
    openPetModal(pet) {
      // 如果传入了pet数据，则是编辑模式；如果传入null，则是新增模式
      this.selectedPet = pet;
      this.isModalOpen = true;
    },
    // 【新增】关闭弹窗的方法
    closePetModal() {
      this.isModalOpen = false;
      this.selectedPet = null;
    },
    // 【新增】处理保存（新增或更新）逻辑的方法
    async handleSavePet({ pet, isEdit }) {
      const token = localStorage.getItem('authToken');
      try {
        if (isEdit) {
          // 编辑模式：调用PUT接口
          await axios.put(`http://localhost:8080/api/pets/${pet.id}`, pet, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          alert('宠物信息更新成功！');
        } else {
          // 新增模式：调用POST接口
          await axios.post('http://localhost:8080/api/pets', pet, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          alert('新宠物添加成功！');
        }
        this.closePetModal();
        await this.fetchAllPets(); // 操作成功后刷新列表
      } catch (err) {
        console.error("保存宠物失败:", err);
        alert('操作失败，请检查填写的内容或联系管理员。');
      }
    },
    async deletePet(petId) {
      if (!confirm(`您确定要删除ID为 ${petId} 的宠物吗？此操作不可逆！`)) {
        return;
      }
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:8080/api/pets/${petId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert(`宠物 #${petId} 已成功删除！`);
        await this.fetchAllPets(); // 删除后刷新列表
      } catch (err) {
        console.error("删除宠物失败:", err);
        alert('删除宠物失败！');
      }
    },
    formatStatus(status) {
      switch (status) {
        case 0: return '待领养';
        case 1: return '已领养';
        case 2: return '审核中';
        default: return '未知';
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 0: return 'status-available';
        case 1: return 'status-adopted';
        case 2: return 'status-pending';
        default: return '';
      }
    }
  }
};
</script>

<style scoped>
.pet-management-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.actions-header {
  text-align: right;
  margin-bottom: 20px;
}
.btn-add {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}
.pets-table {
  width: 100%;
  border-collapse: collapse;
}
.pets-table th, .pets-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}
.pets-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}
.actions button {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  margin-right: 5px;
}
.btn-edit { background-color: #ffc107; color: #333; }
.btn-delete { background-color: #dc3545; }
.status {
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
  font-weight: bold;
  font-size: 0.85em;
  display: inline-block;
  text-align: center;
}
.status-available { background-color: #28a745; }
.status-adopted { background-color: #6c757d; }
.status-pending { background-color: #17a2b8; }
.loading-text, .error-text, .no-data {
  text-align: center;
  margin-top: 40px;
  font-size: 1.2rem;
  color: #666;
}
</style>