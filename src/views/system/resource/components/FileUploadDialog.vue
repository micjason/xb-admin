<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传文件"
    width="800px"
    @close="handleClose"
  >
    <div class="upload-container">
      <!-- 上传配置 -->
      <el-form
        ref="configFormRef"
        :model="uploadConfig"
        :rules="configRules"
        label-width="100px"
        class="config-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="存储类型" prop="storageType">
              <el-select
                v-model="uploadConfig.storageType"
                placeholder="请选择存储类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in storageTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select
                v-model="uploadConfig.categoryId"
                placeholder="请选择分类"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="标签">
          <el-select
            v-model="uploadConfig.tags"
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
        
        <el-form-item label="描述">
          <el-input
            v-model="uploadConfig.description"
            type="textarea"
            placeholder="请输入文件描述"
            :rows="2"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- 文件上传区域 -->
      <div class="upload-area">
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          :action="uploadAction"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="onUploadSuccess"
          :on-error="onUploadError"
          :on-progress="onUploadProgress"
          :on-remove="onFileRemove"
          :file-list="fileList"
          :limit="uploadLimit"
          :accept="acceptTypes"
          multiple
          drag
          :auto-upload="false"
        >
          <el-icon class="el-icon--upload">
            <Upload />
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持格式：{{ acceptTypesText }}，单个文件不超过 {{ maxFileSizeText }}
            </div>
          </template>
        </el-upload>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploadProgress.length > 0" class="progress-list">
        <div
          v-for="(progress, index) in uploadProgress"
          :key="index"
          class="progress-item"
        >
          <div class="progress-info">
            <span class="file-name">{{ progress.fileName }}</span>
            <span class="file-size">{{ formatFileSize(progress.fileSize) }}</span>
          </div>
          <el-progress
            :percentage="progress.percentage"
            :status="progress.status"
            :stroke-width="6"
          />
          <div class="progress-actions">
            <el-button
              v-if="progress.status === 'exception'"
              type="text"
              size="small"
              @click="retryUpload(progress)"
            >
              重试
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="removeProgress(index)"
            >
              移除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 上传结果统计 -->
      <div v-if="uploadStats.total > 0" class="upload-stats">
        <el-alert
          :title="`上传完成：成功 ${uploadStats.success} 个，失败 ${uploadStats.failed} 个`"
          :type="uploadStats.failed > 0 ? 'warning' : 'success'"
          show-icon
          :closable="false"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="uploading"
          :disabled="fileList.length === 0"
          @click="handleUpload"
        >
          {{ uploading ? '上传中...' : '开始上传' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadInstance, type UploadProps, type UploadFile } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { uploadFile, getResourceCategoryTree } from '@/api/resource'
import { formatFileSize } from '@/utils/format'
import { StorageType, ResourceType } from '@/types/resource'
import type { FileUploadParams, ResourceCategory } from '@/types/resource'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 认证store
const authStore = useAuthStore()

// 对话框状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单引用
const configFormRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()

// 上传状态
const uploading = ref(false)
const fileList = ref<UploadFile[]>([])

// 上传配置
const uploadConfig = reactive<{
  storageType: StorageType
  categoryId?: number
  tags: string[]
  description?: string
}>({
  storageType: StorageType.LOCAL,
  tags: [],
  description: ''
})

// 上传进度
interface UploadProgressItem {
  fileName: string
  fileSize: number
  percentage: number
  status: 'uploading' | 'success' | 'exception'
  file?: File
}

const uploadProgress = ref<UploadProgressItem[]>([])

// 上传统计
const uploadStats = reactive({
  total: 0,
  success: 0,
  failed: 0
})

// 表单验证规则
const configRules: FormRules = {
  storageType: [
    { required: true, message: '请选择存储类型', trigger: 'change' }
  ]
}

// 存储类型选项
const storageTypeOptions = ref([
  { label: '本地存储', value: StorageType.LOCAL },
  { label: '阿里云OSS', value: StorageType.OSS },
  { label: '腾讯云COS', value: StorageType.COS },
  { label: '七牛云', value: StorageType.QINIU },
  { label: 'MinIO', value: StorageType.MINIO }
])

// 分类选项
const categoryOptions = ref<ResourceCategory[]>([])

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

// 上传配置
const uploadLimit = 20 // 最大文件数量
const maxFileSize = 50 * 1024 * 1024 // 50MB
const maxFileSizeText = '50MB'

// 支持的文件类型
const acceptTypes = '.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.avi,.mov,.mp3,.wav,.flac,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar'
const acceptTypesText = '图片、视频、音频、文档、压缩包等'

// 上传接口配置
const uploadAction = computed(() => `${import.meta.env.VITE_API_BASE_URL}/api/v1/resource/upload`)
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${authStore.token}`
}))
const uploadData = computed(() => ({
  storageType: uploadConfig.storageType,
  categoryId: uploadConfig.categoryId,
  tags: uploadConfig.tags.join(','),
  description: uploadConfig.description
}))

/**
 * 获取分类选项
 */
const fetchCategories = async () => {
  try {
    const { data } = await getResourceCategoryTree()
    categoryOptions.value = flattenCategories(data)
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

/**
 * 扁平化分类树
 */
const flattenCategories = (categories: ResourceCategory[], prefix = ''): ResourceCategory[] => {
  const result: ResourceCategory[] = []
  
  categories.forEach(category => {
    const name = prefix ? `${prefix} / ${category.name}` : category.name
    result.push({
      ...category,
      name
    })
    
    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children, name))
    }
  })
  
  return result
}

/**
 * 上传前检查
 */
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 文件大小检查
  if (file.size > maxFileSize) {
    ElMessage.error(`文件 ${file.name} 大小超过 ${maxFileSizeText}`)
    return false
  }
  
  // 添加到进度列表
  uploadProgress.value.push({
    fileName: file.name,
    fileSize: file.size,
    percentage: 0,
    status: 'uploading',
    file
  })
  
  return true
}

/**
 * 上传进度
 */
const onUploadProgress: UploadProps['onProgress'] = (evt, file) => {
  const progress = uploadProgress.value.find(p => p.fileName === file.name)
  if (progress) {
    progress.percentage = Math.round(evt.percent || 0)
  }
}

/**
 * 上传成功
 */
const onUploadSuccess: UploadProps['onSuccess'] = (response, file) => {
  const progress = uploadProgress.value.find(p => p.fileName === file.name)
  if (progress) {
    progress.status = 'success'
    progress.percentage = 100
  }
  
  uploadStats.success++
  
  ElMessage.success(`文件 ${file.name} 上传成功`)
}

/**
 * 上传失败
 */
const onUploadError: UploadProps['onError'] = (error, file) => {
  const progress = uploadProgress.value.find(p => p.fileName === file.name)
  if (progress) {
    progress.status = 'exception'
  }
  
  uploadStats.failed++
  
  ElMessage.error(`文件 ${file.name} 上传失败`)
  console.error('上传失败:', error)
}

/**
 * 移除文件
 */
const onFileRemove: UploadProps['onRemove'] = (file) => {
  const index = uploadProgress.value.findIndex(p => p.fileName === file.name)
  if (index > -1) {
    uploadProgress.value.splice(index, 1)
  }
}

/**
 * 开始上传
 */
const handleUpload = async () => {
  if (!configFormRef.value) return
  
  try {
    await configFormRef.value.validate()
    
    if (fileList.value.length === 0) {
      ElMessage.warning('请选择要上传的文件')
      return
    }
    
    uploading.value = true
    uploadStats.total = fileList.value.length
    uploadStats.success = 0
    uploadStats.failed = 0
    
    // 启动上传
    uploadRef.value?.submit()
    
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 重试上传
 */
const retryUpload = async (progress: UploadProgressItem) => {
  if (!progress.file) return
  
  try {
    progress.status = 'uploading'
    progress.percentage = 0
    
    const formData = new FormData()
    formData.append('file', progress.file)
    formData.append('storageType', uploadConfig.storageType)
    if (uploadConfig.categoryId) {
      formData.append('categoryId', uploadConfig.categoryId.toString())
    }
    formData.append('tags', uploadConfig.tags.join(','))
    if (uploadConfig.description) {
      formData.append('description', uploadConfig.description)
    }
    
    await uploadFile({
      file: progress.file,
      categoryId: uploadConfig.categoryId,
      tags: uploadConfig.tags,
      description: uploadConfig.description,
      storageType: uploadConfig.storageType
    })
    
    progress.status = 'success'
    progress.percentage = 100
    uploadStats.success++
    uploadStats.failed--
    
    ElMessage.success(`文件 ${progress.fileName} 重新上传成功`)
  } catch (error) {
    progress.status = 'exception'
    ElMessage.error(`文件 ${progress.fileName} 重新上传失败`)
    console.error('重新上传失败:', error)
  }
}

/**
 * 移除进度项
 */
const removeProgress = (index: number) => {
  uploadProgress.value.splice(index, 1)
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  if (uploading.value) {
    ElMessageBox.confirm('正在上传中，确定要关闭吗？', '确认关闭', {
      type: 'warning'
    }).then(() => {
      doClose()
    }).catch(() => {
      // 取消关闭
    })
  } else {
    doClose()
  }
}

/**
 * 执行关闭
 */
const doClose = () => {
  // 重置状态
  uploading.value = false
  fileList.value = []
  uploadProgress.value = []
  Object.assign(uploadStats, { total: 0, success: 0, failed: 0 })
  Object.assign(uploadConfig, {
    storageType: StorageType.LOCAL,
    categoryId: undefined,
    tags: [],
    description: ''
  })
  
  // 重置表单
  configFormRef.value?.resetFields()
  
  // 关闭对话框
  dialogVisible.value = false
  
  // 如果有成功上传的文件，触发成功事件
  if (uploadStats.success > 0) {
    emit('success')
  }
}

// 监听对话框打开，获取分类数据
watch(dialogVisible, (visible) => {
  if (visible) {
    fetchCategories()
  }
})
</script>

<style scoped lang="scss">
.upload-container {
  .config-form {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .upload-area {
    margin-bottom: 20px;

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 180px;
      border: 2px dashed var(--el-border-color-darker);
      border-radius: 8px;
      text-align: center;
      background-color: #fafafa;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
      }

      .el-icon--upload {
        font-size: 48px;
        color: var(--el-text-color-placeholder);
        margin-bottom: 16px;
      }

      .el-upload__text {
        color: var(--el-text-color-regular);
        font-size: 14px;

        em {
          color: var(--el-color-primary);
          font-style: normal;
        }
      }
    }

    :deep(.el-upload__tip) {
      color: var(--el-text-color-placeholder);
      font-size: 12px;
      margin-top: 8px;
    }
  }

  .progress-list {
    margin-bottom: 20px;

    .progress-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      margin-bottom: 8px;

      .progress-info {
        flex: 0 0 200px;
        margin-right: 16px;

        .file-name {
          display: block;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          display: block;
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          margin-top: 4px;
        }
      }

      :deep(.el-progress) {
        flex: 1;
        margin-right: 16px;
      }

      .progress-actions {
        flex: 0 0 auto;
        display: flex;
        gap: 8px;
      }
    }
  }

  .upload-stats {
    margin-bottom: 20px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 