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
        <el-table-column prop="title" label="宠物名称/标题" />
        <el-table-column prop="linkUrl" label="跳转路径" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序值" width="100" sortable />

        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑轮播图' : '新增轮播图'" width="550px">
      <el-form :model="form" label-width="100px">

        <el-form-item label="选择宠物" required>
          <el-select
              v-model="selectedPetId"
              placeholder="请选择待领养的宠物"
              style="width: 100%"
              @change="handlePetChange"
              filterable
          >
            <el-option
                v-for="pet in unadoptedPets"
                :key="pet.id"
                :label="pet.name + ' (' + pet.breed + ')'"
                :value="pet.id"
            />
          </el-select>
          <div class="tip-text">选择后将自动生成跳转链接和标题</div>
        </el-form-item>

        <el-form-item label="轮播图图片" required>
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              name="file"
          >
            <img v-if="form.imageUrl" :src="form.imageUrl" class="carousel-preview-img" />
            <div v-else class="upload-placeholder">
              <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
              <span>点击上传横幅图</span>
            </div>
          </el-upload>
          <div class="tip-text">建议尺寸：1200x400，您可以手动上传更精美的横幅，或者使用默认宠物照片</div>
        </el-form-item>

        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="宠物名称" />
        </el-form-item>

        <el-form-item label="跳转链接">
          <el-input v-model="form.linkUrl" placeholder="自动生成，例如: /pet/1" disabled />
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const carousels = ref([]);
const unadoptedPets = ref([]); // 存储待领养宠物列表
const selectedPetId = ref(null); // 当前选中的宠物ID

const loading = ref(true);
const dialogVisible = ref(false);
const form = ref({
  id: null,
  imageUrl: '',
  linkUrl: '',
  title: '',
  sortOrder: 0
});

const uploadHeaders = computed(() => {
  return { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };
});

// 获取现有的轮播图
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

// 【核心修改：获取待领养宠物列表】
const fetchUnadoptedPets = async () => {
  try {
    const token = localStorage.getItem('authToken');
    // status=0 表示待领养，pageSize=100 确保能拉取到足够多的宠物供选择
    const response = await axios.get('http://localhost:8080/api/pets', {
      params: { status: 0, pageSize: 100 },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    unadoptedPets.value = response.data.records || [];
  } catch (error) {
    console.error('加载宠物列表失败', error);
  }
};

// 【核心修改：当选择宠物发生变化时】
const handlePetChange = (val) => {
  const pet = unadoptedPets.value.find(p => p.id === val);
  if (pet) {
    // 1. 自动设置标题
    form.value.title = pet.name;
    // 2. 自动设置跳转链接 (前端路由格式)
    form.value.linkUrl = `/pet/${pet.id}`;

    // 3. 【修复BUG】强制将轮播图的图片更新为当前选中的宠物照片！
    // 💡注意：请确保你的宠物表里，图片的字段名确实叫 photoUrl。
    // 如果你后端返回的宠物图片字段叫 photo、avatar 或 imageUrl，请把下面的 pet.photoUrl 改成对应的名字！
    if (pet.photoUrl) {
      form.value.imageUrl = pet.photoUrl;
    } else if (pet.photo) { // 兼容一下可能叫 photo
      form.value.imageUrl = pet.photo;
    } else if (pet.imageUrl) { // 兼容一下可能叫 imageUrl
      form.value.imageUrl = pet.imageUrl;
    }
  }
};

const handleAdd = () => {
  form.value = {
    id: null,
    imageUrl: '',
    linkUrl: '',
    title: '',
    sortOrder: carousels.value.length
  };
  selectedPetId.value = null; // 重置选择框
  dialogVisible.value = true;
  fetchUnadoptedPets(); // 打开弹窗时刷新一下宠物列表
};

const handleEdit = (row) => {
  form.value = { ...row };
  selectedPetId.value = null; // 编辑模式下暂不回显Select，因为比较复杂，用户可以直接改
  dialogVisible.value = true;
  fetchUnadoptedPets();
};

// 【关键修复】处理上传成功
const handleUploadSuccess = (response) => {
  // 后端返回的是 { url: "..." }，所以这里必须取 response.url
  form.value.imageUrl = response.url;
  ElMessage.success('图片上传成功');
};

const submitForm = async () => {
  if (!form.value.imageUrl) {
    ElMessage.warning('请上传轮播图');
    return;
  }
  if (!form.value.linkUrl) {
    ElMessage.warning('请选择一个宠物以生成跳转链接');
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    await axios.post('http://localhost:8080/api/carousels', form.value, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    fetchCarousels();
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

onMounted(() => {
  fetchCarousels();
  // 预加载宠物列表，或者在打开弹窗时加载都可以
});
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
  width: 100%;
  height: 200px; /* 调整为更像Banner的比例 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}
.avatar-uploader:hover {
  border-color: #409EFF;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8c939d;
}
.avatar-uploader-icon {
  font-size: 28px;
  margin-bottom: 8px;
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
  line-height: 1.4;
}
</style>