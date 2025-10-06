<template>
  <div class="home-container">
    <header class="header">
      <h1>欢迎来到 PetHome</h1>
      <p>在这里，找到您未来的家庭成员</p>
      <button @click="logout">退出登录</button>
    </header>

    <div v-if="loading" class="loading">正在加载宠物信息...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="pet-list" v-if="!loading && pets.length > 0">
      <div v-for="pet in pets" :key="pet.id" class="pet-card">
        <img :src="pet.photoUrl || 'https://via.placeholder.com/300'" :alt="pet.name" class="pet-photo">
        <div class="pet-info">
          <h3>{{ pet.name }}</h3>
          <p><strong>品种:</strong> {{ pet.breed }} ({{ pet.type }})</p>
          <p><strong>年龄:</strong> {{ pet.age }} 岁</p>
          <p><strong>创建时间:</strong> {{ new Date(pet.createTime).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button @click="changePage(page.pageNum - 1)" :disabled="page.pageNum <= 1">上一页</button>
      <span>第 {{ page.pageNum }} 页 / 共 {{ totalPages }} 页</span>
      <button @click="changePage(page.pageNum + 1)" :disabled="page.pageNum >= totalPages">下一页</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  data() {
    return {
      pets: [],
      loading: true,
      error: null,
      page: {
        pageNum: 1,
        pageSize: 6, // 每页显示6个宠物
      },
      total: 0,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.page.pageSize);
    }
  },
  created() {
    this.fetchPets();
  },
  methods: {
    async fetchPets() {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.error = "请先登录";
        this.loading = false;
        this.$router.push('/login'); // 如果没有token，跳转到登录页
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/pets', {
          params: {
            pageNum: this.page.pageNum,
            pageSize: this.page.pageSize,
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.pets = response.data.records;
        this.total = response.data.total;
      } catch (err) {
        console.error('获取宠物列表失败:', err);
        this.error = '无法加载宠物列表，请稍后再试。';
      } finally {
        this.loading = false;
      }
    },
    changePage(newPageNum) {
      if (newPageNum > 0 && newPageNum <= this.totalPages) {
        this.page.pageNum = newPageNum;
        this.fetchPets();
      }
    },
    logout() {
      localStorage.removeItem('authToken');
      this.$router.push('/login');
    }
  },
};
</script>

<style scoped>
.home-container {
  padding: 20px;
}
.header {
  text-align: center;
  margin-bottom: 40px;
}
.header button {
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #f0f0f0;
}
.pet-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.pet-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.pet-photo {
  width: 100%;
  height: 220px;
  object-fit: cover;
}
.pet-info {
  padding: 15px;
}
.pagination {
  text-align: center;
  margin-top: 30px;
}
.pagination button {
  margin: 0 10px;
  padding: 5px 10px;
}
</style>