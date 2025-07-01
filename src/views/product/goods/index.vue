<template>
  <div class="goods-management">
    <div class="search-card">
      <el-card>
        <el-form :model="queryForm" inline>
          <el-form-item label="商品名称:">
            <el-input 
              v-model="queryForm.keyword" 
              placeholder="请输入商品名称" 
              clearable 
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="商品分类:">
            <el-select v-model="queryForm.categoryId" placeholder="请选择分类" clearable style="width: 150px">
              <el-option 
                v-for="category in categoryOptions" 
                :key="category.value" 
                :label="category.label" 
                :value="category.value" 
              />
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
            <div class="header-actions">
              <el-button type="success" @click="handleBatchImport">
                <el-icon><Upload /></el-icon>
                批量导入
              </el-button>
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                新增商品
              </el-button>
            </div>
          </div>
        </template>

        <!-- 批量操作工具栏 -->
        <div class="batch-actions-bar" v-if="selectedRows.length > 0">
          <div class="selected-info">
            <span>已选择 {{ selectedRows.length }} 项</span>
            <el-button type="info" link @click="handleClearSelection">清空选择</el-button>
          </div>
          <div class="batch-actions">
            <el-dropdown @command="handleBatchCommand">
              <el-button type="warning">
                批量操作 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="status-online">批量上架</el-dropdown-item>
                  <el-dropdown-item command="status-offline">批量下架</el-dropdown-item>
                  <el-dropdown-item command="category">批量修改分类</el-dropdown-item>
                  <el-dropdown-item command="price">批量调整价格</el-dropdown-item>
                  <el-dropdown-item command="recommend">批量推荐设置</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <el-table 
          v-loading="loading" 
          :data="tableData" 
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="商品名称" min-width="200">
            <template #default="{ row }">
              <div class="product-info">
                <el-image 
                  v-if="row.primaryImage"
                  :src="row.primaryImage" 
                  style="width: 40px; height: 40px; margin-right: 8px;"
                  fit="cover"
                />
                <div>
                  <el-link type="primary" @click="handleViewDetail(row.id)">
                    {{ row.name }}
                  </el-link>
                  <div class="product-tags" v-if="hasRecommendTags(row)">
                    <el-tag v-if="row.isNew" size="small" type="success">新品</el-tag>
                    <el-tag v-if="row.isHot" size="small" type="danger">热销</el-tag>
                    <el-tag v-if="row.isFeatured" size="small" type="warning">精选</el-tag>
                    <el-tag v-if="row.isRecommended" size="small" type="primary">推荐</el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80">
            <template #default="{ row }">
              <span :class="{ 'low-stock': row.stock < 10 }">{{ row.stock }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="sales" label="销量" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="210">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="330" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleViewDetail(row.id)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="warning" link @click="handleRecommendSetting(row)">
                <el-icon><Star /></el-icon>
                推荐
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

    <!-- 商品编辑对话框 -->
    <ProductEditDialog
      v-model="dialogVisible"
      :product-data="editingProduct"
      :is-edit="isEdit"
      @success="handleDialogSuccess"
    />

    <!-- 批量修改分类对话框 -->
    <el-dialog v-model="batchCategoryVisible" title="批量修改分类" width="500px">
      <el-form :model="batchCategoryForm" label-width="100px">
        <el-form-item label="目标分类">
          <el-select v-model="batchCategoryForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option 
              v-for="category in categoryOptions" 
              :key="category.value" 
              :label="category.label" 
              :value="category.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选中商品">
          <span>{{ selectedRows.length }} 个商品</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchCategoryVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchCategorySubmit" :loading="batchLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量调整价格对话框 -->
    <el-dialog v-model="batchPriceVisible" title="批量调整价格" width="500px">
      <el-form :model="batchPriceForm" label-width="100px">
        <el-form-item label="调整方式">
          <el-radio-group v-model="batchPriceForm.adjustType">
            <el-radio value="fixed">设置固定价格</el-radio>
            <el-radio value="percentage">按百分比调整</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整值">
          <el-input-number 
            v-model="batchPriceForm.adjustValue" 
            :min="0" 
            :precision="2"
            :placeholder="batchPriceForm.adjustType === 'fixed' ? '输入固定价格' : '输入百分比(如10表示增加10%)'"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="选中商品">
          <span>{{ selectedRows.length }} 个商品</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchPriceVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchPriceSubmit" :loading="batchLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量推荐设置对话框 -->
    <el-dialog v-model="batchRecommendVisible" title="批量推荐设置" width="500px">
      <el-form :model="batchRecommendForm" label-width="100px">
        <el-form-item label="推荐商品">
          <el-switch v-model="batchRecommendForm.isRecommended" />
        </el-form-item>
        <el-form-item label="热销商品">
          <el-switch v-model="batchRecommendForm.isHot" />
        </el-form-item>
        <el-form-item label="精选商品">
          <el-switch v-model="batchRecommendForm.isFeatured" />
        </el-form-item>
        <el-form-item label="新品商品">
          <el-switch v-model="batchRecommendForm.isNew" />
        </el-form-item>
        <el-form-item label="选中商品">
          <span>{{ selectedRows.length }} 个商品</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchRecommendVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchRecommendSubmit" :loading="batchLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 单个商品推荐设置对话框 -->
    <el-dialog v-model="recommendVisible" title="推荐设置" width="500px">
      <el-form :model="recommendForm" label-width="100px">
        <el-form-item label="推荐商品">
          <el-switch v-model="recommendForm.isRecommended" />
        </el-form-item>
        <el-form-item label="热销商品">
          <el-switch v-model="recommendForm.isHot" />
        </el-form-item>
        <el-form-item label="精选商品">
          <el-switch v-model="recommendForm.isFeatured" />
        </el-form-item>
        <el-form-item label="新品商品">
          <el-switch v-model="recommendForm.isNew" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recommendVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRecommendSubmit" :loading="recommendLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="batchImportVisible" title="批量导入商品" width="600px">
      <div class="import-container">
        <!-- 模板下载区域 -->
        <div class="template-section">
          <h4>第一步：下载导入模板</h4>
          <p class="section-desc">请先下载Excel模板，在模板中填写商品信息后重新上传</p>
          <el-button type="primary" @click="handleDownloadTemplate">
            <el-icon><Download /></el-icon>
            下载Excel模板
          </el-button>
        </div>

        <el-divider />

        <!-- 文件上传区域 -->
        <div class="upload-section">
          <h4>第二步：上传填写好的Excel文件</h4>
          <p class="section-desc">支持.xlsx格式，文件大小不超过10MB</p>
          
          <el-upload
            ref="uploadRef"
            class="upload-area"
            :show-file-list="true"
            :auto-upload="false"
            accept=".xlsx"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将Excel文件拖拽到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传.xlsx文件，且不超过10MB
              </div>
            </template>
          </el-upload>
        </div>

        <!-- 导入说明 -->
        <div class="tips-section">
          <h4>导入说明：</h4>
          <ul class="tips-list">
            <li>* 标记的字段为必填项</li>
            <li>SKU留空将自动生成</li>
            <li>标签用逗号分隔多个标签</li>
            <li>图片地址留空将根据商品名称匹配系统图片库</li>
            <li>分类名称必须在系统中存在</li>
            <li>价格必须为数字格式</li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchImportVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleImportSubmit" 
            :loading="importLoading"
            :disabled="!selectedFile"
          >
            开始导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="importResultVisible" title="导入结果" width="700px">
      <div class="import-result">
        <div class="result-summary">
          <el-tag type="info" size="large">总计：{{ importResult.total }}</el-tag>
          <el-tag type="success" size="large">成功：{{ importResult.success }}</el-tag>
          <el-tag type="danger" size="large">失败：{{ importResult.failed }}</el-tag>
          <el-tag v-if="importResult.warnings?.length" type="warning" size="large">
            警告：{{ importResult.warnings.length }}
          </el-tag>
        </div>
        
        <!-- 错误详情 -->
        <div v-if="importResult.errors?.length" class="error-section">
          <h4>错误详情：</h4>
          <el-table :data="importResult.errors" style="width: 100%" max-height="300">
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="field" label="字段" width="120" />
            <el-table-column prop="message" label="错误信息" />
          </el-table>
        </div>

        <!-- 警告详情 -->
        <div v-if="importResult.warnings?.length" class="warning-section">
          <h4>警告详情：</h4>
          <el-table :data="importResult.warnings" style="width: 100%" max-height="200">
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="field" label="字段" width="120" />
            <el-table-column prop="message" label="警告信息" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="handleImportResultClose">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, Plus, Edit, Delete, Switch, View, Star, ArrowDown, Upload, Download, UploadFilled 
} from '@element-plus/icons-vue'
import { 
  getProductList,
  deleteProduct,
  updateProductStatus,
  updateProductRecommend,
  batchUpdateProductStatus,
  batchUpdateProductCategory,
  batchAdjustProductPrice,
  batchUpdateProductRecommend,
  batchDeleteProducts,
  getProductById,
  downloadImportTemplate,
  importProducts
} from '@/api/product'
import { getCategoryOptions } from '@/api/category'
import { getToken } from '@/utils/token'
import type { Product, ProductListRequest } from '@/types/product'
import type { CategoryOption } from '@/types/category'
import ProductEditDialog from './components/ProductEditDialog.vue'
import { formatDate } from '@/utils/date'

