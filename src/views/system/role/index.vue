<template>
  <div class="role-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="输入角色名称或编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="RoleStatus.ENABLED" />
            <el-option label="禁用" :value="RoleStatus.DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
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
          <div class="table-title">角色列表</div>
          <div class="table-actions">
            <el-button 
              v-if="hasPermission('system:role:create')"
              type="primary" 
              @click="handleAdd"
            >
              <el-icon><Plus /></el-icon>
              新增角色
            </el-button>
            <el-button 
              v-if="hasPermission('system:role:delete')"
              type="danger" 
              :disabled="!selectedRows.length"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button 
              v-if="hasPermission('system:role:export')"
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
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column
          prop="name"
          label="角色名称"
          min-width="120"
          sortable="custom"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          label="角色编码"
          min-width="120"
          sortable="custom"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          label="描述"
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
            <el-tag :type="row.status === RoleStatus.ENABLED ? 'success' : 'danger'">
              {{ row.status === RoleStatus.ENABLED ? '启用' : '禁用' }}
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
         <el-table-column
           prop="updateTime"
           label="更新时间"
           width="160"
           sortable="custom"
         >
           <template #default="{ row }">
             {{ formatTime(row.updateTime) }}
           </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="hasPermission('system:role:view')"
              link 
              type="primary" 
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button 
              v-if="hasPermission('system:role:edit')"
              link 
              type="primary" 
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="hasPermission('system:role:permission')"
              link 
              type="primary" 
              size="small"
              @click="handleAssignPermissions(row)"
            >
              权限
            </el-button>
            <el-button 
              v-if="hasPermission('system:role:status')"
              link 
              :type="row.status === RoleStatus.ENABLED ? 'warning' : 'success'" 
              size="small"
              @click="handleStatusChange(row)"
            >
              {{ row.status === RoleStatus.ENABLED ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              v-if="hasPermission('system:role:delete')"
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

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 角色编辑对话框 -->
    <RoleEditDialog
      v-model="editDialog.visible"
      :mode="editDialog.mode"
      :role-data="editDialog.data"
      @success="handleEditSuccess"
    />

    <!-- 权限分配对话框 -->
    <RolePermissionDialog
      v-model="permissionDialog.visible"
      :role-data="permissionDialog.data"
      @success="handlePermissionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Download } from '@element-plus/icons-vue'
import {
  getRoleList,
  deleteRole,
  batchDeleteRoles,
  updateRoleStatus,
  exportRoles
} from '@/api/role'
import { useAuthStore } from '@/store/modules/auth'
import { formatTime } from '@/utils/format'
import { RoleStatus } from '@/types/role'
import type { 
  Role, 
  RoleSearchForm, 
  RoleListRequest 
} from '@/types/role'
import RoleEditDialog from './components/RoleEditDialog.vue'
import RolePermissionDialog from './components/RolePermissionDialog.vue'

// Store
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const tableData = ref<Role[]>([])
const selectedRows = ref<Role[]>([])

// 搜索表单
const searchForm = reactive<RoleSearchForm>({
  keyword: '',
  status: undefined,
  createTimeRange: undefined
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 排序数据
const sortData = reactive({
  orderBy: 'createTime',
  order: 'desc' as 'asc' | 'desc'
})

// 编辑对话框
const editDialog = reactive({
  visible: false,
  mode: 'add' as 'add' | 'edit' | 'view',
  data: null as Role | null
})

// 权限分配对话框
const permissionDialog = reactive({
  visible: false,
  data: null as Role | null
})

// 权限检查
const hasPermission = computed(() => authStore.hasPermission)

// 获取角色列表
const fetchRoleList = async () => {
  try {
    loading.value = true
    const params: RoleListRequest = {
      page: pagination.page,
      size: pagination.size,
      orderBy: sortData.orderBy,
      order: sortData.order
    }
    
    // 添加搜索条件
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }
    if (searchForm.status !== undefined) {
      params.status = searchForm.status
    }
    if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
      params.startTime = searchForm.createTimeRange[0]
      params.endTime = searchForm.createTimeRange[1]
    }

    const { data } = await getRoleList(params)
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRoleList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: undefined,
    createTimeRange: undefined
  })
  pagination.page = 1
  fetchRoleList()
}

// 新增角色
const handleAdd = () => {
  editDialog.mode = 'add'
  editDialog.data = null
  editDialog.visible = true
}

// 查看角色
const handleView = (row: Role) => {
  editDialog.mode = 'view'
  editDialog.data = row
  editDialog.visible = true
}

// 编辑角色
const handleEdit = (row: Role) => {
  editDialog.mode = 'edit'
  editDialog.data = row
  editDialog.visible = true
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    await fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要删除的角色')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个角色吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteRoles({ ids })
    ElMessage.success('批量删除成功')
    await fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除角色失败:', error)
      ElMessage.error('批量删除角色失败')
    }
  }
}

// 权限分配
const handleAssignPermissions = (row: Role) => {
  permissionDialog.data = row
  permissionDialog.visible = true
}

// 状态切换
const handleStatusChange = async (row: Role) => {
  const newStatus = row.status === RoleStatus.ENABLED ? RoleStatus.DISABLED : RoleStatus.ENABLED
  const statusText = newStatus === RoleStatus.ENABLED ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}角色"${row.name}"吗？`,
      '状态确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await updateRoleStatus({ id: row.id, status: newStatus })
    ElMessage.success(`${statusText}成功`)
    await fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新角色状态失败:', error)
      ElMessage.error('更新角色状态失败')
    }
  }
}

// 导出数据
const handleExport = async () => {
  try {
    const params = {
      keyword: searchForm.keyword,
      status: searchForm.status,
      startTime: searchForm.createTimeRange?.[0],
      endTime: searchForm.createTimeRange?.[1],
      format: 'excel' as const
    }
    
    const blob = await exportRoles(params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `角色数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

// 表格选择变化
const handleSelectionChange = (selection: Role[]) => {
  selectedRows.value = selection
}

// 表格排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (order) {
    sortData.orderBy = prop
    sortData.order = order === 'ascending' ? 'asc' : 'desc'
  } else {
    sortData.orderBy = 'createTime'
    sortData.order = 'desc'
  }
  fetchRoleList()
}

// 分页大小变化
const handlePageSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchRoleList()
}

// 当前页变化
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchRoleList()
}

// 编辑成功回调
const handleEditSuccess = () => {
  fetchRoleList()
}

// 权限分配成功回调
const handlePermissionSuccess = () => {
  ElMessage.success('权限分配成功')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped>
.role-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 600px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 