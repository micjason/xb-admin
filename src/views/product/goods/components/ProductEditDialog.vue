<template>
  <el-dialog
    v-model="props.modelValue"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="loading"
    >
      <el-tabs v-model="activeTab" type="card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称" prop="name" required>
                <el-input
                  v-model="formData.name"
                  placeholder="请输入商品名称"
                  :disabled="isView"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品分类" prop="categoryId" required>
                <el-tree-select
                  v-model="formData.categoryId"
                  :data="categoryTree"
                  :props="treeProps"
                  placeholder="请选择商品分类"
                  check-strictly
                  :disabled="isView"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品SKU" prop="sku">
                <el-input
                  v-model="formData.sku"
                  placeholder="请输入商品SKU"
                  :disabled="isView"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序权重" prop="sort">
                <el-input-number
                  v-model="formData.sort"
                  :min="0"
                  placeholder="排序权重"
                  :disabled="isView"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入商品描述"
              :disabled="isView"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品状态" prop="status" required>
                <el-radio-group v-model="formData.status" :disabled="isView">
                  <el-radio :value="1">上架</el-radio>
                  <el-radio :value="0">下架</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <!-- 价格库存 -->
        <el-tab-pane label="价格库存" name="price">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="销售价格" prop="price" required>
                <el-input-number
                  v-model="formData.price"
                  :min="0"
                  :precision="2"
                  placeholder="销售价格"
                  :disabled="isView"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="原价" prop="originalPrice">
                <el-input-number
                  v-model="formData.originalPrice"
                  :min="0"
                  :precision="2"
                  placeholder="原价"
                  :disabled="isView"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="成本价" prop="cost">
                <el-input-number
                  v-model="formData.cost"
                  :min="0"
                  :precision="2"
                  placeholder="成本价"
                  :disabled="isView"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="库存数量" prop="stock" required>
                <el-input-number
                  v-model="formData.stock"
                  :min="0"
                  placeholder="库存数量"
                  :disabled="isView"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 销售数量字段为系统自动统计，不支持手动编辑 -->
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <!-- 商品图片 -->
        <el-tab-pane label="商品图片" name="images">
          <el-form-item label="商品图片" prop="images">
            <div class="image-upload-section">
              <!-- 上传模式选择 -->
              <div class="upload-modes" v-if="!isView">
                <el-button-group>
                  <el-button 
                    :type="uploadMode === 'upload' ? 'primary' : 'default'"
                    @click="uploadMode = 'upload'"
                  >
                    直接上传
                  </el-button>
                  <el-button 
                    :type="uploadMode === 'select' ? 'primary' : 'default'"
                    @click="uploadMode = 'select'"
                  >
                    从图片库选择
                  </el-button>
                </el-button-group>
              </div>

              <!-- 上传模式 -->
              <div v-if="uploadMode === 'upload'" class="upload-mode">
                <ImageUpload
                  v-model="formData.images"
                  :max-count="9"
                  :max-size="5 * 1024 * 1024"
                  :disabled="isView"
                  @success="handleImageUploadSuccess"
                  @error="handleImageUploadError"
                />
              </div>

              <!-- 选择模式 -->
              <div v-else-if="uploadMode === 'select'" class="select-mode">
                <div class="selected-images" v-if="formData.images && formData.images.length > 0">
                  <div class="image-list">
                    <div 
                      v-for="(imageUrl, index) in formData.images" 
                      :key="index"
                      class="selected-image-item"
                    >
                      <el-image
                        :src="imageUrl"
                        fit="cover"
                        class="image-preview"
                      />
                      <div class="image-actions" v-if="!isView">
                        <el-button
                          type="danger"
                          :icon="Delete"
                          circle
                          size="small"
                          @click="removeSelectedImage(index)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <el-button 
                  v-if="!isView"
                  type="primary" 
                  @click="openImageSelector"
                  style="margin-top: 12px"
                >
                  选择图片 ({{ formData.images?.length || 0 }}/9)
                </el-button>
              </div>

              <!-- 查看模式 -->
              <div v-if="isView && formData.images && formData.images.length > 0" class="view-mode">
                <div class="image-list">
                  <div 
                    v-for="(imageUrl, index) in formData.images" 
                    :key="index"
                    class="view-image-item"
                  >
                    <el-image
                      :src="imageUrl"
                      fit="cover"
                      class="image-preview"
                      :preview-src-list="formData.images"
                      :initial-index="index"
                      preview-teleported
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-tab-pane>
        
        <!-- 商品标签 -->
        <el-tab-pane label="商品标签" name="tags">
          <el-form-item label="商品标签" prop="tags">
            <el-tag
              v-for="(tag, index) in (formData.tags || [])"
              :key="index"
              :closable="!isView"
              @close="removeTag(index)"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="tagInputVisible && !isView"
              ref="tagInputRef"
              v-model="tagInputValue"
              class="tag-input"
              size="small"
              @keyup.enter="handleTagInputConfirm"
              @blur="handleTagInputConfirm"
            />
            <el-button
              v-else-if="!isView"
              class="button-new-tag"
              size="small"
              @click="showTagInput"
            >
              + 新标签
            </el-button>
          </el-form-item>
        </el-tab-pane>
        
        <!-- SEO信息 -->
        <el-tab-pane label="SEO信息" name="seo">
          <el-form-item label="SEO标题" prop="seoTitle">
            <el-input
              v-model="formData.seoTitle"
              placeholder="请输入SEO标题"
              :disabled="isView"
              maxlength="100"
            />
          </el-form-item>
          
          <el-form-item label="SEO关键词" prop="seoKeywords">
            <el-input
              v-model="formData.seoKeywords"
              placeholder="请输入SEO关键词，多个关键词用逗号分隔"
              :disabled="isView"
              maxlength="200"
            />
          </el-form-item>
          
          <el-form-item label="SEO描述" prop="seoDescription">
            <el-input
              v-model="formData.seoDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入SEO描述"
              :disabled="isView"
              maxlength="300"
            />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    
    <template #footer v-if="!isView">
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 图片选择器 -->
  <ImageSelector
    v-model="imageSelectorVisible"
    :selected-urls="formData.images || []"
    :max-count="9"
    @confirm="handleImageSelectorConfirm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { createProduct, updateProduct } from '@/api/product'