const router = useRouter()
const route = useRoute()

// 查询表单
const queryForm = ref<ProductListRequest>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryId: '',
  status: undefined
})

// 表格数据
const tableData = ref<Product[]>([])
const loading = ref(false)
const categoryOptions = ref<CategoryOption[]>([])

// 批量选择
const selectedRows = ref<Product[]>([])

// 对话框状态
const dialogVisible = ref(false)
const editingProduct = ref<Product | null>(null)
const isEdit = ref(false)

// 批量操作对话框
const batchCategoryVisible = ref(false)
const batchPriceVisible = ref(false)
const batchRecommendVisible = ref(false)
const batchLoading = ref(false)

// 推荐设置对话框
const recommendVisible = ref(false)
const recommendLoading = ref(false)
const currentRecommendProduct = ref<Product | null>(null)

// 批量导入对话框
const batchImportVisible = ref(false)
const importLoading = ref(false)
const selectedFile = ref<File | null>(null)
const uploadRef = ref()
const importResultVisible = ref(false)
const importResult = ref({
  total: 0,
  success: 0,
  failed: 0,
  errors: [] as Array<{ row: number; field: string; message: string }>,
  warnings: [] as Array<{ row: number; field: string; message: string }>
})

// 批量操作表单
const batchCategoryForm = ref({
  categoryId: ''
})

