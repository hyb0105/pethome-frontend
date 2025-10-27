<template>
  <el-dialog
      :model-value="true"
      title="编辑并重新提交申请"
      width="500px"
      @close="$emit('close')"
      :close-on-click-modal="false"
  >
    <el-form v-if="form" :model="form" ref="resubmitFormRef" :rules="rules" label-position="top">
      <el-form-item label="您的姓名" prop="adopterName">
        <el-input v-model="form.adopterName" />
      </el-form-item>
      <el-form-item label="联系电话" prop="adopterPhone">
        <el-input v-model="form.adopterPhone" />
      </el-form-item>
      <el-form-item label="选择收货地址" prop="addressId">
        <el-select
            v-model="form.addressId"
            placeholder="请选择地址"
            style="width: 100%;"
            :loading="isFetchingAddresses"
        >
          <el-option
              v-for="addr in userAddresses"
              :key="addr.id"
              :label="formatAddressOption(addr)"
              :value="addr.id"
          />
          <template #empty>
            <div style="text-align: center; padding: 10px;">
              <span>没有地址？</span>
              <el-button type="primary" link @click="$router.push('/addresses')">去添加</el-button>
            </div>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item label="申请理由" prop="reason">
        <el-input v-model="form.reason" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="isSubmitting">
        确认重新提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'; // 引入 useRouter

const props = defineProps({
  applicationData: { // 接收原始申请数据
    type: Object,
    required: true
  }
});
const emit = defineEmits(['close', 'save']);
const router = useRouter(); // 获取 router 实例

const resubmitFormRef = ref(null);
const form = ref(null); // 初始化为 null
const isSubmitting = ref(false);
const userAddresses = ref([]);
const isFetchingAddresses = ref(false);

// 表单验证规则 (与 PetDetail.vue 类似)
const rules = {
  adopterName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  adopterPhone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  addressId: [{ required: true, message: '请选择地址', trigger: 'change' }], // 注意 trigger 是 change
  reason: [{ required: true, message: '请输入申请理由', trigger: 'blur' }]
};

// 获取用户地址 (与 PetDetail.vue 类似)
const fetchUserAddresses = async () => {
  isFetchingAddresses.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('http://localhost:8080/api/addresses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    userAddresses.value = response.data;
    // 注意：这里不再自动选择默认地址，而是保留 prop 传入的 addressId
    // 如果 prop 传入的 addressId 在列表中不存在（例如地址已被删除），需要用户重新选择
    if (form.value && !userAddresses.value.some(addr => addr.id === form.value.addressId)) {
      ElMessage.warning('原申请地址可能已失效，请重新选择地址。');
      form.value.addressId = null; // 清空让用户必须重选
    }

  } catch (error) {
    ElMessage.error('加载地址失败');
    userAddresses.value = [];
    if(form.value) form.value.addressId = null;
  } finally {
    isFetchingAddresses.value = false;
  }
};

// 格式化地址选项 (与 PetDetail.vue 相同)
const formatAddressOption = (addr) => {
  return `${addr.recipientName} - ${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detailedAddress}`;
};

// 监听传入的数据，初始化表单
watch(() => props.applicationData, (newData) => {
  if (newData) {
    // 复制一份数据到表单，只包含需要编辑的字段
    form.value = {
      id: newData.id, // 需要 id 来调用更新 API
      adopterName: newData.adopterName,
      adopterPhone: newData.adopterPhone,
      addressId: newData.addressId, // 保留原始地址 ID
      reason: newData.reason,
      // 不需要传 petId, adopterId, status, applicationTime 等
    };
    // 初始化时获取地址列表
    fetchUserAddresses();
  } else {
    form.value = null; // 如果传入 null，清空表单
  }
}, { immediate: true });

// 提交表单
const submitForm = async () => {
  if (!resubmitFormRef.value || !form.value) return;
  await resubmitFormRef.value.validate((valid) => {
    if (valid) {
      isSubmitting.value = true;
      // 发射包含 ID 和更新后数据的对象给父组件
      emit('save', { ...form.value });
      // isSubmitting 由父组件处理
      setTimeout(() => { isSubmitting.value = false; }, 5000);
    } else {
      ElMessage.error('请检查表单填写是否完整');
    }
  });
};

</script>

<style scoped>
/* 可根据需要添加样式 */
</style>