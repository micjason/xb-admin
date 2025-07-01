<template>
  <div class="image-upload">
    <!-- 上传区域 -->
    <div 
      class="upload-area"
      :class="{ 
        'is-dragover': isDragOver,
        'is-disabled': disabled || (maxCount > 0 && imageList.length >= maxCount)
      }"
      @click="handleClick"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      v-show="showUploadArea"
    >
      <el-icon class="upload-icon" :size="50">
        <Plus />
      </el-icon>
      <div class="upload-text">
        <div>点击或拖拽文件到此区域上传</div>
        <div class="upload-hint">
          支持 {{ acceptedFormats.join('、') }} 格式，单个文件不超过 {{ formatFileSize(maxSize) }}
          <span v-if="maxCount > 0">，最多上传 {{ maxCount }} 张图片</span>
        </div>
      </div>
    </div>

    <!-- 图片列表 -->
    <div class="image-list" v-if="imageList.length > 0">
      <div 
        class="image-item" 
        v-for="(item, index) in imageList" 
        :key="item.uid || item.url"
      >
        <div class="image-wrapper">
          <img 
            :src="item.url || item.preview" 
            :alt="item.name"
            class="image-preview"
            @error="handleImageError"
          />
          
          <!-- 上传进度 -->
          <div class="upload-progress" v-if="item.status === 'uploading'">
            <el-progress 
              :percentage="item.progress || 0"
              :show-text="false"
              :stroke-width="4"
            />
            <div class="progress-text">{{ item.progress || 0 }}%</div>
          </div>

          <!-- 操作按钮 -->
          <div class="image-actions" v-if="item.status !== 'uploading'">
            <el-button
              type="primary"
              :icon="ZoomIn"
              circle
              size="small"
              @click="handlePreview(item)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="handleRemove(index)"
              :disabled="disabled"
            />
          </div>

          <!-- 状态标识 -->
          <div class="status-badge">
            <el-icon v-if="item.status === 'success'" class="success-icon">
              <Check />
            </el-icon>
            <el-icon v-if="item.status === 'error'" class="error-icon">
              <Close />
            </el-icon>
          </div>
        </div>
        
        <div class="image-name">{{ item.name }}</div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
      style="display: none"
    />

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图片预览"
      width="600px"
      append-to-body
    >
      <div class="preview-wrapper">
        <img 
          :src="previewImageUrl" 
          :alt="previewImageName"
          class="preview-image"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ZoomIn, Delete, Check, Close } from '@element-plus/icons-vue'
import { uploadImage, uploadImages, deleteImage } from '@/api/upload'
import type { UploadResult } from '@/api/upload'

export interface ImageItem extends Partial<UploadResult> {
  uid?: string
  file?: File
  preview?: string
  status?: 'ready' | 'uploading' | 'success' | 'error'
  progress?: number
  name?: string
}

interface Props {
  modelValue?: string[] // 图片URL数组
  maxCount?: number // 最大上传数量，0表示不限制
  maxSize?: number // 最大文件大小（字节），默认5MB
  multiple?: boolean // 是否支持多选
  disabled?: boolean // 是否禁用
  accept?: string // 接受的文件类型
  listType?: 'text' | 'picture' | 'picture-card' // 列表类型
  autoUpload?: boolean // 是否自动上传
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', fileList: ImageItem[]): void
  (e: 'success', file: ImageItem, fileList: ImageItem[]): void
  (e: 'error', error: any, file: ImageItem, fileList: ImageItem[]): void
  (e: 'remove', file: ImageItem, fileList: ImageItem[]): void
  (e: 'preview', file: ImageItem): void
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 0,
  maxSize: 5 * 1024 * 1024, // 5MB
  multiple: true,
  disabled: false,
  accept: 'image/*',
  listType: 'picture-card',
  autoUpload: true
})

const emit = defineEmits<Emits>()

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const imageList = ref<ImageItem[]>([])
const isDragOver = ref(false)
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')
const previewImageName = ref('')

// 计算属性
const acceptedFormats = computed(() => {
  return ['JPG', 'JPEG', 'PNG', 'GIF', 'WebP']
})

const showUploadArea = computed(() => {
  if (props.maxCount > 0 && imageList.value.length >= props.maxCount) {
    return false
  }
  return true
})

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    imageList.value = newVal.map((url, index) => ({
      uid: `initial-${index}`,
      url,
      name: getFileNameFromUrl(url),
      status: 'success'
    }))
  } else {
    imageList.value = []
  }
}, { immediate: true })

// 监听imageList变化，更新modelValue
watch(imageList, (newVal) => {
  const urls = newVal
    .filter(item => item.status === 'success' && item.url)
    .map(item => item.url!)
  emit('update:modelValue', urls)
  emit('change', newVal)
}, { deep: true })

// 方法
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileNameFromUrl(url: string): string {
  return url.split('/').pop() || 'image'
}

