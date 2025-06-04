<template>
  <div class="resource-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchParams" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchParams.keyword"
            placeholder="请输入资源名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select
            v-model="searchParams.type"
            placeholder="请选择资源类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in resourceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="可用" value="active" />
            <el-option label="不可用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button
            v-permission="['resource:create']"
            type="primary"
            @click="handleUpload"
          >
            <el-icon><Upload /></el-icon>
            上传资源
          </el-button>
          <el-button
            v-permission="['resource:delete']"
            type="danger"
            :disabled="selectedResources.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button
            v-permission="['resource:export']"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计信息 -->
    <el-card class="stats-card" shadow="never">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-value">{{ resourceStats.totalCount }}</div>
          <div class="stat-label">总资源数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatFileSize(resourceStats.totalSize) }}</div>
          <div class="stat-label">总大小</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ resourceStats.imageCount }}</div>
          <div class="stat-label">图片</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ resourceStats.videoCount }}</div>
          <div class="stat-label">视频</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ resourceStats.documentCount }}</div>
          <div class="stat-label">文档</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ resourceStats.todayUpload }}</div>
          <div class="stat-label">今日上传</div>
        </div>
      </div>
    </el-card>

    <!-- 资源列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="resourceList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="预览" width="100">
          <template #default="{ row }">
            <div class="resource-preview" @click="handlePreview(row)">
              <el-image
                v-if="row.type === 'image'"
                :src="row.url"
                :preview-src-list="[row.url]"
                style="width: 60px; height: 60px"
                fit="cover"
              />
              <div
                v-else
                class="file-icon"
                :class="`file-icon-${row.type}`"
              >
                <el-icon size="30">
                  <Document v-if="row.type === 'document'" />
                  <VideoPlay v-else-if="row.type === 'video'" />
                  <Document v-else-if="row.type === 'audio'" />
                  <Folder v-else />
                </el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="资源名称" min-width="200">
          <template #default="{ row }">
            <div class="resource-name">
              <div class="name">{{ row.name }}</div>
              <div class="original-name">{{ row.originalName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getResourceTypeTagType(row.type)">
              {{ getResourceTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="storageType" label="存储类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getStorageTypeLabel(row.storageType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '可用' : '不可用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="['resource:read']"
              type="primary"
              link
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              v-permission="['resource:update']"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-dropdown @command="(command: string) => handleMoreAction(command, row)">
              <el-button type="primary" link>
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-permission="['resource:update']"
                    command="status"
                  >
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-permission="['resource:delete']"
                    command="delete"
                    divided
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchParams.page"
          v-model:page-size="searchParams.pageSize"
          :total="total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Upload,
  Delete,
  Download,
  Document,
  VideoPlay,
  Folder,
  ArrowDown
} from '@element-plus/icons-vue'
import {
  getResourceList,
  deleteResource,
  batchDeleteResources,
  updateResourceStatus,
  getResourceStats,
  getResourceTypeOptions,
  getStorageTypeOptions,
  exportResources
} from '@/api/resource'
import { formatTime, formatFileSize } from '@/utils/format'
import type {
  Resource,
  ResourceSearchParams,
  ResourceStats,
  ResourceType,
  StorageType
} from '@/types/resource'

// 搜索参数
const searchParams = reactive<ResourceSearchParams>({
  keyword: '',
  type: undefined,
  status: undefined,
  categoryId: undefined,
  storageType: undefined,
  page: 1,
  pageSize: 20
})

// 数据状态
const loading = ref(false)
const resourceList = ref<Resource[]>([])
const total = ref(0)
const selectedResources = ref<Resource[]>([])

// 统计数据
const resourceStats = ref<ResourceStats>({
  totalCount: 0,
  totalSize: 0,
  imageCount: 0,
  videoCount: 0,
  audioCount: 0,
  documentCount: 0,
  otherCount: 0,
  todayUpload: 0,
  storageUsage: []
})

// 选项数据
const resourceTypeOptions = ref<Array<{ label: string; value: ResourceType }>>([])
const storageTypeOptions = ref<Array<{ label: string; value: StorageType }>>([])

// 对话框状态
const editDialogVisible = ref(false)
const currentResource = ref<Resource | null>(null)
const dialogMode = ref<'add' | 'edit' | 'view'>('view')

/**
 * 获取资源列表
 */
const fetchResourceList = async () => {
  try {
    loading.value = true
    const { data } = await getResourceList(searchParams)
    resourceList.value = data.list
    total.value = data.total
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error('获取资源列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 获取统计数据
 */
const fetchResourceStats = async () => {
  try {
    const { data } = await getResourceStats()
    resourceStats.value = data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

/**
 * 获取选项数据
 */
const fetchOptions = async () => {
  try {
    const [typeRes, storageRes] = await Promise.all([
      getResourceTypeOptions(),
      getStorageTypeOptions()
    ])
    resourceTypeOptions.value = typeRes.data
    storageTypeOptions.value = storageRes.data
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  searchParams.page = 1
  fetchResourceList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchParams, {
    keyword: '',
    type: undefined,
    status: undefined,
    categoryId: undefined,
    storageType: undefined,
    page: 1,
    pageSize: 20
  })
  fetchResourceList()
}

/**
 * 页面变化
 */
const handlePageChange = (page: number) => {
  searchParams.page = page
  fetchResourceList()
}

/**
 * 页大小变化
 */
const handlePageSizeChange = (pageSize: number) => {
  searchParams.pageSize = pageSize
  searchParams.page = 1
  fetchResourceList()
}

/**
 * 选择变化
 */
const handleSelectionChange = (selection: Resource[]) => {
  selectedResources.value = selection
}

/**
 * 上传文件
 */
const handleUpload = () => {
  ElMessage.info('文件上传功能开发中...')
}

/**
 * 查看
 */
const handleView = (resource: Resource) => {
  currentResource.value = resource
  dialogMode.value = 'view'
  editDialogVisible.value = true
}

/**
 * 编辑
 */
const handleEdit = (resource: Resource) => {
  currentResource.value = resource
  dialogMode.value = 'edit'
  editDialogVisible.value = true
}

/**
 * 预览
 */
const handlePreview = (resource: Resource) => {
  window.open(resource.url, '_blank')
}

/**
 * 更多操作
 */
const handleMoreAction = async (command: string, resource: Resource) => {
  switch (command) {
    case 'status':
      await handleStatusChange(resource)
      break
    case 'delete':
      await handleDelete(resource)
      break
  }
}

/**
 * 状态变更
 */
const handleStatusChange = async (resource: Resource) => {
  try {
    const newStatus = resource.status === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'active' ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定要${action}资源 "${resource.name}" 吗？`,
      `确认${action}`,
      { type: 'warning' }
    )
    
    await updateResourceStatus(resource.id, newStatus as any)
    ElMessage.success(`${action}成功`)
    fetchResourceList()
  } catch (error) {
    console.error('状态变更失败:', error)
    ElMessage.error('状态变更失败')
  }
}

/**
 * 删除
 */
const handleDelete = async (resource: Resource) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资源 "${resource.name}" 吗？删除后无法恢复！`,
      '确认删除',
      { type: 'warning' }
    )
    
    await deleteResource(resource.id)
    ElMessage.success('删除成功')
    fetchResourceList()
    fetchResourceStats()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

/**
 * 批量删除
 */
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedResources.value.length} 个资源吗？删除后无法恢复！`,
      '确认批量删除',
      { type: 'warning' }
    )
    
    const ids = selectedResources.value.map(item => item.id)
    await batchDeleteResources(ids)
    ElMessage.success('批量删除成功')
    selectedResources.value = []
    fetchResourceList()
    fetchResourceStats()
  } catch (error) {
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败')
  }
}

/**
 * 导出数据
 */
const handleExport = async () => {
  try {
    const blob = await exportResources({
      ...searchParams,
      format: 'excel' as const,
      includeUrl: true,
      includeStats: true
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `资源列表_${formatTime(new Date())}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

/**
 * 获取资源类型标签类型
 */
const getResourceTypeTagType = (type: ResourceType) => {
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
const getResourceTypeLabel = (type: ResourceType) => {
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
const getStorageTypeLabel = (type: StorageType) => {
  const typeMap = {
    local: '本地',
    oss: 'OSS',
    cos: 'COS',
    qiniu: '七牛',
    minio: 'MinIO'
  }
  return typeMap[type] || '未知'
}

/**
 * 编辑成功处理
 */
const handleEditSuccess = () => {
  fetchResourceList()
  fetchResourceStats()
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchResourceList()
  fetchResourceStats()
  fetchOptions()
})
</script>

<style scoped lang="scss">
.resource-container {
  padding: 20px;

  .search-card,
  .toolbar-card,
  .stats-card,
  .table-card {
    margin-bottom: 20px;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  .stats-container {
    display: flex;
    gap: 40px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-color-primary);
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-top: 8px;
      }
    }
  }

  .resource-preview {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    .file-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      
      &.file-icon-document {
        background-color: #f56c6c20;
        color: #f56c6c;
      }
      
      &.file-icon-video {
        background-color: #e6a23c20;
        color: #e6a23c;
      }
      
      &.file-icon-audio {
        background-color: #90939920;
        color: #909399;
      }
      
      &.file-icon-other {
        background-color: #67c23a20;
        color: #67c23a;
      }
    }
  }

  .resource-name {
    .name {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .original-name {
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-top: 2px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 