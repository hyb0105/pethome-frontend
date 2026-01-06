<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>主页轮播图管理 (建议上传4张)</h2>
          <el-button type="primary" @click="handleAdd" :disabled="carousels.length >= 4">新增轮播图</el-button>
        </div>
      </template>

      <el-table :data="carousels" v-loading="loading" style="width: 100%">
        <el-table-column label="图片预览" width="200">
          <template #default="scope">
            <el-image
                :src="scope.row.imageUrl"
                fit="cover"
                style="width: 160px; height: 80px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                :preview-src-list="[scope.row.imageUrl]"
                preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="linkUrl" label="跳转链接" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序值" width="100" sortable />

        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑轮播图' : '新增轮播图'" width="500px">
      <el-form :model="form" label-width="80px">

        <el-form-item label="上传图片" required>
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              name="file"
          >
            <img v-if="form.imageUrl" :src="form.imageUrl" class="carousel-preview-img" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="tip-text">建议尺寸：1200x400，支持 jpg/png</div>
        </el-form-item>

        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="图片标题 (可选)" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.linkUrl" placeholder="点击后跳转的地址 (可选)" />
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sortOrder" :min="0" placeholder="越小越靠前" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const carousels = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const form = ref({
  id: null,
  imageUrl: '',
  linkUrl: '',
  title: '',
  sortOrder: 0
});

const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('authToken')}`
};

const fetchCarousels = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:8080/api/carousels');
    carousels.value = response.data;
  } catch (error) {
    ElMessage.error('加载轮播图失败');
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  form.value = {
    id: null,
    imageUrl: '',
    linkUrl: '',
    title: '',
    sortOrder: carousels.value.length // 默认排在最后
  };
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  form.value = { ...row }; // 复制对象
  dialogVisible.value = true;
};

const handleUploadSuccess = (response) => {
  // 假设后端返回的是图片URL字符串
  form.value.imageUrl = response;
  ElMessage.success('图片上传成功');
};

const submitForm = async () => {
  if (!form.value.imageUrl) {
    ElMessage.warning('请先上传一张图片');
    return;
  }
  try {
    const token = localStorage.getItem('authToken');
    await axios.post('http://localhost:8080/api/carousels', form.value, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    fetchCarousels(); // 刷新列表
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这张轮播图吗？', '提示', { type: 'warning' });
    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:8080/api/carousels/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('删除成功');
    fetchCarousels();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败');
  }
};

onMounted(fetchCarousels);
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
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 300px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}
.avatar-uploader:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.carousel-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tip-text {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>