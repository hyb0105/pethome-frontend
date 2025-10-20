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
      <el-form-item label="照片URL">
        <el-input v-model="form.photoUrl" placeholder="请上传图片后粘贴URL" />
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
import { ref, watch, defineProps, defineEmits } from 'vue';

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
</style>