<template>
  <div class="category-management">
    <div class="search-card">
      <el-card>
        <el-form :model="queryForm" inline>
          <el-form-item label="分类名称:">
            <el-input 
              v-model="queryForm.keyword" 
              placeholder="请输入分类名称" 
              clearable 
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态:">
            <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
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
            <span>商品分类{{ isTreeView ? '树形' : '列表' }}</span>
            <div class="header-actions">
              <el-radio-group v-model="isTreeView" @change="handleViewChange">
                <el-radio-button :value="false">
                  <el-icon><List /></el-icon>
                  列表视图
                </el-radio-button>
                <el-radio-button :value="true">
                  <el-icon><Operation /></el-icon>
                  树形视图
                </el-radio-button>
              </el-radio-group>
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                新增分类
              </el-button>
            </div>
          </div>
        </template>

        <!-- 列表视图 -->
        <div v-if="!isTreeView">
          <el-table v-loading="loading" :data="tableData" style="width: 100%">
            <el-table-column prop="name" label="分类名称" min-width="150" />
            <el-table-column prop="parentName" label="上级分类" width="120">
              <template #default="{ row }">
                {{ row.parentName || '顶级分类' }}
              </template>
            </el-table-column>
            <el-table-column prop="level" label="层级" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ row.level }}级</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="{ row }">
                {{ row.createTime }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="success" link @click="handleAddChild(row)">
                  <el-icon><Plus /></el-icon>
                  添加子分类
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
        </div>

        <!-- 树形视图 -->
        <div v-else>
          <el-tree
            v-loading="treeLoading"
            :data="treeData"
            :props="treeProps"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            class="category-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <div class="node-content">
                  <el-icon class="category-icon">
                    <Folder v-if="data.children && data.children.length > 0" />
                    <Document v-else />
                  </el-icon>
                  <span class="node-label">{{ data.name }}</span>
                  <el-tag 
                    size="small" 
                    :type="data.status === 1 ? 'success' : 'danger'"
                    class="status-tag"
                  >
                    {{ data.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                  <span class="sort-info">排序: {{ data.sort }}</span>
                </div>
                <div class="node-actions">
                  <el-button type="primary" link size="small" @click="handleEdit(data)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="success" link size="small" @click="handleAddChild(data)">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button 
                    type="warning" 
                    link 
                    size="small" 
                    @click="handleToggleStatus(data)"
                  >
                    <el-icon><Switch /></el-icon>
                  </el-button>
                  <el-button type="danger" link size="small" @click="handleDelete(data)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </el-card>
    </div>

    <!-- 分类编辑对话框 -->
    <CategoryEditDialog
      v-model="dialogVisible"
      :category-data="editingCategory"
      :is-edit="isEdit"
      :parent-category="parentCategory"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, Plus, Edit, Delete, List, Operation, 
  Folder, Document, Switch 
} from '@element-plus/icons-vue'
import { 
  getCategoryList, 
  getCategoryTree, 
  deleteCategory, 
  updateCategoryStatus 
} from '@/api/category'
import type { Category, CategoryListRequest } from '@/types/category'
import CategoryEditDialog from './components/CategoryEditDialog.vue'

// 视图状态
const isTreeView = ref(false)

// 查询表单
const queryForm = ref<CategoryListRequest>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

// 表格数据
const tableData = ref<Category[]>([])
const loading = ref(false)

// 树形数据
const treeData = ref<Category[]>([])
const treeLoading = ref(false)
const treeProps = {
  children: 'children',
  label: 'name'
}

// 对话框状态
const dialogVisible = ref(false)
const editingCategory = ref<Category | null>(null)
const parentCategory = ref<Category | null>(null)
const isEdit = ref(false)

// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 视图切换
const handleViewChange = (treeView: boolean) => {
  if (treeView) {
    loadTreeData()
  } else {
    loadData()
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  queryForm.value.pageNum = 1
  if (isTreeView.value) {
    loadTreeData()
  } else {
    loadData()
  }
}

// 重置
const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: undefined
  }
  pagination.value.page = 1
  if (isTreeView.value) {
    loadTreeData()
  } else {
    loadData()
  }
}

// 新增
const handleAdd = () => {
  editingCategory.value = null
  parentCategory.value = null
  isEdit.value = false
  dialogVisible.value = true
}

// 添加子分类
const handleAddChild = (row: Category) => {
  editingCategory.value = null
  parentCategory.value = row
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Category) => {
  editingCategory.value = row
  parentCategory.value = null
  isEdit.value = true
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row: Category) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}该分类吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newStatus = row.status === 1 ? 0 : 1
    const response = await updateCategoryStatus(row.id, { status: newStatus })
    if (response.success) {
      ElMessage.success(`${action}成功`)
      if (isTreeView.value) {
        loadTreeData()
      } else {
        loadData()
      }
    } else {
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('状态切换失败:', error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 对话框成功回调
const handleDialogSuccess = () => {
  dialogVisible.value = false
  if (isTreeView.value) {
    loadTreeData()
  } else {
    loadData()
  }
}

// 删除
const handleDelete = (row: Category) => {
  ElMessageBox.confirm('确定要删除该分类吗？删除后不可恢复！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteCategory(row.id)
      if (response.success) {
        ElMessage.success('删除成功')
        if (isTreeView.value) {
          loadTreeData()
        } else {
          loadData()
        }
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除，不需要处理
  })
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.value.size = size
  pagination.value.page = 1
  queryForm.value.pageSize = size
  queryForm.value.pageNum = 1
  loadData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  queryForm.value.pageNum = page
  loadData()
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const response = await getCategoryList(queryForm.value)
    if (response.success) {
      tableData.value = response.data.list
      pagination.value.total = response.data.total
      pagination.value.page = response.data.pageNum
      pagination.value.size = response.data.pageSize
    } else {
      ElMessage.error(response.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 加载树形数据
const loadTreeData = async () => {
  treeLoading.value = true
  try {
    const params: any = {}
    if (queryForm.value.status !== undefined) {
      params.status = queryForm.value.status
    }
    
    const response = await getCategoryTree(params)
    if (response.success) {
      treeData.value = response.data
    } else {
      ElMessage.error(response.message || '获取分类树失败')
    }
  } catch (error) {
    console.error('获取分类树失败:', error)
    ElMessage.error('获取分类树失败')
  } finally {
    treeLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.category-management {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .category-tree {
    min-height: 400px;

    .tree-node {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;

      .node-content {
        display: flex;
        align-items: center;
        gap: 8px;

        .category-icon {
          color: #409EFF;
        }

        .node-label {
          font-weight: 500;
          color: #303133;
        }

        .status-tag {
          margin-left: 8px;
        }

        .sort-info {
          font-size: 12px;
          color: #909399;
          margin-left: 12px;
        }
      }

      .node-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .node-actions {
        opacity: 1;
      }
    }
  }
}
</style> 