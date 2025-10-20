<template>
  <el-dialog
      :model-value="true"
      :title="isEditMode ? '编辑宠物信息' : '新增宠物'"
      width="600px"
      @close="$emit('close')"
  >
    <el-form :model="form" label-width="100px" label-position="right">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="名称" required>
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型" required>
            <el-input v-model="form.type" placeholder="如: 猫, 狗" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品种" required>
            <el-input v-model="form.breed" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市" required>
            <el-input v-model="form.city" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄" required>
            <el-input-number v-model="form.age" :min="0" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别">
            <el-select v-model="form.gender" style="width: 100%;">
              <el-option label="雄性" :value="1" />
              <el-option label="雌性" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否绝育">
            <el-select v-model="form.sterilization" style="width: 100%;">
              <el-option label="是" :value="1" />
              <el-option label="否" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="健康状况">
        <el-input v-model="form.healthStatus" />
      </el-form-item>
      <el-form-item label="疫苗情况">
        <el-input v-model="form.vaccination" />
      </el-form-item>
      <el-form-item label="宠物照片">
        <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/api/upload"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handlePhotoSuccess"
            :before-upload="beforePhotoUpload"
        >
          <img v-if="form.photoUrl" :src="form.photoUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isSubmitting ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
// 【修改】从 vue 导入 computed
import { ref, watch, defineProps, defineEmits, computed } from 'vue';
// 【新增】导入 ElMessage 和 Plus 图标
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 使用 defineProps 和 defineEmits 是 <script setup> 的标准做法
const props = defineProps({
  petData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({});
const isSubmitting = ref(false);
const isEditMode = ref(false);

// 【新增】计算属性，用于设置上传组件的 Authorization 请求头
// (这段逻辑与 UserProfile.vue 中的完全一致)
const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  };
});

const initializeForm = () => {
  isEditMode.value = props.petData && props.petData.id;
  if (isEditMode.value) {
    form.value = { ...props.petData };
  } else {
    form.value = {
      name: '',
      type: '',
      breed: '',
      city: '',
      age: 1,
      gender: 1,
      sterilization: 0,
      healthStatus: '健康',
      vaccination: '已接种',
      photoUrl: '',
      description: '',
      status: 0
    };
  }
};

const handleSubmit = () => {
  isSubmitting.value = true;
  emit('save', { pet: form.value, isEdit: isEditMode.value });
  // 提交后，isSubmitting状态需要由父组件重置或关闭弹窗时自动处理
};

// 【新增】照片上传成功后的回调
const handlePhotoSuccess = (response) => {
  // 假设服务器返回的数据结构为 { url: '...' }
  // (这与 UserProfile.vue 中的逻辑一致)
  form.value.photoUrl = response.url;
  ElMessage.success('照片上传成功！');
};

// 【新增】照片上传前的校验
const beforePhotoUpload = (rawFile) => {
  // (这段逻辑与 UserProfile.vue 中的完全一致)
  const isJpgOrPng = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  if (!isJpgOrPng) {
    ElMessage.error('照片只能是 JPG 或 PNG 格式!');
    return false;
  }
  const isLt2M = rawFile.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('照片大小不能超过 2MB!');
    return false;
  }
  return true;
};


// 使用 watch 监听传入的 petData 变化，以便在组件复用时能正确更新表单
watch(() => props.petData, () => {
  initializeForm();
}, { immediate: true });
</script>

<style scoped>
/* 弹窗组件自带大部分样式，我们只需要微调即可 */
.dialog-footer {
  text-align: right;
}

/* 【新增】上传组件的图片预览样式 */
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style>
/* 【新增】上传组件的全局样式
  (这段逻辑与 UserProfile.vue 中的样式类似，
   但我们将尺寸从 128px 调整为 178px)
*/
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>