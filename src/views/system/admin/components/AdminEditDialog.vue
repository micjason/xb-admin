<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="loading"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit || isView"
          maxlength="50"
        />
      </el-form-item>
      
      <el-form-item label="密码" prop="password" v-if="!isEdit">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          :disabled="isView"
          maxlength="100"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          :disabled="isView"
          maxlength="100"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="formData.nickname"
          placeholder="请输入昵称"
          :disabled="isView"
          maxlength="50"
        />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          :disabled="isView"
          maxlength="100"
        />
      </el-form-item>
      
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
          :disabled="isView"
          maxlength="11"
        />
      </el-form-item>
      
      <el-form-item label="头像" prop="avatar">
        <div class="avatar-uploader">
          <el-upload
            class="avatar-uploader"
            action="/api/upload/avatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :disabled="isView"
            :headers="uploadHeaders"
          >
            <img v-if="formData.avatar" :src="formData.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon" :size="50"><Plus /></el-icon>
          </el-upload>
          <div class="avatar-tips">
            <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status" :disabled="isView">
          <el-radio :value="AdminStatus.ENABLED">启用</el-radio>
          <el-radio :value="AdminStatus.DISABLED">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="分配角色" prop="roleIds">
        <el-select
          v-model="formData.roleIds"
          multiple
          placeholder="请选择角色"
          style="width: 100%"
          :disabled="isView"
        >
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          >
            <span>{{ role.name }}</span>
            <span v-if="role.description" style="color: #8492a6; font-size: 12px;">
              - {{ role.description }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer v-if="!isView">
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules, type UploadProps } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { createAdmin, updateAdmin, getAllRoles } from '@/api/admin';
import { useAuthStore } from '@/store/modules/auth';
import { AdminStatus, type Admin, type AdminFormData, type CreateAdminRequest, type UpdateAdminRequest } from '@/types/admin';
import { validateEmail, validatePhone } from '@/utils/validate';

interface Props {
  modelValue: boolean;
  adminData?: Admin | null;
  isEdit?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  adminData: null,
  isEdit: false
});

const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);
const roleList = ref<Array<{ id: number; name: string; description?: string }>>([]);

// 表单数据
const formData = reactive<AdminFormData>({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  status: AdminStatus.ENABLED,
  roleIds: []
});

// 计算属性
const dialogTitle = computed(() => {
  if (isView.value) return '查看管理员';
  return props.isEdit ? '编辑管理员' : '新增管理员';
});

const isView = computed(() => !props.isEdit && props.adminData);

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}));

// 表单验证规则
const formRules = computed((): FormRules => {
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 50, message: '用户名长度为3-50个字符', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
    ],
    nickname: [
      { max: 50, message: '昵称长度不能超过50个字符', trigger: 'blur' }
    ],
    email: [
      { validator: validateEmail, trigger: 'blur' }
    ],
    phone: [
      { validator: validatePhone, trigger: 'blur' }
    ],
    status: [
      { required: true, message: '请选择状态', trigger: 'change' }
    ]
  };

  // 新增时的密码验证
  if (!props.isEdit) {
    rules.password = [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 100, message: '密码长度为6-100个字符', trigger: 'blur' }
    ];
    rules.confirmPassword = [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
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
    ];
  }

  return rules;
});

// 方法
const fetchRoles = async () => {
  try {
    const response = await getAllRoles();
    if (response.success && response.data) {
      roleList.value = response.data;
    }
  } catch (error) {
    console.error('获取角色列表失败:', error);
  }
};

const initFormData = () => {
  if (props.adminData) {
    // 编辑或查看模式
    formData.id = props.adminData.id;
    formData.username = props.adminData.username;
    formData.nickname = props.adminData.nickname || '';
    formData.email = props.adminData.email || '';
    formData.phone = props.adminData.phone || '';
    formData.avatar = props.adminData.avatar || '';
    formData.status = props.adminData.status;
    formData.roleIds = props.adminData.roleIds || [];
  } else {
    // 新增模式
    formData.id = undefined;
    formData.username = '';
    formData.password = '';
    formData.confirmPassword = '';
    formData.nickname = '';
    formData.email = '';
    formData.phone = '';
    formData.avatar = '';
    formData.status = AdminStatus.ENABLED;
    formData.roleIds = [];
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  initFormData();
};

const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.success && response.data) {
    formData.avatar = response.data.url;
  }
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    if (props.isEdit) {
      // 编辑模式
      const updateData: UpdateAdminRequest = {
        nickname: formData.nickname || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined,
        status: formData.status
      };

      await updateAdmin(formData.id!, updateData);
      ElMessage.success('更新成功');
    } else {
      // 新增模式
      const createData: CreateAdminRequest = {
        username: formData.username,
        password: formData.password!,
        nickname: formData.nickname || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined,
        status: formData.status,
        roleIds: formData.roleIds.length ? formData.roleIds : undefined
      };

      await createAdmin(createData);
      ElMessage.success('创建成功');
    }

    emit('success');
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
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
    if (visible) {
      initFormData();
      fetchRoles();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  color: #8c939d;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.avatar-tips {
  margin-top: 8px;
}

.avatar-tips p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}
</style> 