<template>
  <el-dialog
    :model-value="modelValue"
    title="分配角色"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="role-dialog-content">
      <!-- 管理员信息 -->
      <div class="admin-info">
        <h4>管理员信息</h4>
        <div class="info-item">
          <span class="label">用户名：</span>
          <span class="value">{{ adminData?.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">昵称：</span>
          <span class="value">{{ adminData?.nickname || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前角色：</span>
          <div class="current-roles">
            <el-tag
              v-for="role in adminData?.roles"
              :key="role.id"
              size="small"
              style="margin-right: 8px; margin-bottom: 4px;"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="!adminData?.roles?.length" class="no-roles">暂无角色</span>
          </div>
        </div>
      </div>
      
      <el-divider />
      
      <!-- 角色选择 -->
      <div class="role-selection">
        <h4>选择角色</h4>
        <el-form :model="formData" v-loading="loading">
          <el-form-item>
            <el-checkbox-group v-model="formData.roleIds">
              <div class="role-list">
                <div
                  v-for="role in roleList"
                  :key="role.id"
                  class="role-item"
                >
                  <el-checkbox :value="role.id" :label="role.name">
                    <div class="role-content">
                      <div class="role-name">{{ role.name }}</div>
                      <div class="role-description" v-if="role.description">
                        {{ role.description }}
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </div>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { assignAdminRoles, getAllRoles } from '@/api/admin';
import type { Admin } from '@/types/admin';

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

const loading = ref(false);
const submitting = ref(false);
const roleList = ref<Array<{ id: number; name: string; description?: string }>>([]);

// 表单数据
const formData = reactive({
  roleIds: [] as number[]
});

// 方法
const fetchRoles = async () => {
  loading.value = true;
  try {
    const response = await getAllRoles();
    if (response.success && response.data) {
      roleList.value = response.data;
    }
  } catch (error) {
    console.error('获取角色列表失败:', error);
    ElMessage.error('获取角色列表失败');
  } finally {
    loading.value = false;
  }
};

const initFormData = () => {
  if (props.adminData?.roleIds) {
    formData.roleIds = [...props.adminData.roleIds];
  } else if (props.adminData?.roles) {
    formData.roleIds = props.adminData.roles.map(role => role.id);
  } else {
    formData.roleIds = [];
  }
};

const handleSubmit = async () => {
  if (!props.adminData) return;
  
  try {
    submitting.value = true;
    
    await assignAdminRoles(props.adminData.id, {
      roleIds: formData.roleIds
    });
    
    ElMessage.success('角色分配成功');
    emit('success');
  } catch (error) {
    console.error('角色分配失败:', error);
    ElMessage.error('角色分配失败');
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
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
.role-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}

.admin-info h4,
.role-selection h4 {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
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

.current-roles {
  flex: 1;
}

.no-roles {
  color: #c0c4cc;
  font-style: italic;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  transition: all 0.2s;
}

.role-item:hover {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.role-content {
  margin-left: 8px;
}

.role-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.role-description {
  font-size: 12px;
  color: #909399;
}

:deep(.el-checkbox) {
  width: 100%;
  margin-right: 0;
}

:deep(.el-checkbox__label) {
  width: 100%;
}

.dialog-footer {
  text-align: right;
}
</style> 