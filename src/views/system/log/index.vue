<template>
  <div class="log-management">
    <div class="search-card">
      <el-card>
        <el-form :model="queryForm" inline>
          <el-form-item label="操作人:">
            <el-input 
              v-model="queryForm.operator" 
              placeholder="请输入操作人" 
              clearable 
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="操作模块:">
            <el-select v-model="queryForm.module" placeholder="请选择模块" clearable style="width: 150px">
              <el-option label="系统管理" value="system" />
              <el-option label="商品管理" value="product" />
              <el-option label="订单管理" value="order" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作类型:">
            <el-select v-model="queryForm.action" placeholder="请选择类型" clearable style="width: 120px">
              <el-option label="新增" value="create" />
              <el-option label="修改" value="update" />
              <el-option label="删除" value="delete" />
              <el-option label="查询" value="query" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作时间:">
            <el-date-picker
              v-model="queryForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 350px"
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
    </div>

    <div class="table-card">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>操作日志列表</span>
            <el-button type="danger" @click="handleCleanLogs">
              <el-icon><Delete /></el-icon>
              清理日志
            </el-button>
          </div>
        </template>

        <el-table v-loading="loading" :data="tableData" style="width: 100%">
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="module" label="操作模块" width="120">
            <template #default="{ row }">
              <el-tag :type="getModuleTagType(row.module)">
                {{ getModuleName(row.module) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="操作类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getActionTagType(row.action)">
                {{ getActionName(row.action) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="操作描述" min-width="200" />
          <el-table-column prop="ip" label="IP地址" width="130" />
          <el-table-column prop="userAgent" label="用户代理" min-width="150" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="操作时间" width="180" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleViewDetail(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="操作日志详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="操作人">{{ detailDialog.data.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ getModuleName(detailDialog.data.module) }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ getActionName(detailDialog.data.action) }}</el-descriptions-item>
        <el-descriptions-item label="操作描述">{{ detailDialog.data.description }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailDialog.data.ip }}</el-descriptions-item>
        <el-descriptions-item label="用户代理">{{ detailDialog.data.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailDialog.data.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <pre>{{ detailDialog.data.params }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, View } from '@element-plus/icons-vue'

// 查询表单
const queryForm = ref({
  operator: '',
  module: '',
  action: '',
  dateRange: null as [string, string] | null
})

// 日志数据类型
interface LogItem {
  id: number
  operator: string
  module: string
  action: string
  description: string
  ip: string
  userAgent: string
  params: string
  createdAt: string
}

// 表格数据
const tableData = ref<LogItem[]>([])
const loading = ref(false)

// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 详情对话框
const detailDialog = ref({
  visible: false,
  data: {} as LogItem
})

// 获取模块名称
const getModuleName = (module: string) => {
  const moduleMap: Record<string, string> = {
    system: '系统管理',
    product: '商品管理',
    order: '订单管理'
  }
  return moduleMap[module] || module
}

// 获取操作名称
const getActionName = (action: string) => {
  const actionMap: Record<string, string> = {
    create: '新增',
    update: '修改',
    delete: '删除',
    query: '查询'
  }
  return actionMap[action] || action
}

// 获取模块标签类型
const getModuleTagType = (module: string) => {
  const typeMap: Record<string, string> = {
    system: 'primary',
    product: 'success',
    order: 'warning'
  }
  return typeMap[module] || 'info'
}

// 获取操作标签类型
const getActionTagType = (action: string) => {
  const typeMap: Record<string, string> = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    query: 'info'
  }
  return typeMap[action] || 'info'
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryForm.value = {
    operator: '',
    module: '',
    action: '',
    dateRange: null
  }
  pagination.value.page = 1
  loadData()
}

// 查看详情
const handleViewDetail = (row: LogItem) => {
  detailDialog.value.data = row
  detailDialog.value.visible = true
}

// 清理日志
const handleCleanLogs = () => {
  ElMessageBox.confirm('确定要清理所有日志吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('日志清理成功')
    loadData()
  })
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.value.size = size
  pagination.value.page = 1
  loadData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  loadData()
}

// 加载数据
const loadData = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        operator: 'admin',
        module: 'system',
        action: 'create',
        description: '新增管理员用户',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        params: '{"username":"test","email":"test@example.com"}',
        createdAt: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        operator: 'admin',
        module: 'product',
        action: 'update',
        description: '修改商品信息',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        params: '{"id":1,"name":"iPhone 15","price":7999}',
        createdAt: '2024-01-14 09:20:00'
      }
    ]
    pagination.value.total = 2
    loading.value = false
  }, 500)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.log-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin: 0;
}
</style> 