const batchPriceForm = ref({
  adjustType: 'fixed' as 'fixed' | 'percentage',
  adjustValue: 0
})

const batchRecommendForm = ref({
  isRecommended: false,
  isHot: false,
  isFeatured: false,
  isNew: false
})

const recommendForm = ref({
  isRecommended: false,
  isHot: false,
  isFeatured: false,
  isNew: false
})

// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 批量选择变化
const handleSelectionChange = (selection: Product[]) => {
  selectedRows.value = selection
}

// 清空选择
const handleClearSelection = () => {
  selectedRows.value = []
}

// 批量操作命令
const handleBatchCommand = (command: string) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的商品')
    return
  }

  switch (command) {
    case 'status-online':
      handleBatchStatus(1)
      break
    case 'status-offline':
      handleBatchStatus(0)
      break
    case 'category':
      batchCategoryVisible.value = true
      break
    case 'price':
      batchPriceVisible.value = true
      break
    case 'recommend':
      batchRecommendVisible.value = true
      break
    case 'delete':
      handleBatchDelete()
      break
  }
}

// 批量状态更新
const handleBatchStatus = async (status: number) => {
  const action = status === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}选中的 ${selectedRows.value.length} 个商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(item => item.id)
    const response = await batchUpdateProductStatus({ ids, status })
    if (response.success) {
      ElMessage.success(`${action}成功`)
      handleClearSelection()
      loadData()
    } else {
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量状态更新失败:', error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 批量分类提交
const handleBatchCategorySubmit = async () => {
  if (!batchCategoryForm.value.categoryId) {
    ElMessage.warning('请选择目标分类')
    return
  }

  batchLoading.value = true
  try {
    const ids = selectedRows.value.map(item => item.id)
    const response = await batchUpdateProductCategory(ids, batchCategoryForm.value.categoryId)
    if (response.success) {
      ElMessage.success('批量修改分类成功')
      batchCategoryVisible.value = false
      handleClearSelection()
      loadData()
    } else {
      ElMessage.error(response.message || '批量修改分类失败')
    }
  } catch (error) {
    console.error('批量修改分类失败:', error)
    ElMessage.error('批量修改分类失败')
  } finally {
    batchLoading.value = false
  }
}

// 批量价格提交
const handleBatchPriceSubmit = async () => {
  if (!batchPriceForm.value.adjustValue || batchPriceForm.value.adjustValue <= 0) {
    ElMessage.warning('请输入有效的调整值')
    return
  }

  batchLoading.value = true
  try {
    const ids = selectedRows.value.map(item => item.id)
    const response = await batchAdjustProductPrice(
      ids, 
      batchPriceForm.value.adjustType, 
      batchPriceForm.value.adjustValue
    )
    if (response.success) {
      ElMessage.success('批量调整价格成功')
      batchPriceVisible.value = false
      handleClearSelection()
      loadData()
    } else {
      ElMessage.error(response.message || '批量调整价格失败')
    }
  } catch (error) {
    console.error('批量调整价格失败:', error)
    ElMessage.error('批量调整价格失败')
  } finally {
    batchLoading.value = false
  }
}

// 批量推荐提交
const handleBatchRecommendSubmit = async () => {
  batchLoading.value = true
  try {
    const ids = selectedRows.value.map(item => item.id)
    const response = await batchUpdateProductRecommend(ids, batchRecommendForm.value)
    if (response.success) {
      ElMessage.success('批量推荐设置成功')
      batchRecommendVisible.value = false
      handleClearSelection()
      loadData()
    } else {
      ElMessage.error(response.message || '批量推荐设置失败')
    }
  } catch (error) {
    console.error('批量推荐设置失败:', error)
    ElMessage.error('批量推荐设置失败')
  } finally {
    batchLoading.value = false
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个商品吗？删除后不可恢复！`, 
      '提示', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedRows.value.map(item => item.id)
    const response = await batchDeleteProducts(ids)
    if (response.success) {
      ElMessage.success('批量删除成功')
      handleClearSelection()
      loadData()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 查看详情
const handleViewDetail = (id: string) => {
  router.push(`/product/goods/${id}`)
}

// 推荐设置
const handleRecommendSetting = (row: Product) => {
  currentRecommendProduct.value = row
  recommendForm.value = {
    isRecommended: row.isRecommended,
    isHot: row.isHot,
    isFeatured: row.isFeatured,
    isNew: row.isNew
  }
  recommendVisible.value = true
}

// 保存推荐设置
const handleRecommendSubmit = async () => {
  if (!currentRecommendProduct.value) return

  recommendLoading.value = true
  try {
    const response = await updateProductRecommend(
      currentRecommendProduct.value.id, 
      recommendForm.value
    )
    if (response.success) {
      ElMessage.success('推荐设置更新成功')
      recommendVisible.value = false
      loadData()
    } else {
      ElMessage.error(response.message || '推荐设置更新失败')
    }
  } catch (error) {
    console.error('推荐设置更新失败:', error)
    ElMessage.error('推荐设置更新失败')
  } finally {
    recommendLoading.value = false
  }
}

// 检查是否有推荐标签
const hasRecommendTags = (product: Product) => {
  return product.isNew || product.isHot || product.isFeatured || product.isRecommended
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  queryForm.value.pageNum = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    categoryId: '',
    status: undefined
  }
  pagination.value.page = 1
  loadData()
}

// 新增
const handleAdd = () => {
  editingProduct.value = null
  isEdit.value = false
  dialogVisible.value = true
}

// 批量导入
const handleBatchImport = () => {
  batchImportVisible.value = true
}

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    // 检查用户登录状态
    const token = getToken()
    if (!token) {
      ElMessage.error('请先登录后再下载模板')
      return
    }

    // 显示下载进度
    const loadingMessage = ElMessage({
      message: '正在生成Excel模板，请稍候...',
      type: 'info',
      duration: 0
    })

    const response = await downloadImportTemplate()
    
    // 关闭loading消息
    loadingMessage.close()
    
    // 获取blob数据（downloadImportTemplate返回的是AxiosResponse对象）
    const blob = (response as any).data || response
    
    // 检查响应是否为有效的blob
    if (!(blob instanceof Blob)) {
      console.error('响应不是有效的Blob对象:', blob)
      ElMessage.error('下载失败，服务器响应异常')
      return
    }
    
    // 检查blob大小，如果太小可能是错误响应
    if (blob.size < 1000) {
      try {
        // 使用克隆的blob来检查内容，避免消费原始blob
        const clonedBlob = blob.slice()
        const text = await clonedBlob.text()
        const errorData = JSON.parse(text)
        
        // 如果是认证错误，特殊处理
        if (errorData.error === 'token无效或已过期') {
          ElMessageBox.confirm('登录状态已过期，请重新登录', '系统提示', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            window.location.reload()
          })
          return
        }
        
        // 其他错误
        ElMessage.error(errorData.message || errorData.error || '下载失败')
        return
      } catch (parseError) {
        // 如果解析失败，说明可能是正常的小文件，继续处理
        console.warn('无法解析响应内容，继续作为Excel文件处理')
      }
    }
    
    // 使用正确的blob对象创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `商品导入模板_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    
    // 根据错误类型提供更友好的提示
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('登录已过期') || errorMessage.includes('token无效')) {
      ElMessageBox.confirm('登录状态已过期，请重新登录后重试', '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        window.location.reload()
      })
    } else if (errorMessage.includes('网络')) {
      ElMessage.error('网络连接异常，请检查网络后重试')
    } else {
      ElMessage.error('下载模板失败，请稍后重试')
    }
  }
}

