<template>
  <div class="permission-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="输入权限名称或编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 120px"
          >
            <el-option label="菜单" :value="PermissionType.MENU" />
            <el-option label="按钮" :value="PermissionType.BUTTON" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="PermissionStatus.ENABLED" />
            <el-option label="禁用" :value="PermissionStatus.DISABLED" />
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
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="table-title">权限列表</div>
          <div class="table-actions">
            <el-button 
              v-if="hasPermission('system:permission:create')"
              type="primary" 
              @click="handleAdd"
            >
              <el-icon><Plus /></el-icon>
              新增权限
            </el-button>
            <el-button 
              v-if="hasPermission('system:permission:delete')"
              type="danger" 
              :disabled="!selectedRows.length"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button 
              v-if="hasPermission('system:permission:sync')"
              type="warning"
              @click="handleSync"
            >
              <el-icon><Refresh /></el-icon>
              同步权限
            </el-button>
            <el-button 
              v-if="hasPermission('system:permission:export')"
              type="success"
              @click="handleExport"
            >
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column
          prop="name"
          label="权限名称"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="permission-name">
              <el-icon v-if="row.icon" class="permission-icon">
                <component :is="row.icon" />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="code"
          label="权限编码"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="type"
          label="类型"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.type === PermissionType.MENU ? 'primary' : 'success'">
              {{ row.type === PermissionType.MENU ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="path"
          label="路径"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="component"
          label="组件"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="status"
          label="状态"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === PermissionStatus.ENABLED ? 'success' : 'danger'">
              {{ row.status === PermissionStatus.ENABLED ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="sort"
          label="排序"
          width="80"
          align="center"
          sortable="custom"
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="160"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="hasPermission('system:permission:view')"
              link 
              type="primary" 
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button 
              v-if="hasPermission('system:permission:edit')"
              link 
              type="primary" 
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="hasPermission('system:permission:create') && row.type === PermissionType.MENU"
              link 
              type="primary" 
              size="small"
              @click="handleAddChild(row)"
            >
              新增子权限
            </el-button>
            <el-button 
              v-if="hasPermission('system:permission:status')"
              link 
              :type="row.status === PermissionStatus.ENABLED ? 'warning' : 'success'" 
              size="small"
              @click="handleStatusChange(row)"
            >
              {{ row.status === PermissionStatus.ENABLED ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              v-if="hasPermission('system:permission:delete')"
              link 
              type="danger" 
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限编辑对话框 -->
    <PermissionEditDialog
      v-model="editDialog.visible"
      :mode="editDialog.mode"
      :permission-data="editDialog.data"
      :parent-data="editDialog.parentData"
      @success="handleEditSuccess"
    />
  </div>
</template><script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Download } from '@element-plus/icons-vue'
import type { Permission, PermissionSearchForm, PermissionTreeNode } from '@/types/permission'
import { PermissionType, PermissionStatus } from '@/types/permission'
import { 
  getPermissionTree, 
  deletePermission, 
  batchDeletePermissions, 
  updatePermissionStatus,
  exportPermissions,
  syncPermissions,
  getPermissionTreeNodes
} from '@/api/permission'
import { formatTime } from '@/utils/date'
import { hasPermission } from '@/utils/permission'
import PermissionEditDialog from './components/PermissionEditDialog.vue'

// 搜索表单
const searchForm = reactive<PermissionSearchForm>({
  keyword: '',
  type: undefined,
  status: undefined,
  parentId: undefined
})

// 上级权限选项
const parentOptions = ref<PermissionTreeNode[]>([])

// 表格数据
const tableData = ref<Permission[]>([])
const loading = ref(false)
const selectedRows = ref<Permission[]>([])

// 编辑对话框
const editDialog = reactive({
  visible: false,
  mode: 'add' as 'add' | 'edit' | 'view',
  data: null as Permission | null,
  parentData: null as Permission | null
})

// 获取权限树数据
const getPermissionTreeData = async () => {
  try {
    loading.value = true
    const params = {
      keyword: searchForm.keyword || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status || undefined,
      parentId: searchForm.parentId || undefined
    }
    
    const { data } = await getPermissionTree(params)
    tableData.value = data
  } catch (error) {
    console.error('获取权限树失败:', error)
    ElMessage.error('获取权限树失败')
  } finally {
    loading.value = false
  }
}

// 获取上级权限选项
const getParentOptions = async () => {
  try {
    const { data } = await getPermissionTreeNodes({ type: PermissionType.MENU, status: PermissionStatus.ENABLED })
    parentOptions.value = data
  } catch (error) {
    console.error('获取上级权限选项失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  getPermissionTreeData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    type: undefined,
    status: undefined,
    parentId: undefined
  })
  getPermissionTreeData()
}

// 选择变更处理
const handleSelectionChange = (selection: Permission[]) => {
  selectedRows.value = selection
}

// 排序处理
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  // 这里可以根据需要实现排序逻辑
  console.log('排序:', prop, order)
}

// 新增权限
const handleAdd = () => {
  editDialog.mode = 'add'
  editDialog.data = null
  editDialog.parentData = null
  editDialog.visible = true
}

// 新增子权限
const handleAddChild = (parent: Permission) => {
  editDialog.mode = 'add'
  editDialog.data = null
  editDialog.parentData = parent
  editDialog.visible = true
}

// 查看权限
const handleView = (row: Permission) => {
  editDialog.mode = 'view'
  editDialog.data = row
  editDialog.parentData = null
  editDialog.visible = true
}

// 编辑权限
const handleEdit = (row: Permission) => {
  editDialog.mode = 'edit'
  editDialog.data = row
  editDialog.parentData = null
  editDialog.visible = true
}

// 编辑成功回调
const handleEditSuccess = () => {
  getPermissionTreeData()
}

// 状态变更
const handleStatusChange = async (row: Permission) => {
  const action = row.status === PermissionStatus.ENABLED ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}权限"${row.name}"吗？`,
      '状态变更确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const newStatus = row.status === PermissionStatus.ENABLED ? PermissionStatus.DISABLED : PermissionStatus.ENABLED
    await updatePermissionStatus({
      id: row.id,
      status: newStatus
    })

    ElMessage.success(`${action}成功`)
    getPermissionTreeData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}权限失败:`, error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 删除权限
const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限"${row.name}"吗？删除后不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    await deletePermission(row.id)
    ElMessage.success('删除成功')
    getPermissionTreeData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除权限失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的权限')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个权限吗？删除后不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    await batchDeletePermissions({ ids })
    
    ElMessage.success('批量删除成功')
    getPermissionTreeData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 同步权限
const handleSync = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要从代码中同步权限数据吗？这将会自动添加新权限并更新现有权限。',
      '同步权限确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const { data } = await syncPermissions()
    ElMessage.success(`同步完成：新增 ${data.added} 个，更新 ${data.updated} 个，移除 ${data.removed} 个`)
    getPermissionTreeData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同步权限失败:', error)
      ElMessage.error('同步权限失败')
    }
  }
}

// 导出数据
const handleExport = async () => {
  try {
    const params = {
      keyword: searchForm.keyword || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status || undefined,
      parentId: searchForm.parentId || undefined,
      format: 'excel' as const
    }

    const blob = await exportPermissions(params)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `权限数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    
    // 清理
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 组件挂载
onMounted(() => {
  getPermissionTreeData()
  getParentOptions()
})
</script>

<style scoped lang="scss">
.permission-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.permission-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-icon {
  color: var(--el-color-primary);
}
</style>