import { getCategoryTree } from '@/api/category'
import ImageUpload from '@/components/ImageUpload.vue'
import ImageSelector from '@/components/ImageSelector.vue'
import type { ImageItem } from '@/components/ImageUpload.vue'
import type { Product, ProductForm } from '@/types/product'

interface Props {
  modelValue: boolean
  productData?: Product | null
  isEdit?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  productData: null,
  isEdit: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const tagInputRef = ref()
const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('basic')
const categoryTree = ref<any[]>([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const uploadMode = ref('upload')
const imageSelectorVisible = ref(false)

// 树形选择器配置
const treeProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 表单数据
const formData = reactive<ProductForm & { id?: string }>({
  name: '',
  categoryId: '',
  sku: '',
  price: 0,
  originalPrice: 0,
  cost: 0,
  stock: 0,
  description: '',
  images: [],
  status: 1,
  sort: 0,
  tags: [],
  seoTitle: '',
  seoKeywords: '',
  seoDescription: ''
})

// 计算属性
const dialogTitle = computed(() => {
  if (isView.value) return '查看商品'
  return props.isEdit ? '编辑商品' : '新增商品'
})

const isView = computed(() => !props.isEdit && !!props.productData)

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 100, message: '商品名称长度为1-100个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  sku: [
    { max: 50, message: 'SKU长度不能超过50个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入销售价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '销售价格必须大于0', trigger: 'blur' }
  ],
  originalPrice: [
    { type: 'number', min: 0, message: '原价不能小于0', trigger: 'blur' }
  ],
  cost: [
    { type: 'number', min: 0, message: '成本价不能小于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ],
  description: [
    { max: 1000, message: '描述长度不能超过1000个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择商品状态', trigger: 'change' }
  ]
}

// 方法
const fetchCategoryTree = async () => {
  try {
    const response = await getCategoryTree({ status: 1 })
    if (response.success) {
      categoryTree.value = response.data
    }
  } catch (error) {
    console.error('获取分类树失败:', error)
  }
}

const initFormData = () => {
  if (props.productData) {
    // 编辑或查看模式
    formData.id = props.productData.id
    formData.name = props.productData.name
    formData.categoryId = props.productData.categoryId
    formData.sku = props.productData.sku || ''
    formData.price = props.productData.price || 0
    formData.originalPrice = props.productData.originalPrice || 0
    formData.cost = props.productData.cost || 0
    formData.stock = props.productData.stock || 0
    formData.description = props.productData.description || ''
    formData.images = props.productData.images || []
    formData.status = props.productData.status
    formData.sort = props.productData.sort || 0
    formData.tags = props.productData.tags || []
    formData.seoTitle = props.productData.seoTitle || ''
    formData.seoKeywords = props.productData.seoKeywords || ''
    formData.seoDescription = props.productData.seoDescription || ''
  } else {
    // 新增模式
    formData.id = undefined
    formData.name = ''
    formData.categoryId = ''
    formData.sku = ''
    formData.price = 0
    formData.originalPrice = 0
    formData.cost = 0
    formData.stock = 0
    formData.description = ''
    formData.images = []
    formData.status = 1
    formData.sort = 0
    formData.tags = []
    formData.seoTitle = ''
    formData.seoKeywords = ''
    formData.seoDescription = ''
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  activeTab.value = 'basic'
  uploadMode.value = 'upload'
  initFormData()
}

// 图片上传回调
const handleImageUploadSuccess = (file: ImageItem, fileList: ImageItem[]) => {
  console.log('图片上传成功:', file)
}

const handleImageUploadError = (error: any, file: ImageItem, fileList: ImageItem[]) => {
  console.error('图片上传失败:', error)
}

// 图片选择相关
const openImageSelector = () => {
  imageSelectorVisible.value = true
}

const handleImageSelectorConfirm = (selectedUrls: string[]) => {
  formData.images = selectedUrls
}

const removeSelectedImage = (index: number) => {
  if (formData.images) {
    formData.images.splice(index, 1)
  }
}

// 标签相关
const removeTag = (index: number) => {
  if (formData.tags) {
    formData.tags.splice(index, 1)
  }
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.input?.focus()
  })
}

const handleTagInputConfirm = () => {
  if (tagInputValue.value) {
    if (!formData.tags) formData.tags = []
    if (!formData.tags.includes(tagInputValue.value)) {
      formData.tags.push(tagInputValue.value)
    }
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

// Tab页面映射配置
const tabFieldMap = {
  basic: ['name', 'categoryId', 'sku', 'description', 'sort', 'status'],
  price: ['price', 'originalPrice', 'cost', 'stock'],
  images: ['images'],
  tags: ['tags'],
  seo: ['seoTitle', 'seoKeywords', 'seoDescription']
}

// 找到包含错误字段的tab页面
const findErrorTab = (errorFields: string[]) => {
  for (const [tabName, fields] of Object.entries(tabFieldMap)) {
    if (errorFields.some(field => fields.includes(field))) {
      return tabName
    }
  }
  return 'basic' // 默认返回基本信息页面
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 先执行表单验证，只有验证通过才继续
    const validationResult = await formRef.value.validate()
    if (!validationResult) {
      return // 验证失败，不执行后续操作
    }

    // 验证通过，开始提交
    submitting.value = true

    const submitData: ProductForm = {
      name: formData.name,
      categoryId: formData.categoryId,
      sku: formData.sku || undefined,
      price: formData.price,
      originalPrice: formData.originalPrice || undefined,
      cost: formData.cost || undefined,
      stock: formData.stock,
      description: formData.description || undefined,
      images: formData.images && formData.images.length ? formData.images : undefined,
      status: formData.status,
      sort: formData.sort,
      tags: formData.tags && formData.tags.length ? formData.tags : undefined,
      seoTitle: formData.seoTitle || undefined,
      seoKeywords: formData.seoKeywords || undefined,
      seoDescription: formData.seoDescription || undefined
    }

    if (props.isEdit && formData.id) {
      // 编辑模式
      await updateProduct(formData.id, submitData)
      ElMessage.success('更新成功')
    } else {
      // 新增模式
      await createProduct(submitData)
      ElMessage.success('创建成功')
    }

    emit('success')
  } catch (validationError) {
    // 处理表单验证错误
    if (validationError && typeof validationError === 'object') {
      const errorFields = Object.keys(validationError)
      const firstErrorField = errorFields[0]
      
      if (errorFields.length > 0) {
        // 切换到包含错误字段的tab页面
        const errorTab = findErrorTab(errorFields)
        activeTab.value = errorTab
        
        // 提取具体的错误信息
        const errorMessages: string[] = []
        for (const field in validationError) {
          const fieldErrors = (validationError as any)[field]
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach(error => {
              if (error && typeof error === 'object' && 'message' in error) {
                errorMessages.push(error.message as string)
              } else if (typeof error === 'string') {
                errorMessages.push(error)
              }
            })
          }
        }
        
        // 显示具体的错误信息
        const errorMsg = errorMessages.length > 0 ? errorMessages.join('；') : '表单验证失败，请检查输入信息'
        ElMessage({
          message: errorMsg,
          type: 'warning',
          duration: 5000,
          showClose: true
        })
        
        // 聚焦到第一个错误字段
        setTimeout(() => {
          const errorFieldElement = document.querySelector(`[data-field="${firstErrorField}"]`) ||
                                  document.querySelector(`input[name="${firstErrorField}"]`) ||
                                  document.querySelector(`textarea[name="${firstErrorField}"]`)
          if (errorFieldElement && 'focus' in errorFieldElement && typeof errorFieldElement.focus === 'function') {
            (errorFieldElement as HTMLElement).focus()
          }
        }, 300)
        
        return
      }
    }
    
    // 处理API调用错误（区分验证错误和网络错误）
    console.error('提交失败:', validationError)
    if (validationError && typeof validationError === 'object' && 'response' in validationError) {
      ElMessage.error('服务器错误，请稍后重试')
    } else {
      ElMessage.error('提交失败，请检查网络连接或联系管理员')
    }
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 监听器
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      initFormData()
      fetchCategoryTree()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}

.tag-input {
  width: 80px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.button-new-tag {
  margin-bottom: 8px;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-modes {
  margin-bottom: 12px;
}

.upload-mode {
  margin-bottom: 12px;
}

.select-mode {
  margin-bottom: 12px;
}

.selected-images {
  margin-bottom: 12px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.selected-image-item {
  position: relative;
  margin-right: 8px;
  margin-bottom: 8px;
}

.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px;
}

.view-mode {
  margin-bottom: 12px;
}

.view-image-item {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style> 