// 文件选择变化
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

// 文件移除
const handleFileRemove = () => {
  selectedFile.value = null
}

// 导入提交
const handleImportSubmit = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的Excel文件')
    return
  }

  // 检查用户登录状态
  const token = getToken()
  if (!token) {
    ElMessage.error('请先登录后再执行导入操作')
    return
  }

  // 文件大小检查
  if (selectedFile.value.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB，请重新选择文件')
    return
  }

  importLoading.value = true
  try {
    const response = await importProducts(selectedFile.value)
    if (response.success) {
      importResult.value = response.data
      importResultVisible.value = true
      batchImportVisible.value = false
      
      // 重置文件选择
      selectedFile.value = null
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
      
      // 如果有成功导入的数据，刷新列表
      if (response.data.success > 0) {
        loadData()
      }
      
      ElMessage.success(`导入完成，成功${response.data.success}条，失败${response.data.failed}条`)
    } else {
      ElMessage.error(response.message || '导入失败，请检查数据格式')
    }
  } catch (error) {
    console.error('导入失败:', error)
    
    // 根据错误类型提供更友好的提示
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('登录已过期') || errorMessage.includes('token无效')) {
      ElMessageBox.confirm('登录状态已过期，请重新登录后重试', '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        window.location.reload()
      })
    } else if (errorMessage.includes('网络')) {
      ElMessage.error('网络连接异常，请检查网络连接后重试')
    } else if (errorMessage.includes('文件格式') || errorMessage.includes('Excel')) {
      ElMessage.error('文件格式错误，请确保上传的是正确的Excel文件(.xlsx格式)')
    } else if (errorMessage.includes('文件大小')) {
      ElMessage.error('文件大小超出限制，请选择小于10MB的文件')
    } else {
      ElMessage.error('导入失败，请检查文件格式和数据内容后重试')
    }
  } finally {
    importLoading.value = false
  }
}

