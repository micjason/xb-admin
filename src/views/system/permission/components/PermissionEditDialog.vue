<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="权限名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入权限名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限编码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入权限编码"
              maxlength="100"
              show-word-limit
            />
            <div class="form-tip">格式：system:user:list</div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="权限类型" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择权限类型"
              style="width: 100%"
              @change="handleTypeChange"
            >
              <el-option 
                label="菜单权限" 
                :value="PermissionType.MENU"
                :disabled="!!parentData && parentData.type === PermissionType.BUTTON"
              />
              <el-option label="按钮权限" :value="PermissionType.BUTTON" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上级权限" prop="parentId">
            <el-tree-select
              v-model="formData.parentId"
              :data="parentOptions"
              placeholder="请选择上级权限（可选）"
              clearable
              check-strictly
              :render-after-expand="false"
              style="width: 100%"
              node-key="id"
              :props="{ label: 'label', children: 'children' }"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 菜单权限特有字段 -->
      <template v-if="formData.type === PermissionType.MENU">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路由路径" prop="path">
              <el-input
                v-model="formData.path"
                placeholder="请输入路由路径"
                maxlength="200"
              />
              <div class="form-tip">格式：/system/user</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-select
                v-model="formData.component"
                placeholder="请选择组件路径"
                filterable
                allow-create
                style="width: 100%"
              >
                <el-option
                  v-for="comp in componentOptions"
                  :key="comp.value"
                  :label="comp.label"
                  :value="comp.value"
                />
              </el-select>
              <div class="form-tip">格式：@/views/system/user/index.vue</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <el-select
                v-model="formData.icon"
                placeholder="请选择菜单图标"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="icon in iconOptions"
                  :key="icon.value"
                  :label="icon.name"
                  :value="icon.value"
                >
                  <div class="icon-option">
                    <el-icon><component :is="icon.value" /></el-icon>
                    <span>{{ icon.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重定向" prop="redirect">
              <el-input
                v-model="formData.redirect"
                placeholder="请输入重定向路径（可选）"
                maxlength="200"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="菜单设置">
              <el-checkbox v-model="formData.hidden">隐藏菜单</el-checkbox>
              <el-checkbox v-model="formData.alwaysShow">总是显示</el-checkbox>
              <el-checkbox v-model="formData.breadcrumb">面包屑导航</el-checkbox>
              <el-checkbox v-model="formData.affix">固定标签</el-checkbox>
              <el-checkbox v-model="formData.noCache">不缓存</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="formData.hidden">
          <el-col :span="24">
            <el-form-item label="激活菜单" prop="activeMenu">
              <el-input
                v-model="formData.activeMenu"
                placeholder="请输入激活菜单路径"
                maxlength="200"
              />
              <div class="form-tip">隐藏菜单时，指定激活哪个菜单项</div>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="formData.sort"
              :min="0"
              :max="9999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="PermissionStatus.ENABLED">启用</el-radio>
              <el-radio :label="PermissionStatus.DISABLED">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入权限描述（可选）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          v-if="mode !== 'view'"
          type="primary" 
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template><script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Permission, PermissionForm, PermissionTreeNode, IconOption } from '@/types/permission'
import { PermissionType, PermissionStatus } from '@/types/permission'
import { 
  createPermission, 
  updatePermission, 
  checkPermissionCodeUnique,
  getPermissionTreeNodes,
  getIconOptions,
  getComponentOptions
} from '@/api/permission'

// 定义组件属性
interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  permissionData?: Permission | null
  parentData?: Permission | null
}

// 定义事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  permissionData: null,
  parentData: null
})

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 对话框标题
const dialogTitle = computed(() => {
  const titles = {
    add: '新增权限',
    edit: '编辑权限',
    view: '查看权限'
  }
  return titles[props.mode]
})

// 表单数据
const formData = reactive<PermissionForm>({
  name: '',
  code: '',
  type: PermissionType.MENU,
  parentId: undefined,
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: PermissionStatus.ENABLED,
  description: '',
  redirect: '',
  hidden: false,
  alwaysShow: false,
  breadcrumb: true,
  affix: false,
  noCache: false,
  activeMenu: ''
})

// 提交加载状态
const submitLoading = ref(false)

// 上级权限选项
const parentOptions = ref<PermissionTreeNode[]>([])

// 图标选项
const iconOptions = ref<IconOption[]>([])

