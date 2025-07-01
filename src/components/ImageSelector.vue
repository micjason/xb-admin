<template>
  <el-dialog
    v-model="visible"
    title="选择图片"
    width="1000px"
    :close-on-click-modal="false"
    append-to-body
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <div class="image-selector">
      <!-- 头部操作 -->
      <div class="header-actions">
        <div class="left-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索图片名称"
            style="width: 300px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="right-actions">
          <span class="selection-count">
            已选择: {{ selectedImages.length }} 张
            <span v-if="maxCount > 0">/ {{ maxCount }}</span>
          </span>
          
          <el-button @click="clearSelection">清空选择</el-button>
          
          <el-upload
            action="/api/upload/images"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            multiple
            accept="image/*"
          >
            <el-button type="primary" :icon="Plus">
              上传新图片
            </el-button>
          </el-upload>
        </div>
      </div>

      <!-- 图片网格 -->
      <div class="image-grid" v-loading="loading">
        <div 
          v-for="image in filteredImages" 
          :key="image.filename"
          class="image-item"
          :class="{ 
            'selected': selectedImages.includes(image.fullUrl),
            'disabled': maxCount > 0 && selectedImages.length >= maxCount && !selectedImages.includes(image.fullUrl)
          }"
          @click="toggleSelection(image)"
        >
          <div class="image-wrapper">
            <el-image
              :src="image.fullUrl"
              fit="cover"
              class="image-preview"
            />
            
            <!-- 选择状态 -->
            <div class="selection-overlay" v-if="selectedImages.includes(image.fullUrl)">
              <el-icon class="check-icon"><Check /></el-icon>
            </div>
            
            <!-- 禁用状态 -->
            <div class="disabled-overlay" v-if="maxCount > 0 && selectedImages.length >= maxCount && !selectedImages.includes(image.fullUrl)">
              <span>已达上限</span>
            </div>
          </div>
          
          <div class="image-info">
            <div class="image-name" :title="image.filename">{{ image.filename }}</div>
            <div class="image-meta">
              <span>{{ formatFileSize(image.size) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && filteredImages.length === 0" class="empty-state">
          <el-empty description="暂无图片">
            <el-upload
              action="/api/upload/images"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              multiple
              accept="image/*"
            >
              <el-button type="primary">上传第一张图片</el-button>
            </el-upload>
          </el-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :disabled="selectedImages.length === 0"
        >
          确认选择 ({{ selectedImages.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Check } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { getImageList } from '@/api/upload'
import type { ImageListItem } from '@/api/upload'

interface Props {
  modelValue: boolean
  selectedUrls?: string[] // 已选择的图片URL
  maxCount?: number // 最大选择数量，0表示不限制
  multiple?: boolean // 是否支持多选
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', selectedUrls: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedUrls: () => [],
  maxCount: 0,
  multiple: true
})

const emit = defineEmits<Emits>()

// 响应式数据
const authStore = useAuthStore()
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const imageList = ref<ImageListItem[]>([])
const selectedImages = ref<string[]>([])

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

const filteredImages = computed(() => {
  if (!searchKeyword.value) return imageList.value
  return imageList.value.filter(image => 
    image.filename.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const loadImages = async () => {
  try {
    loading.value = true
    const response = await getImageList({
      page: currentPage.value,
      limit: pageSize.value
    })
    
    if (response.success) {
      imageList.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    console.error('加载图片列表失败:', error)
    ElMessage.error('加载图片列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索是通过计算属性实时过滤的
}

const toggleSelection = (image: ImageListItem) => {
  const url = image.fullUrl
  const index = selectedImages.value.indexOf(url)
  
  if (index > -1) {
    // 取消选择
    selectedImages.value.splice(index, 1)
  } else {
    // 选择图片
    if (props.multiple) {
      // 多选模式
      if (props.maxCount === 0 || selectedImages.value.length < props.maxCount) {
        selectedImages.value.push(url)
      } else {
        ElMessage.warning(`最多只能选择 ${props.maxCount} 张图片`)
      }
    } else {
      // 单选模式
      selectedImages.value = [url]
    }
  }
}

const clearSelection = () => {
  selectedImages.value = []
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any) => {
  if (response.success) {
    ElMessage.success('图片上传成功')
    loadImages() // 重新加载图片列表
    
    // 自动选择新上传的图片
    if (props.multiple) {
      if (props.maxCount === 0 || selectedImages.value.length < props.maxCount) {
        selectedImages.value.push(response.data.fullUrl)
      }
    } else {
      selectedImages.value = [response.data.fullUrl]
    }
  } else {
    ElMessage.error('图片上传失败')
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadImages()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadImages()
}

const handleDialogOpen = () => {
  // 初始化选择状态
  selectedImages.value = [...props.selectedUrls]
  loadImages()
}

const handleDialogClose = () => {
  // 清理状态
  searchKeyword.value = ''
  currentPage.value = 1
}

const handleClose = () => {
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm', selectedImages.value)
  visible.value = false
}

// 监听器
watch(() => props.selectedUrls, (newVal) => {
  selectedImages.value = [...newVal]
}, { immediate: true })
</script>

<style scoped lang="scss">
.image-selector {
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .left-actions {
      display: flex;
      gap: 12px;
    }
    
    .right-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      
      .selection-count {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
    min-height: 300px;
    max-height: 500px;
    overflow-y: auto;
  }

  .image-item {
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f9f9f9;

    &:hover:not(.disabled) {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .image-wrapper {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;

      .image-preview {
        width: 100%;
        height: 100%;
      }

      .selection-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(64, 158, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;

        .check-icon {
          font-size: 24px;
          color: white;
          background-color: #409eff;
          border-radius: 50%;
          padding: 6px;
        }
      }

      .disabled-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
      }
    }

    .image-info {
      padding: 8px;

      .image-name {
        font-size: 12px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .image-meta {
        font-size: 11px;
        color: #909399;
      }
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

.dialog-footer {
  text-align: right;
}
</style> 