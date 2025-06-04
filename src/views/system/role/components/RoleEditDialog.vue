<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入角色名称"
          clearable
          :maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="角色编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入角色编码"
          clearable
          :maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入角色描述"
          :rows="3"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="9999"
          controls-position="right"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="RoleStatus.ENABLED">启用</el-radio>
          <el-radio :label="RoleStatus.DISABLED">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="mode !== 'add'" label="创建时间">
        <span>{{ roleData ? formatTime(roleData.createTime) : '' }}</span>
      </el-form-item>
      <el-form-item v-if="mode !== 'add'" label="更新时间">
        <span>{{ roleData ? formatTime(roleData.updateTime) : '' }}</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          v-if="mode !== 'view'" 
          type="primary" 
          :loading="loading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createRole, updateRole, checkRoleCodeUnique } from '@/api/role'
import { formatTime } from '@/utils/format'
import { RoleStatus } from '@/types/role'
import type { Role, RoleForm } from '@/types/role'

// Props
interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  roleData?: Role | null
}

const props = withDefaults(defineProps<Props>(), {
  roleData: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const formData = reactive<RoleForm>({
  name: '',
  code: '',
  description: '',
  status: RoleStatus.ENABLED,
  sort: 0,
  permissionIds: []
})

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 对话框标题
const dialogTitle = computed(() => {
  switch (props.mode) {
    case 'add':
      return '新增角色'
    case 'edit':
      return '编辑角色'
    case 'view':
      return '查看角色'
    default:
      return ''
  }
})

// 验证角色编码唯一性
const validateRoleCode = async (rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }
  
  try {
    const excludeId = props.mode === 'edit' && props.roleData ? props.roleData.id : undefined
    const { data } = await checkRoleCodeUnique(value, excludeId)
    if (!data) {
      callback(new Error('角色编码已存在'))
    } else {
      callback()
    }
  } catch (error) {
    console.error('验证角色编码失败:', error)
    callback(new Error('验证角色编码失败'))
  }
}

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, 
      message: '角色编码必须以字母开头，只能包含字母、数字、下划线和连字符', 
      trigger: 'blur' 
    },
    { validator: validateRoleCode, trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值范围为 0-9999', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    description: '',
    status: RoleStatus.ENABLED,
    sort: 0,
    permissionIds: []
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 填充表单数据
const fillFormData = (data: Role) => {
  Object.assign(formData, {
    id: data.id,
    name: data.name,
    code: data.code,
    description: data.description || '',
    status: data.status,
    sort: data.sort,
    permissionIds: []
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    if (props.mode === 'add') {
      await createRole(formData)
      ElMessage.success('角色创建成功')
    } else if (props.mode === 'edit' && props.roleData) {
      await updateRole(props.roleData.id, formData)
      ElMessage.success('角色更新成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 监听对话框打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        if (props.mode === 'edit' || props.mode === 'view') {
          if (props.roleData) {
            fillFormData(props.roleData)
          }
        } else {
          resetForm()
        }
      })
    }
  }
)
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 