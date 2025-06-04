<template>
  <el-dialog
    :model-value="modelValue"
    title="重置密码"
    width="400px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <!-- 管理员信息 -->
    <div class="admin-info">
      <div class="info-item">
        <span class="label">用户名：</span>
        <span class="value">{{ adminData?.username }}</span>
      </div>
      <div class="info-item">
        <span class="label">昵称：</span>
        <span class="value">{{ adminData?.nickname || '-' }}</span>
      </div>
    </div>
    
    <el-divider />
    
    <!-- 密码重置表单 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="新密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入新密码"
          show-password
          maxlength="100"
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          maxlength="100"
        />
      </el-form-item>
    </el-form>
    
    <div class="password-tips">
      <h4>密码安全提示：</h4>
      <ul>
        <li>密码长度至少6位</li>
        <li>建议包含字母、数字和特殊字符</li>
        <li>不要使用过于简单的密码</li>
        <li>重置后请提醒管理员及时修改密码</li>
      </ul>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          重置密码
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { resetAdminPassword } from '@/api/admin';
import type { Admin, ResetPasswordRequest } from '@/types/admin';

interface Props {
  modelValue: boolean;
  adminData?: Admin | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  adminData: null
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const submitting = ref(false);

// 表单数据
const formData = reactive<ResetPasswordRequest>({
  password: '',
  confirmPassword: ''
});

// 表单验证规则
const formRules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度为6-100个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 方法
const resetForm = () => {
  formRef.value?.resetFields();
  formData.password = '';
  formData.confirmPassword = '';
};

const handleSubmit = async () => {
  if (!formRef.value || !props.adminData) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    await resetAdminPassword(props.adminData.id, formData.password);
    
    ElMessage.success('密码重置成功');
    emit('success');
    handleClose();
  } catch (error) {
    console.error('密码重置失败:', error);
    ElMessage.error('密码重置失败');
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
  resetForm();
};

// 监听器
watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      resetForm();
    }
  }
);
</script>

<style scoped>
.admin-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item .label {
  color: #606266;
  font-weight: 500;
  width: 80px;
  flex-shrink: 0;
}

.info-item .value {
  color: #303133;
  flex: 1;
}

.password-tips {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin-top: 20px;
}

.password-tips h4 {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.password-tips ul {
  margin: 0;
  padding-left: 16px;
}

.password-tips li {
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.dialog-footer {
  text-align: right;
}
</style> 