<template>
  <el-dialog
      :model-value="true"
      :title="`重置用户 '${username}' 的密码`"
      width="400px"
      @close="$emit('close')"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="新密码" required>
        <el-input
            v-model="form.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"

            autocomplete="new-password"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          确认重置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
// 【【新增/确认】】 导入 ElMessage
import { ElMessage } from 'element-plus';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  newPassword: ''
});
const isSubmitting = ref(false);

const handleSubmit = () => {
  if (!form.value.newPassword) {
    ElMessage.error('新密码不能为空');
    return;
  }
  isSubmitting.value = true;
  emit('save', {
    userId: props.userId,
    newPassword: form.value.newPassword
  });
  // 父组件会处理后续逻辑
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>