// 关闭导入结果对话框
const handleImportResultClose = () => {
  importResultVisible.value = false
  // 重置导入结果
  importResult.value = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
    warnings: []
  }
}

// 编辑
const handleEdit = (row: Product) => {
  editingProduct.value = row
  isEdit.value = true
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row: Product) => {
  const action = row.status === 1 ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定要${action}该商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const newStatus = row.status === 1 ? 0 : 1
    const response = await updateProductStatus(row.id, { status: newStatus })
    if (response.success) {
      ElMessage.success(`${action}成功`)
      loadData()
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

// 删除
const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？删除后不可恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteProduct(row.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除失败')
    }
  }
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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const response = await getProductList(queryForm.value)
    if (response.success) {
      tableData.value = response.data.list
      pagination.value.total = response.data.total
      pagination.value.page = response.data.pageNum
      pagination.value.size = response.data.pageSize
    } else {
      ElMessage.error(response.message || '获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类选项
const loadCategoryOptions = async () => {
  try {
    const response = await getCategoryOptions({ status: 1 })
    if (response.success) {
      categoryOptions.value = response.data
    }
  } catch (error) {
    console.error('获取分类选项失败:', error)
  }
}

// 对话框成功回调
const handleDialogSuccess = () => {
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
  loadCategoryOptions()
  
  // 处理来自详情页面的编辑请求
  const editId = route.query.edit as string
  if (editId) {
    handleEditFromDetail(editId)
  }
})

// 处理来自详情页面的编辑请求
const handleEditFromDetail = async (productId: string) => {
  try {
    const response = await getProductById(productId)
    if (response.success) {
      editingProduct.value = response.data
      isEdit.value = true
      dialogVisible.value = true
      
      // 清除查询参数
      router.replace({ path: '/product/goods' })
    } else {
      ElMessage.error('获取商品信息失败')
    }
  } catch (error) {
    console.error('获取商品信息失败:', error)
    ElMessage.error('获取商品信息失败')
  }
}
</script>

<style scoped lang="scss">
.goods-management {
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
    }
  }

  .batch-actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-bottom: 16px;

    .selected-info {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #606266;
    }

    .batch-actions {
      display: flex;
      gap: 8px;
    }
  }

  .product-info {
    display: flex;
    align-items: center;

    .product-tags {
      margin-top: 4px;
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  .low-stock {
    color: #f56c6c;
    font-weight: bold;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}

.import-container {
  .template-section,
  .upload-section,
  .tips-section {
    margin-bottom: 20px;
  }

  .section-desc {
    color: #666;
    margin: 8px 0 16px 0;
    font-size: 14px;
  }

  .upload-area {
    width: 100%;
  }

  .tips-list {
    margin: 8px 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 6px;
      color: #666;
      font-size: 14px;
    }
  }
}

.import-result {
  .result-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .error-section,
  .warning-section {
    margin-top: 16px;
    
    h4 {
      margin-bottom: 12px;
      color: #303133;
    }
  }
}
</style> 