<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h2>发布新帖子</h2>
      </template>
      <el-form :model="form" :rules="rules" ref="postFormRef" label-position="top">
        <el-form-item label="宠物类型领域" prop="category">
          <el-select v-model="form.category" placeholder="请选择帖子所属领域">
            <el-option label="狗狗" value="狗狗" />
            <el-option label="猫咪" value="猫咪" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="输入标题，30字以内" maxlength="30" show-word-limit />
        </el-form-item>

        <el-form-item label="补充摘要" prop="summary">
          <el-input
              v-model="form.summary"
              type="textarea"
              :rows="3"
              placeholder="请输入内容摘要，255字以内"
              maxlength="255"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="上传封面" prop="coverImageUrl">
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handlePhotoSuccess"
              :before-upload="beforePhotoUpload"
          >
            <img v-if="form.coverImageUrl" :src="form.coverImageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="详细内容" prop="content">
          <QuillEditor
              ref="quillEditorRef"
              v-model:content="form.content"
              contentType="html"
              placeholder="输入详细内容...（支持拖拽或点击图标上传图片）"
              theme="snow"
              :toolbar="toolbarOptions"
              @ready="onEditorReady"
              style="min-height: 250px; width: 100%;"
          />
        </el-form-item>

        <el-form-item style="margin-top: 50px;">
          <el-button type="primary" @click="submitForm" :loading="isSubmitting">
            {{ isSubmitting ? '发布中...' : '立即发布' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
// 【【【 修复：导入正确的 Vue 3 包，并使用花括号 】】】
import { QuillEditor } from '@vueup/vue-quill';
import axios from 'axios';

const router = useRouter();
const postFormRef = ref(null);
const isSubmitting = ref(false);

// 【【新增：Quill 编辑器实例的引用】】
const quillEditorRef = ref(null);

const form = reactive({
  title: '',
  summary: '',
  category: '',
  coverImageUrl: '',
  content: ''
});

// 【【新增：自定义工具栏，添加 'image' 按钮】】
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'link'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['image', 'clean'] // 'image' 是图片按钮，'clean' 是清除格式按钮
];

const rules = reactive({
  category: [{ required: true, message: '请选择领域', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
  content: [{
    required: true,
    message: '请输入详细内容',
    trigger: 'blur',
    validator: (rule, value, callback) => {
      // 修复校验器，<p><br></p> 是空编辑器的默认值
      if (!value || value === '<p><br></Fp>' || value.trim().length === 0) {
        callback(new Error('请输入详细内容'));
      } else {
        callback();
      }
    }
  }]
});

// --- 上传逻辑 ---
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
}));

const handlePhotoSuccess = (response) => {
  form.coverImageUrl = response.url;
  ElMessage.success('封面上传成功！');
};

const beforePhotoUpload = (rawFile) => {
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
// --- 上传逻辑结束 ---

// 【【【 新增：自定义图片上传处理函数 】】】
const customImageHandler = () => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (file) {
      if (!beforePhotoUpload(file)) {
        return;
      }

      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      ElMessage.info('正在上传图片...');

      try {
        const response = await axios.post('http://localhost:8080/api/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        const url = response.data.url;

        // 【【修改】】 确保 quillEditorRef.value 已被正确赋值
        const quill = quillEditorRef.value.getQuill();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', url);
        quill.setSelection(range.index + 1);

      } catch (err) {
        ElMessage.error('图片上传失败');
      }
    }
  };
};

// 【【【 新增：编辑器准备就绪时，重写图片按钮的点击事件 】】】
const onEditorReady = () => {
  // 【【修改】】 确保获取到 quill 实例
  const quill = quillEditorRef.value.getQuill();
  if (!quill) return;
  const toolbar = quill.getModule('toolbar');
  toolbar.addHandler('image', customImageHandler);
};

// --- 提交表单 ---
const submitForm = async () => {
  if (!postFormRef.value) return;

  postFormRef.value.validateField('content', async (isValid) => {
    if (isValid) {
      await postFormRef.value.validate(async (validAll) => {
        if (validAll) {
          isSubmitting.value = true;
          try {
            const token = localStorage.getItem('authToken');
            await axios.post('http://localhost:8080/api/posts', form, {
              headers: {'Authorization': `Bearer ${token}`}
            });
            ElMessage.success('发布成功！请等待管理员审核。');
            router.push('/');
          } catch (err) {
            ElMessage.error('发布失败，请重试。');
          } finally {
            isSubmitting.value = false;
          }
        } else {
          ElMessage.error('请检查表单是否填写完整');
        }
      });
    } else {
      ElMessage.error('请检查表单是否填写完整');
    }
  });
};
</script>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style>
/* 上传组件全局样式 */
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color); border-radius: 6px; cursor: pointer; position: relative; overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover { border-color: var(--el-color-primary); }
.el-icon.avatar-uploader-icon {
  font-size: 28px; color: #8c939d; width: 178px; height: 178px; text-align: center;
}
/* 确保富文本编辑器工具栏在对话框中正常显示 */
.ql-toolbar {
  z-index: 1;
}
/* 【【重要】】修复编辑器高度 */
.ql-container {
  z-index: 0;
  min-height: 250px; /* 确保容器有高度 */
}
</style>