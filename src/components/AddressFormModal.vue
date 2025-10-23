<template>
  <el-dialog
      :model-value="true"
      :title="isEditMode ? '编辑地址' : '新增地址'"
      width="600px"
      @close="$emit('close')"
      :close-on-click-modal="false"
  >
    <el-form :model="form" ref="addressFormRef" :rules="rules" label-width="100px">
      <el-form-item label="收件人" prop="recipientName">
        <el-input v-model="form.recipientName" placeholder="请输入收件人姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="省份" prop="province">
        <el-input v-model="form.province" placeholder="请输入省份" />
      </el-form-item>
      <el-form-item label="城市" prop="city">
        <el-input v-model="form.city" placeholder="请输入城市" />
      </el-form-item>
      <el-form-item label="区/县" prop="district">
        <el-input v-model="form.district" placeholder="请输入区/县" />
      </el-form-item>
      <el-form-item label="详细地址" prop="detailedAddress">
        <el-input v-model="form.detailedAddress" type="textarea" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="设为默认">
        <el-switch v-model="isDefaultBool" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="isSubmitting">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  addressData: { // 传入 null 表示新增，传入对象表示编辑
    type: Object,
    default: null
  }
});
const emit = defineEmits(['close', 'save']);

const addressFormRef = ref(null); // 用于表单验证
const form = ref({});
const isSubmitting = ref(false);

const isEditMode = computed(() => !!props.addressData);

// 使用 computed 来处理布尔值和数字 0/1 的转换
const isDefaultBool = computed({
  get: () => form.value.isDefault === 1,
  set: (val) => { form.value.isDefault = val ? 1 : 0; }
});

// 初始化表单数据
watch(() => props.addressData, (newData) => {
  if (newData) {
    form.value = { ...newData }; // 编辑模式，填充数据
  } else {
    form.value = { // 新增模式，清空/设置默认值
      recipientName: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detailedAddress: '',
      isDefault: 0 // 默认非默认
    };
  }
}, { immediate: true });

// 表单验证规则
const rules = {
  recipientName: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    // 简单手机号格式校验 (可选)
    // { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  detailedAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
  // 省市区可以根据需要添加 required: true
};

// 提交表单
const submitForm = async () => {
  if (!addressFormRef.value) return;
  await addressFormRef.value.validate((valid) => {
    if (valid) {
      isSubmitting.value = true;
      emit('save', { ...form.value }); // 发射副本
      // isSubmitting 会在父组件的 handleSave 成功或失败后被重置 (通过关闭弹窗)
      // 为防止意外，可以在这里加一个超时重置
      setTimeout(() => { isSubmitting.value = false; }, 5000); // 5秒后强制重置
    } else {
      ElMessage.error('请检查表单填写是否完整');
    }
  });
};

</script>

<style scoped>
/* 可根据需要添加样式 */
</style>