function generateUID(): string {
  return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function validateFile(file: File): string | null {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return `不支持的文件格式: ${file.type}`
  }

  // 检查文件大小
  if (file.size > props.maxSize) {
    return `文件大小超过限制: ${formatFileSize(file.size)} > ${formatFileSize(props.maxSize)}`
  }

  return null
}

function handleClick() {
  if (props.disabled) return
  if (props.maxCount > 0 && imageList.value.length >= props.maxCount) {
    ElMessage.warning(`最多只能上传 ${props.maxCount} 张图片`)
    return
  }
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFiles(Array.from(files))
  }
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  if (props.disabled) return
  
  const files = Array.from(event.dataTransfer?.files || [])
  handleFiles(files)
}

function handleFiles(files: File[]) {
  // 检查数量限制
  if (props.maxCount > 0) {
    const remainingSlots = props.maxCount - imageList.value.length
    if (files.length > remainingSlots) {
      ElMessage.warning(`最多只能再上传 ${remainingSlots} 张图片`)
      files = files.slice(0, remainingSlots)
    }
  }

  files.forEach(file => {
    const error = validateFile(file)
    if (error) {
      ElMessage.error(error)
      return
    }

    const imageItem: ImageItem = {
      uid: generateUID(),
      file,
      name: file.name,
      status: 'ready'
    }

    // 生成预览图
    const reader = new FileReader()
    reader.onload = (e) => {
      imageItem.preview = e.target?.result as string
    }
    reader.readAsDataURL(file)

    imageList.value.push(imageItem)

    // 自动上传
    if (props.autoUpload) {
      uploadFile(imageItem)
    }
  })
}

async function uploadFile(imageItem: ImageItem) {
  if (!imageItem.file) return

  imageItem.status = 'uploading'
  imageItem.progress = 0

  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (imageItem.progress! < 90) {
        imageItem.progress = imageItem.progress! + Math.random() * 20
      }
    }, 200)

    const response = await uploadImage(imageItem.file)
    
    clearInterval(progressInterval)
    imageItem.progress = 100
    imageItem.status = 'success'
    imageItem.url = response.data.fullUrl
    imageItem.filename = response.data.filename
    imageItem.size = response.data.size
    imageItem.mimetype = response.data.mimetype

    emit('success', imageItem, imageList.value)
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    imageItem.status = 'error'
    emit('error', error, imageItem, imageList.value)
    ElMessage.error(error.message || '图片上传失败')
  }
}

async function handleRemove(index: number) {
  if (props.disabled) return

  const imageItem = imageList.value[index]
  
  try {
    await ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
      type: 'warning'
    })

    // 如果是已上传的图片，删除服务器文件
    if (imageItem.filename && imageItem.status === 'success') {
      try {
        await deleteImage(imageItem.filename)
      } catch (error) {
        console.warn('删除服务器文件失败:', error)
      }
    }

    imageList.value.splice(index, 1)
    emit('remove', imageItem, imageList.value)
    ElMessage.success('图片删除成功')
  } catch {
    // 用户取消删除
  }
}

function handlePreview(imageItem: ImageItem) {
  previewImageUrl.value = imageItem.url || imageItem.preview || ''
  previewImageName.value = imageItem.name || ''
  previewDialogVisible.value = true
  emit('preview', imageItem)
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMiAyNEM0MCAyNCA0NiAzMCA0NiAzOEM0NiA0NiA0MCA1MiAzMiA1MkMyNCA1MiAxOCA0NiAxOCAzOEMxOCAzMCAyNCAyNCAzMiAyNFoiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTI2IDMzQzI3LjEwNDYgMzMgMjggMzIuMTA0NiAyOCAzMUMyOCAyOS44OTU0IDI3LjEwNDYgMjkgMjYgMjlDMjQuODk1NCAyOSAyNCAyOS44OTU0IDI0IDMxQzI0IDMyLjEwNDYgMjQuODk1NCAzMyAyNiAzM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCA0Mkw0NC4yNSAzMS43NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiLz4KPC9zdmc+Cg=='
}

// 暴露方法给父组件
defineExpose({
  upload: () => {
    imageList.value.forEach(item => {
      if (item.status === 'ready') {
        uploadFile(item)
      }
    })
  },
  clear: () => {
    imageList.value = []
  }
})
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  margin-bottom: 16px;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-area.is-dragover {
  border-color: #409eff;
  background-color: #e6f7ff;
}

.upload-area.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  color: #606266;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.image-item {
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: #409eff;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-actions {
  opacity: 1;
}

.status-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  color: #67c23a;
  background-color: white;
  border-radius: 50%;
}

.error-icon {
  color: #f56c6c;
  background-color: white;
  border-radius: 50%;
}

.image-name {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
  text-align: center;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-wrapper {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}
</style> 