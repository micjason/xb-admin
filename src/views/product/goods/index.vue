<template>
  <div class="goods-management">
    <div class="search-card">
      <el-card>
        <el-form :model="queryForm" inline>
          <el-form-item label="商品名称:">
            <el-input 
              v-model="queryForm.name" 
              placeholder="请输入商品名称" 
              clearable 
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="商品分类:">
            <el-select v-model="queryForm.categoryId" placeholder="请选择分类" clearable style="width: 150px">
              <el-option label="电子产品" value="1" />
              <el-option label="服装鞋帽" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态:">
            <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="上架" value="1" />
              <el-option label="下架" value="0" />
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
    </div>

    <div class="table-card">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>商品列表</span>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增商品
            </el-button>
          </div>
        </template>

        <el-table v-loading="loading" :data="tableData" style="width: 100%">
          <el-table-column prop="name" label="商品名称" min-width="200" />
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80" />
          <el-table-column prop="sales" label="销量" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="warning" link @click="handleToggleStatus(row)">
                <el-icon><Switch /></el-icon>
                {{ row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Switch } from '@element-plus/icons-vue'

// 查询表单
const queryForm = ref({
  name: '',
  categoryId: '',
  status: ''
})

// 商品数据类型
interface GoodsItem {
  id: number
  name: string
  categoryName: string
  price: number
  stock: number
  sales: number
  status: number
  createdAt: string
}

// 表格数据
const tableData = ref<GoodsItem[]>([])
const loading = ref(false)

// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryForm.value = {
    name: '',
    categoryId: '',
    status: ''
  }
  pagination.value.page = 1
  loadData()
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增商品功能开发中...')
}

// 编辑
const handleEdit = (row: GoodsItem) => {
  ElMessage.info('编辑商品功能开发中...')
}

// 切换状态
const handleToggleStatus = (row: GoodsItem) => {
  const action = row.status === 1 ? '下架' : '上架'
  ElMessageBox.confirm(`确定要${action}该商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
    loadData()
  })
}

// 删除
const handleDelete = (row: GoodsItem) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
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
        name: 'iPhone 15 Pro',
        categoryName: '电子产品',
        price: 7999,
        stock: 100,
        sales: 50,
        status: 1,
        createdAt: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: '运动鞋',
        categoryName: '服装鞋帽',
        price: 299,
        stock: 200,
        sales: 120,
        status: 1,
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

<style scoped>
.goods-management {
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
</style> 