// 组件选项
const componentOptions = ref<Array<{ value: string; label: string; path: string }>>([])

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 3, max: 100, message: '权限编码长度在 3 到 100 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9:_-]*$/, message: '权限编码格式不正确', trigger: 'blur' },
    { validator: validateCodeUnique, trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  path: [
    { validator: validatePath, trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值范围在 0 到 9999', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 验证权限编码唯一性
async function validateCodeUnique(rule: any, value: string, callback: any) {
  if (!value) {
    callback()
    return
  }

  try {
    const { data } = await checkPermissionCodeUnique({
      code: value,
      excludeId: props.mode === 'edit' ? props.permissionData?.id : undefined
    })
    
    if (!data) {
      callback(new Error('权限编码已存在'))
    } else {
      callback()
    }
  } catch (error) {
    console.error('验证权限编码失败:', error)
    callback()
  }
}

// 验证路径格式
function validatePath(rule: any, value: string, callback: any) {
  if (!value) {
    callback()
    return
  }

  if (formData.type === PermissionType.MENU) {
    if (!value.startsWith('/')) {
      callback(new Error('菜单路径必须以 / 开头'))
      return
    }
  }

  callback()
}

// 权限类型变更处理
const handleTypeChange = (type: PermissionType) => {
  if (type === PermissionType.BUTTON) {
    // 按钮权限清空菜单相关字段
    formData.path = ''
    formData.component = ''
    formData.icon = ''
    formData.redirect = ''
    formData.hidden = false
    formData.alwaysShow = false
    formData.breadcrumb = true
    formData.affix = false
    formData.noCache = false
    formData.activeMenu = ''
  }
}

// 获取上级权限选项
const getParentOptions = async () => {
  try {
    let params: any = { status: PermissionStatus.ENABLED }
    
    // 如果是按钮权限，只能选择菜单作为父级
    if (formData.type === PermissionType.BUTTON) {
      params.type = PermissionType.MENU
    }
    
    const { data } = await getPermissionTreeNodes(params)
    
    // 如果是编辑模式，过滤掉自己和子级
    if (props.mode === 'edit' && props.permissionData) {
      const filterSelfAndChildren = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
        return nodes.filter(node => {
          if (node.id === props.permissionData!.id) {
            return false
          }
          if (node.children) {
            node.children = filterSelfAndChildren(node.children)
          }
          return true
        })
      }
      parentOptions.value = filterSelfAndChildren(data)
    } else {
      parentOptions.value = data
    }
  } catch (error) {
    console.error('获取上级权限选项失败:', error)
  }
}

// 获取图标选项
const getIconOptionsList = async () => {
  try {
    const { data } = await getIconOptions()
    iconOptions.value = data
  } catch (error) {
    console.error('获取图标选项失败:', error)
  }
}

// 获取组件选项
const getComponentOptionsList = async () => {
  try {
    const { data } = await getComponentOptions()
    componentOptions.value = data
  } catch (error) {
    console.error('获取组件选项失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    type: PermissionType.MENU,
    parentId: undefined,
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: PermissionStatus.ENABLED,
    description: '',
    redirect: '',
    hidden: false,
    alwaysShow: false,
    breadcrumb: true,
    affix: false,
    noCache: false,
    activeMenu: ''
  })
  
  // 如果有父级数据，设置父级ID
  if (props.parentData) {
    formData.parentId = props.parentData.id
    // 如果父级是按钮权限，当前权限只能是按钮权限
    if (props.parentData.type === PermissionType.BUTTON) {
      formData.type = PermissionType.BUTTON
    }
  }
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 填充表单数据
const fillForm = () => {
  if (props.permissionData) {
    const data = props.permissionData
    Object.assign(formData, {
      id: data.id,
      name: data.name,
      code: data.code,
      type: data.type,
      parentId: data.parentId,
      path: data.path || '',
      component: data.component || '',
      icon: data.icon || '',
      sort: data.sort,
      status: data.status,
      description: data.description || '',
      redirect: '', // 需要从meta中获取
      hidden: false, // 需要从meta中获取
      alwaysShow: false, // 需要从meta中获取
      breadcrumb: true, // 需要从meta中获取
      affix: false, // 需要从meta中获取
      noCache: false, // 需要从meta中获取
      activeMenu: '' // 需要从meta中获取
    })
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    const submitData = { ...formData }
    
    // 如果是按钮权限，清空菜单相关字段
    if (submitData.type === PermissionType.BUTTON) {
      delete submitData.path
      delete submitData.component
      delete submitData.icon
      delete submitData.redirect
      delete submitData.hidden
      delete submitData.alwaysShow
      delete submitData.breadcrumb
      delete submitData.affix
      delete submitData.noCache
      delete submitData.activeMenu
    }

    if (props.mode === 'add') {
      await createPermission(submitData)
      ElMessage.success('创建成功')
    } else if (props.mode === 'edit') {
      await updatePermission(submitData.id!, submitData)
      ElMessage.success('更新成功')
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 监听对话框可见性
watch(dialogVisible, (visible) => {
  if (visible) {
    resetForm()
    if (props.permissionData) {
      fillForm()
    }
    getParentOptions()
    getIconOptionsList()
    getComponentOptionsList()
  }
})

// 监听权限类型变化
watch(() => formData.type, () => {
  getParentOptions()
})
</script>

<style scoped lang="scss">
.form-tip {
  font-size: 12px;
  color: var(--el-color-info);
  margin-top: 5px;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>