<template>
  <el-dialog
      :model-value="true"
      title="编辑用户信息"
      width="600px"
      @close="$emit('close')"
  >
    <el-form :model="form" label-width="100px" label-position="right">

      <el-form-item label="用户名">
        <el-input v-model="form.username" disabled />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>

      <el-form-item label="电话">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item label="真实姓名">
        <el-input v-model="form.realName" />
      </el-form-item>

      <el-form-item label="身份证号">
        <el-input v-model="form.idCard" />
      </el-form-item>

      <el-form-item label="用户角色" required>
        <el-select v-model="form.role" style="width: 100%;">
          <el-option label="普通用户" :value="0" />
          <el-option label="管理员" :value="1" />
        </el-select>
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

const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({});
const isSubmitting = ref(false);

// 监听传入的 userData 变化，并用它来初始化表单
watch(() => props.userData, (newUserData) => {
  if (newUserData) {
    // 复制一份数据到表单，避免直接修改 prop
    form.value = { ...newUserData };
  }
}, { immediate: true }); // immediate: true 确保组件加载时立即执行一次

const handleSubmit = () => {
  isSubmitting.value = true;
  // 将表单数据(form.value)发射给父组件
  emit('save', form.value);

  // 父组件的 handleSaveUser 方法会处理后续逻辑
  // 成功后弹窗会关闭，isSubmitting 会自动重置
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>