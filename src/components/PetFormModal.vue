<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>{{ isEditMode ? '编辑宠物信息' : '新增宠物' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>名称</label>
            <input v-model="form.name" type="text" required>
          </div>
          <div class="form-group">
            <label>类型 (如: 猫, 狗)</label>
            <input v-model="form.type" type="text" required>
          </div>
          <div class="form-group">
            <label>品种</label>
            <input v-model="form.breed" type="text" required>
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input v-model="form.age" type="number" required>
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="form.gender">
              <option :value="1">雄性</option>
              <option :value="0">雌性</option>
            </select>
          </div>
          <div class="form-group">
            <label>是否绝育</label>
            <select v-model="form.sterilization">
              <option :value="1">是</option>
              <option :value="0">否</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>健康状况</label>
          <input v-model="form.healthStatus" type="text">
        </div>
        <div class="form-group">
          <label>疫苗情况</label>
          <input v-model="form.vaccination" type="text">
        </div>
        <div class="form-group">
          <label>照片URL</label>
          <input v-model="form.photoUrl" type="text" placeholder="请上传图片后粘贴URL">
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>

        <div class="modal-actions">
          <button type="submit" :disabled="isSubmitting">{{ isSubmitting ? '保存中...' : '保存' }}</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PetFormModal',
  props: {
    petData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {},
      isSubmitting: false,
    };
  },
  computed: {
    isEditMode() {
      return this.petData && this.petData.id;
    }
  },
  created() {
    this.initializeForm();
  },
  methods: {
    initializeForm() {
      if (this.isEditMode) {
        // 如果是编辑模式，用传入的数据填充表单
        this.form = { ...this.petData };
      } else {
        // 如果是新增模式，提供一个空的表单结构
        this.form = {
          name: '',
          type: '',
          breed: '',
          age: 1,
          gender: 1,
          sterilization: 0,
          healthStatus: '健康',
          vaccination: '已接种',
          photoUrl: '',
          description: '',
          status: 0 // 新增的宠物默认为“待领养”
        };
      }
    },
    handleSubmit() {
      this.isSubmitting = true;
      // 通过 $emit 将表单数据和模式（新增/编辑）发送回父组件
      this.$emit('save', { pet: this.form, isEdit: this.isEditMode });
      // isSubmitting 状态将由父组件在处理完成后重置
    }
  }
};
</script>

<style scoped>
/* ... 样式与 PetDetail.vue 的弹窗类似 ... */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 20px 30px; border-radius: 8px; width: 600px; max-height: 90vh; overflow-y: auto; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.modal-actions button { padding: 10px 20px; border-radius: 5px; cursor: pointer; border: none; }
.modal-actions .cancel-btn { background-color: #6c757d; color: white; }
</style>