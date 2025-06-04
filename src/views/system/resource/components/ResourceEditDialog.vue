<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="资源名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入资源名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入资源描述"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          placeholder="请输入或选择标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="active">可用</el-radio>
          <el-radio label="inactive">不可用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="mode === 'view'" label="文件大小">
        <span>{{ formatFileSize(resource?.size || 0) }}</span>
      </el-form-item>

      <el-form-item v-if="mode === 'view'" label="存储类型">
        <el-tag>{{ getStorageTypeLabel(resource?.storageType) }}</el-tag>
      </el-form-item>

      <el-form-item v-if="mode === 'view'" label="文件类型">
        <el-tag :type="getResourceTypeTagType(resource?.type)">
          {{ getResourceTypeLabel(resource?.type) }}
        </el-tag>
      </el-form-item>

      <el-form-item v-if="mode === 'view'" label="上传时间">
        <span>{{ resource?.createdAt ? formatTime(resource.createdAt) : '-' }}</span>
      </el-form-item>

      <el-form-item v-if="mode === 'view'" label="访问地址">
        <el-link :href="resource?.url" type="primary" target="_blank">
          {{ resource?.url }}
        </el-link>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ mode === 'view' ? '关闭' : '取消' }}
        </el-button>
        <el-button
          v-if="mode !== 'view'"
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { updateResource } from '@/api/resource'
import { formatTime, formatFileSize } from '@/utils/format'
import { ResourceStatus } from '@/types/resource'
import type { Resource, ResourceForm, ResourceType, StorageType } from '@/types/resource'

interface Props {
  modelValue: boolean
  resource?: Resource | null
  mode: 'add' | 'edit' | 'view'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  resource: null,
  mode: 'edit'
})

const emit = defineEmits<Emits>()

// 对话框状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单引用和加载状态
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const formData = reactive<ResourceForm>({
  name: '',
  description: '',
  tags: [],
  status: ResourceStatus.ACTIVE
})

// 常用标签
const commonTags = ref([
  '图片素材',
  '产品图片',
  '横幅广告',
  '文档资料',
  '视频内容',
  '音频文件',
  '用户头像',
  '商品封面',
  '活动海报',
  '系统图标'
])

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入资源名称', trigger: 'blur' },
    { min: 1, max: 100, message: '资源名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 对话框标题
const dialogTitle = computed(() => {
  const titles = {
    add: '添加资源',
    edit: '编辑资源',
    view: '查看资源'
  }
  return titles[props.mode]
})

/**
 * 初始化表单数据
 */
const initFormData = () => {
  if (props.resource) {
    Object.assign(formData, {
      name: props.resource.name,
      description: props.resource.description || '',
      tags: props.resource.tags || [],
      status: props.resource.status
    })
  } else {
    Object.assign(formData, {
      name: '',
      description: '',
      tags: [],
      status: 'active'
    })
  }
}

/**
 * 监听resource变化，重新初始化表单
 */
watch(
  () => props.resource,
  () => {
    if (dialogVisible.value) {
      initFormData()
    }
  },
  { immediate: true }
)

/**
 * 监听对话框显示状态
 */
watch(dialogVisible, (visible) => {
  if (visible) {
    initFormData()
  }
})

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    if (!props.resource?.id) {
      ElMessage.error('资源ID不存在')
      return
    }

    submitLoading.value = true

    await updateResource(props.resource.id, formData)
    
    ElMessage.success('保存成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitLoading.value = false
  }
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

/**
 * 获取资源类型标签类型
 */
const getResourceTypeTagType = (type?: ResourceType) => {
  if (!type) return 'default'
  const typeMap = {
    image: 'success',
    video: 'warning',
    audio: 'info',
    document: 'primary',
    other: 'default'
  }
  return typeMap[type] || 'default'
}

/**
 * 获取资源类型标签
 */
const getResourceTypeLabel = (type?: ResourceType) => {
  if (!type) return '未知'
  const typeMap = {
    image: '图片',
    video: '视频',
    audio: '音频',
    document: '文档',
    other: '其他'
  }
  return typeMap[type] || '未知'
}

/**
 * 获取存储类型标签
 */
const getStorageTypeLabel = (type?: StorageType) => {
  if (!type) return '未知'
  const typeMap = {
    local: '本地',
    oss: 'OSS',
    cos: 'COS',
    qiniu: '七牛',
    minio: 'MinIO'
  }
  return typeMap[type] || '未知'
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 