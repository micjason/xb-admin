<template>
  <div class="media-management">
    <el-card>
      <!-- 头部操作区 -->
      <div class="header-actions">
        <div class="left-actions">
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
              上传图片
            </el-button>
          </el-upload>
          
          <el-button 
            v-if="selectedImages.length > 0"
            type="danger" 
            :icon="Delete"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedImages.length }})
          </el-button>
        </div>
        
        <div class="right-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索图片名称"
            style="width: 200px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="sortBy" @change="loadImages" style="width: 120px">
            <el-option label="最新上传" value="createTime" />
            <el-option label="文件大小" value="size" />
            <el-option label="文件名称" value="filename" />
          </el-select>
        </div>
      </div>

      <!-- 图片网格 -->
      <div class="image-grid" v-loading="loading">
        <div 
          v-for="image in filteredImages" 
          :key="image.filename"
          class="image-item"
          :class="{ 'selected': selectedImages.includes(image.filename) }"
          @click="toggleSelection(image.filename)"
        >
          <div class="image-wrapper">
            <el-image
              :src="image.fullUrl"
              fit="cover"
              class="image-preview"
              :preview-src-list="[image.fullUrl]"
              :initial-index="0"
              preview-teleported
            />
            
            <!-- 选择状态 -->
            <div class="selection-overlay" v-if="selectedImages.includes(image.filename)">
              <el-icon class="check-icon"><Check /></el-icon>
            </div>
            
            <!-- 操作按钮 -->
            <div class="image-actions">
              <el-button
                type="primary"
                :icon="ZoomIn"
                circle
                size="small"
                @click.stop="previewImage(image)"
              />
              <el-button
                type="info"
                :icon="CopyDocument"
                circle
                size="small"
                @click.stop="copyImageUrl(image)"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click.stop="deleteImage(image)"
              />
            </div>
          </div>
          
          <div class="image-info">
            <div class="image-name" :title="image.filename">{{ image.filename }}</div>
            <div class="image-meta">
              <span>{{ formatFileSize(image.size) }}</span>
              <span>{{ formatDate(image.createTime) }}</span>
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
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 图片详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentImage?.filename"
      width="600px"
      append-to-body
    >
      <div class="image-detail" v-if="currentImage">
        <div class="detail-image">
          <el-image
            :src="currentImage.fullUrl"
            fit="contain"
            style="width: 100%; max-height: 400px;"
          />
        </div>
        
        <div class="detail-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件名">
              {{ currentImage.filename }}
            </el-descriptions-item>
            <el-descriptions-item label="文件大小">
              {{ formatFileSize(currentImage.size) }}
            </el-descriptions-item>
            <el-descriptions-item label="上传时间">
              {{ formatDate(currentImage.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="最后修改">
              {{ formatDate(currentImage.updateTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="访问URL" :span="2">
              <el-input 
                :value="currentImage.fullUrl" 
                readonly
                style="width: 100%"
              >
                <template #append>
                  <el-button @click="copyImageUrl(currentImage)">复制</el-button>
                </template>
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Delete, Search, ZoomIn, CopyDocument, Check 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { getImageList, deleteImage as deleteImageApi } from '@/api/upload'
import type { ImageListItem } from '@/api/upload'

// 响应式数据
const authStore = useAuthStore()
const loading = ref(false)
const searchKeyword = ref('')
const sortBy = ref('createTime')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const imageList = ref<ImageListItem[]>([])
const selectedImages = ref<string[]>([])
const detailDialogVisible = ref(false)
const currentImage = ref<ImageListItem | null>(null)

// 计算属性
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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
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
      
      // 根据排序方式排序
      if (sortBy.value === 'size') {
        imageList.value.sort((a, b) => b.size - a.size)
      } else if (sortBy.value === 'filename') {
        imageList.value.sort((a, b) => a.filename.localeCompare(b.filename))
      } else {
        imageList.value.sort((a, b) => 
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        )
      }
    }
  } catch (error) {
    console.error('加载图片列表失败:', error)
    ElMessage.error('加载图片列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索是通过计算属性实时过滤的，这里可以添加防抖逻辑
}

const toggleSelection = (filename: string) => {
  const index = selectedImages.value.indexOf(filename)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(filename)
  }
}

const previewImage = (image: ImageListItem) => {
  currentImage.value = image
  detailDialogVisible.value = true
}

const copyImageUrl = async (image: ImageListItem) => {
  try {
    await navigator.clipboard.writeText(image.fullUrl)
    ElMessage.success('图片URL已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = image.fullUrl
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('图片URL已复制到剪贴板')
  }
}

const deleteImage = async (image: ImageListItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除图片 "${image.filename}" 吗？删除后不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    await deleteImageApi(image.filename)
    ElMessage.success('图片删除成功')
    loadImages()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除图片失败:', error)
      ElMessage.error('删除图片失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedImages.value.length} 张图片吗？删除后不可恢复。`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    // 批量删除
    const deletePromises = selectedImages.value.map(filename => deleteImageApi(filename))
    await Promise.all(deletePromises)
    
    ElMessage.success(`成功删除 ${selectedImages.value.length} 张图片`)
    selectedImages.value = []
    loadImages()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
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
    loadImages()
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

// 生命周期
onMounted(() => {
  loadImages()
})
</script>

<style scoped lang="scss">
.media-management {
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
    }
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
    min-height: 300px;
  }

  .image-item {
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f9f9f9;

    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
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
          font-size: 32px;
          color: white;
          background-color: #409eff;
          border-radius: 50%;
          padding: 8px;
        }
      }

      .image-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover .image-actions {
        opacity: 1;
      }
    }

    .image-info {
      padding: 12px;

      .image-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .image-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;

        span {
          white-space: nowrap;
        }
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

  .image-detail {
    .detail-image {
      text-align: center;
      margin-bottom: 20px;
    }

    .detail-info {
      :deep(.el-descriptions__body) {
        background-color: #f9f9f9;
      }
    }
  }
}
</style> 