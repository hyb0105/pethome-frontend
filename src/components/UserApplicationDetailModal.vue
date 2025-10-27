<template>
  <el-dialog
      :model-value="true"
      title="我的申请详情"
      width="60%"
      top="10vh"
      @close="$emit('close')"
      :close-on-click-modal="false"
  >
    <div v-if="!applicationData" v-loading="true" style="min-height: 200px;"></div>
    <div v-else class="detail-container-user">

      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请ID">{{ applicationData.id }}</el-descriptions-item>
        <el-descriptions-item label="申请宠物">{{ applicationData.petName || `(宠物ID: ${applicationData.petId})` }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getStatusType(applicationData.status)">
            {{ formatStatus(applicationData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ new Date(applicationData.applicationTime).toLocaleString() }}</el-descriptions-item>

        <el-descriptions-item label="管理员回复" v-if="applicationData.status === 2 && applicationData.rejectionReason">
          <span style="color: red;">{{ applicationData.rejectionReason }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="申请人姓名">{{ applicationData.adopterName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ applicationData.adopterPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">
          {{ applicationData.addressProvince }}
          {{ applicationData.addressCity }}
          {{ applicationData.addressDistrict }}
          {{ applicationData.addressDetailedAddress }}
          ({{ applicationData.addressRecipientName }}, {{ applicationData.addressPhone }})
        </el-descriptions-item>
        <el-descriptions-item label="申请理由">{{ applicationData.reason }}</el-descriptions-item>
      </el-descriptions>

    </div>
    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button
          v-if="applicationData && applicationData.status === 2"
          type="primary"
          @click="$emit('openResubmit')"
      >
        编辑并重新提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  applicationData: { // 接收详细数据
    type: Object,
    default: null
  }
});

// 【修改】增加 openResubmit 事件
defineEmits(['close', 'openResubmit']);

// 状态格式化函数 (与 MyApplications.vue 相同)
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
.detail-container-user {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}
/* 可以为拒绝理由添加特殊样式 */
</style>