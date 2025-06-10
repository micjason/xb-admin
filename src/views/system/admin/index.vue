<template>
  <div class="admin-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>管理员管理</h2>
      <p>管理系统管理员账户、角色分配和权限控制</p>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入用户名、昵称、邮箱或手机号"
            style="width: 250px"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" style="width: 120px" clearable>
            <el-option label="启用" :value="AdminStatus.ENABLED" />
            <el-option label="禁用" :value="AdminStatus.DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.roleId" placeholder="选择角色" style="width: 150px" clearable>
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            value-format="YYYY-MM-DD"
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

    <!-- 操作栏 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div class="table-actions">
          <el-button
            type="primary"
            @click="handleAdd"
            v-if="hasPermission('admin:create')"
          >
            <el-icon><Plus /></el-icon>
            新增管理员
          </el-button>
          <el-button
            type="danger"
            :disabled="!selectedRows.length"
            @click="handleBatchDelete"
            v-if="hasPermission('admin:delete')"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button
            @click="handleExport"
            v-if="hasPermission('admin:export')"
          >
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
        <div class="table-info">
          <span>共 {{ total }} 条记录</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120">
          <template #default="{ row }">
            {{ row.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              style="margin-right: 4px"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="!row.roles?.length">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === AdminStatus.ENABLED ? 'success' : 'danger'">
              {{ row.status === AdminStatus.ENABLED ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="150">
          <template #default="{ row }">
            {{ row.lastLoginTime ? formatTime(row.lastLoginTime) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="handleView(row)"
              v-if="hasPermission('admin:view')"
            >
              查看
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(row)"
              v-if="hasPermission('admin:edit')"
            >
              编辑
            </el-button>
            <el-dropdown @command="(command: string) => handleDropdownCommand(command, row)">
              <el-button size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    command="roles" 
                    v-if="hasPermission('admin:assign-roles')"
                  >
                    分配角色
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="resetPassword"
                    v-if="hasPermission('admin:reset-password')"
                  >
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="row.status === AdminStatus.ENABLED ? 'disable' : 'enable'"
                    v-if="hasPermission('admin:status')"
                  >
                    {{ row.status === AdminStatus.ENABLED ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="delete" 
                    style="color: #f56c6c"
                    v-if="hasPermission('admin:delete')"
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
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 管理员编辑对话框 -->
    <AdminEditDialog
      v-model="editDialogVisible"
      :admin-data="currentAdmin"
      :is-edit="isEdit"
      @success="handleEditSuccess"
    />

    <!-- 角色分配对话框 -->
    <AdminRoleDialog
      v-model="roleDialogVisible"
      :admin-data="currentAdmin"
      @success="handleRoleSuccess"
    />

    <!-- 密码重置对话框 -->
    <AdminPasswordDialog
      v-model="passwordDialogVisible"
      :admin-data="currentAdmin"
      @success="handlePasswordSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Search, 
  Refresh, 
  Plus, 
  Delete, 
  Download, 
  ArrowDown 
} from '@element-plus/icons-vue';
import { 
  getAdminList, 
  deleteAdmin, 
  updateAdminStatus, 
  batchDeleteAdmins,
  exportAdmins,
  getAllRoles
} from '@/api/admin';
import { hasPermission } from '@/utils/permission';
import { AdminStatus, type Admin, type AdminSearchForm, type AdminListQuery } from '@/types/admin';
import { formatTime } from '@/utils/format';
import AdminEditDialog from './components/AdminEditDialog.vue';
import AdminRoleDialog from './components/AdminRoleDialog.vue';
import AdminPasswordDialog from './components/AdminPasswordDialog.vue';



// 响应式数据
const loading = ref(false);
const tableData = ref<Admin[]>([]);
const total = ref(0);
const selectedRows = ref<Admin[]>([]);
const roleList = ref<Array<{ id: number; name: string }>>([]);

// 搜索表单
const searchForm = reactive<AdminSearchForm>({
  keyword: '',
  status: '',
  roleId: '',
  dateRange: []
});

// 查询参数
const queryParams = reactive<AdminListQuery>({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: undefined,
  roleId: undefined,
  sortBy: 'createTime',
  sortOrder: 'desc',
  startTime: '',
  endTime: ''
});

// 对话框状态
const editDialogVisible = ref(false);
const roleDialogVisible = ref(false);
const passwordDialogVisible = ref(false);
const currentAdmin = ref<Admin | null>(null);
const isEdit = ref(false);

// 计算属性

// 方法
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await getAdminList(queryParams);
    if (response.success && response.data) {
      tableData.value = response.data.list;
      total.value = response.data.total;
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    ElMessage.error('获取管理员列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const response = await getAllRoles();
    if (response.success && response.data) {
      roleList.value = response.data;
    }
  } catch (error) {
    console.error('获取角色列表失败:', error);
  }
};

const handleSearch = () => {
  // 更新查询参数
  queryParams.keyword = searchForm.keyword;
  queryParams.status = searchForm.status || undefined;
  queryParams.roleId = searchForm.roleId || undefined;
  
  if (searchForm.dateRange.length === 2) {
    queryParams.startTime = searchForm.dateRange[0];
    queryParams.endTime = searchForm.dateRange[1];
  } else {
    queryParams.startTime = '';
    queryParams.endTime = '';
  }
  
  queryParams.page = 1;
  fetchData();
};

const handleReset = () => {
  // 重置搜索表单
  searchForm.keyword = '';
  searchForm.status = '';
  searchForm.roleId = '';
  searchForm.dateRange = [];
  
  // 重置查询参数
  queryParams.keyword = '';
  queryParams.status = undefined;
  queryParams.roleId = undefined;
  queryParams.startTime = '';
  queryParams.endTime = '';
  queryParams.page = 1;
  
  fetchData();
};

const handleAdd = () => {
  currentAdmin.value = null;
  isEdit.value = false;
  editDialogVisible.value = true;
};

const handleView = (admin: Admin) => {
  currentAdmin.value = admin;
  isEdit.value = false;
  editDialogVisible.value = true;
};

const handleEdit = (admin: Admin) => {
  currentAdmin.value = admin;
  isEdit.value = true;
  editDialogVisible.value = true;
};

const handleDropdownCommand = async (command: string, admin: Admin) => {
  currentAdmin.value = admin;
  
  switch (command) {
    case 'roles':
      roleDialogVisible.value = true;
      break;
    case 'resetPassword':
      passwordDialogVisible.value = true;
      break;
    case 'enable':
    case 'disable':
      await handleStatusChange(admin, command === 'enable' ? AdminStatus.ENABLED : AdminStatus.DISABLED);
      break;
    case 'delete':
      await handleDelete(admin);
      break;
  }
};

const handleStatusChange = async (admin: Admin, status: AdminStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === AdminStatus.ENABLED ? '启用' : '禁用'}管理员"${admin.username}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await updateAdminStatus(admin.id, status);
    ElMessage.success(`${status === AdminStatus.ENABLED ? '启用' : '禁用'}成功`);
    fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改状态失败:', error);
      ElMessage.error('修改状态失败');
    }
  }
};

const handleDelete = async (admin: Admin) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除管理员"${admin.username}"吗？此操作不可恢复！`,
      '危险操作',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    );
    
    await deleteAdmin(admin.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleSelectionChange = (selection: Admin[]) => {
  selectedRows.value = selection;
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个管理员吗？此操作不可恢复！`,
      '批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    );
    
    const ids = selectedRows.value.map(item => item.id);
    await batchDeleteAdmins(ids);
    ElMessage.success('批量删除成功');
    fetchData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

const handleExport = async () => {
  try {
    const blob = await exportAdmins(queryParams);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `管理员数据_${new Date().getTime()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.page = 1;
  fetchData();
};

const handleCurrentChange = (page: number) => {
  queryParams.page = page;
  fetchData();
};

const handleEditSuccess = () => {
  editDialogVisible.value = false;
  fetchData();
};

const handleRoleSuccess = () => {
  roleDialogVisible.value = false;
  fetchData();
};

const handlePasswordSuccess = () => {
  passwordDialogVisible.value = false;
};

// 生命周期
onMounted(() => {
  fetchData();
  fetchRoles();
});
</script>

<style scoped lang="scss">
.admin-management {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      color: #303133;
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    p {
      color: #909399;
      font-size: 14px;
      margin: 0;
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    margin-bottom: 20px;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .table-actions {
        display: flex;
        gap: 8px;
      }

      .table-info {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style> 