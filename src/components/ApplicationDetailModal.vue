<template>
  <el-dialog
      :model-value="true"
      title="申请详情"
      width="70%"
      top="5vh"
      @close="$emit('close')"
      :close-on-click-modal="false"
  >
    <div v-if="!applicationData" v-loading="true" style="min-height: 300px;"></div>
    <div v-else class="detail-container">
      <el-descriptions :column="2" border title="基本信息">
        <el-descriptions-item label="申请ID">{{ applicationData.id }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getStatusType(applicationData.status)">
            {{ formatStatus(applicationData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ new Date(applicationData.applicationTime).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="申请理由">{{ applicationData.reason }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions :column="2" border title="申请人信息" style="margin-top: 20px;">
        <el-descriptions-item label="申请表-姓名">{{ applicationData.adopterName }}</el-descriptions-item>
        <el-descriptions-item label="申请表-电话">{{ applicationData.adopterPhone }}</el-descriptions-item>
        <el-descriptions-item label="注册用户名">{{ applicationData.adopterUsername }}</el-descriptions-item>
        <el-descriptions-item label="注册邮箱">{{ applicationData.adopterEmail }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions :column="1" border title="收货地址信息" style="margin-top: 20px;">
        <el-descriptions-item label="收件人">{{ applicationData.addressRecipientName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ applicationData.addressPhone }}</el-descriptions-item>
        <el-descriptions-item label="详细地址">
          {{ applicationData.addressProvince }}
          {{ applicationData.addressCity }}
          {{ applicationData.addressDistrict }}
          {{ applicationData.addressDetailedAddress }}
          <el-tag v-if="applicationData.addressIsDefault === 1" size="small" style="margin-left: 10px;">默认</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions :column="2" border title="申请宠物信息" style="margin-top: 20px;">
        <el-descriptions-item label="宠物名称">{{ applicationData.petName }}</el-descriptions-item>
        <el-descriptions-item label="类型/品种">{{ applicationData.petType }} / {{ applicationData.petBreed }}</el-descriptions-item>
        <el-descriptions-item label="宠物照片" :span="2">
          <el-image
              v-if="applicationData.petPhotoUrl"
              style="width: 100px; height: 100px"
              :src="applicationData.petPhotoUrl"
              :preview-src-list="[applicationData.petPhotoUrl]"
              fit="cover"
              preview-teleported
          />
          <span v-else>暂无照片</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="static-section" style="margin-top: 20px;">
        <h4>领养承诺</h4>
        <ol>
          <li>承诺...（您的静态文本）</li>
          <li>遵守...（您的静态文本）</li>
          <li>...</li>
        </ol>
      </div>

    </div>
    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  applicationData: { // 接收从 Admin.vue 获取的详细数据
    type: Object,
    default: null
  }
});

defineEmits(['close']); // , 'approve' // 如果添加审批按钮，需要emit事件

// 复用 Admin.vue 的状态格式化函数 (或者提升到公共 utils)
const formatStatus = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
};
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning';
    case 1: return 'success';
    case 2: return 'danger';
    default: return 'info';
  }
};
</script>

<style scoped>
.detail-container {
  max-height: 75vh; /* 限制最大高度，出现滚动条 */
  overflow-y: auto;
  padding-right: 15px; /* 为滚动条留出空间 */
}
/* 可以为 .static-section 添加样式 */
.static-section h4 {
  margin-bottom: 10px;
}
.static-section ol {
  padding-left: 20px;
  color: #666;
  line-height: 1.8;
}
</style>