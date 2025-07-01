<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="loading"
    >
      <el-form-item label="分类名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入分类名称"
          :disabled="isView"
          maxlength="50"
        />
      </el-form-item>
      
      <el-form-item label="父分类" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="categoryTree"
          placeholder="请选择父分类（留空为顶级分类）"
          :props="treeProps"
          :disabled="isView"
          clearable
          check-strictly
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="分类描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入分类描述"
          :disabled="isView"
          maxlength="500"
        />
      </el-form-item>
      
      <el-form-item label="分类图标" prop="icon">
        <el-input
          v-model="formData.icon"
          placeholder="请输入图标类名或URL"
          :disabled="isView"
          maxlength="200"
        >
          <template #prepend>
            <el-icon v-if="formData.icon">
              <component :is="formData.icon" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="排序权重" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999999"
          placeholder="数字越小排序越靠前"
          :disabled="isView"
          style="width: 200px"
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status" required>
        <el-radio-group v-model="formData.status" :disabled="isView">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
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
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createCategory, updateCategory, getCategoryTree } from '@/api/category'
import type { Category, CategoryForm } from '@/types/category'

interface Props {
  modelValue: boolean
  categoryData?: Category | null
  parentCategory?: Category | null
  isEdit?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  categoryData: null,
  parentCategory: null,
  isEdit: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const categoryTree = ref<any[]>([])

// 树形选择器配置
const treeProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 表单数据
const formData = reactive<CategoryForm & { id?: string }>({
  name: '',
  parentId: null,
  description: '',
  icon: '',
  sort: 0,
  status: 1
})

// 计算属性
const dialogTitle = computed(() => {
  if (isView.value) return '查看分类'
  if (props.isEdit) return '编辑分类'
  if (props.parentCategory) return `添加子分类 - ${props.parentCategory.name}`
  return '新增分类'
})

const isView = computed(() => !props.isEdit && props.categoryData)

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度为1-50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ],
  icon: [
    { max: 200, message: '图标长度不能超过200个字符', trigger: 'blur' }
  ],
  sort: [
    { type: 'number', min: 0, max: 999999, message: '排序权重范围为0-999999', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 方法
const fetchCategoryTree = async () => {
  try {
    const response = await getCategoryTree({ status: 1 })
    if (response.success) {
      categoryTree.value = response.data
      
      // 如果是编辑模式，需要过滤掉当前分类及其子分类，避免循环引用
      if (props.isEdit && props.categoryData) {
        filterCurrentCategory(categoryTree.value, props.categoryData.id)
      }
    }
  } catch (error) {
    console.error('获取分类树失败:', error)
    ElMessage.error('获取分类树失败')
  }
}

// 过滤当前分类及其子分类（避免循环引用）
const filterCurrentCategory = (tree: any[], currentId: string): any[] => {
  return tree.filter(item => {
    if (item.id === currentId) {
      return false
    }
    if (item.children && item.children.length > 0) {
      item.children = filterCurrentCategory(item.children, currentId)
    }
    return true
  })
}

const initFormData = () => {
  if (props.categoryData) {
    // 编辑或查看模式
    formData.id = props.categoryData.id
    formData.name = props.categoryData.name
    formData.parentId = props.categoryData.parentId
    formData.description = props.categoryData.description || ''
    formData.icon = props.categoryData.icon || ''
    formData.sort = props.categoryData.sort || 0
    formData.status = props.categoryData.status
  } else {
    // 新增模式
    formData.id = undefined
    formData.name = ''
    // 如果有父分类，预设父分类ID
    formData.parentId = props.parentCategory ? props.parentCategory.id : null
    formData.description = ''
    formData.icon = ''
    formData.sort = 0
    formData.status = 1
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  initFormData()
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

    const submitData: CategoryForm = {
      name: formData.name,
      parentId: formData.parentId,
      description: formData.description || undefined,
      icon: formData.icon || undefined,
      sort: formData.sort,
      status: formData.status
    }

    if (props.isEdit && formData.id) {
      // 编辑模式
      await updateCategory(formData.id, submitData)
      ElMessage.success('更新成功')
    } else {
      // 新增模式
      await createCategory(submitData)
      ElMessage.success('创建成功')
    }

    emit('success')
  } catch (validationError) {
    // 处理表单验证错误
    if (validationError && typeof validationError === 'object') {
      const errorFields = Object.keys(validationError)
      
      if (errorFields.length > 0) {
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
        return
      }
    }
    
    // 处理API调用错误
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
</style> 