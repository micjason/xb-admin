<template>
  <el-dialog
    v-model="visible"
    title="分配权限"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="permission-dialog-content">
      <div class="role-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="角色名称">
            {{ roleData?.name }}
          </el-descriptions-item>
          <el-descriptions-item label="角色编码">
            {{ roleData?.code }}
          </el-descriptions-item>
          <el-descriptions-item label="角色描述" :span="2">
            {{ roleData?.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="permission-tree-container">
        <div class="tree-header">
          <h4>权限配置</h4>
          <div class="tree-actions">
            <el-button size="small" @click="handleExpandAll">
              {{ isExpandAll ? '收起全部' : '展开全部' }}
            </el-button>
            <el-button size="small" @click="handleCheckAll">
              {{ isCheckAll ? '取消全选' : '全选' }}
            </el-button>
          </div>
        </div>
        
        <div class="tree-content">
          <el-tree
            ref="treeRef"
            v-loading="treeLoading"
            :data="permissionTree"
            :props="treeProps"
            :default-expand-all="false"
            :default-checked-keys="checkedKeys"
            show-checkbox
            node-key="id"
            check-strictly
            accordion
            highlight-current
            @check="handleCheck"
          >
            <template #default="{ node, data }">
              <span class="tree-node-content">
                <el-icon v-if="data.icon" class="tree-node-icon">
                  <component :is="data.icon" />
                </el-icon>
                <span class="tree-node-label">{{ node.label }}</span>
                <el-tag 
                  v-if="data.type" 
                  :type="data.type === 'menu' ? 'primary' : 'success'" 
                  size="small"
                  class="tree-node-type"
                >
                  {{ data.type === 'menu' ? '菜单' : '按钮' }}
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          :loading="loading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElTree } from 'element-plus'
import { 
  getPermissionTree, 
  getRolePermissions, 
  assignRolePermissions 
} from '@/api/role'
import type { Role, Permission } from '@/types/role'

// Props
interface Props {
  modelValue: boolean
  roleData?: Role | null
}

const props = withDefaults(defineProps<Props>(), {
  roleData: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

// 响应式数据
const treeRef = ref<InstanceType<typeof ElTree>>()
const loading = ref(false)
const treeLoading = ref(false)
const permissionTree = ref<Permission[]>([])
const checkedKeys = ref<number[]>([])
const isExpandAll = ref(false)
const isCheckAll = ref(false)

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 获取权限树数据
const fetchPermissionTree = async () => {
  try {
    treeLoading.value = true
    const { data } = await getPermissionTree()
    permissionTree.value = data
  } catch (error) {
    console.error('获取权限树失败:', error)
    ElMessage.error('获取权限树失败')
  } finally {
    treeLoading.value = false
  }
}

// 获取角色权限
const fetchRolePermissions = async () => {
  if (!props.roleData) return
  
  try {
    const { data } = await getRolePermissions(props.roleData.id)
    checkedKeys.value = data
    
    // 设置树形组件的选中状态
    nextTick(() => {
      treeRef.value?.setCheckedKeys(data)
    })
  } catch (error) {
    console.error('获取角色权限失败:', error)
    ElMessage.error('获取角色权限失败')
  }
}

// 展开/收起全部
const handleExpandAll = () => {
  if (!treeRef.value) return
  
  isExpandAll.value = !isExpandAll.value
  
  // 获取所有节点
  const nodes = treeRef.value.store.nodesMap
  for (const nodeId in nodes) {
    nodes[nodeId].expanded = isExpandAll.value
  }
}

// 全选/取消全选
const handleCheckAll = () => {
  if (!treeRef.value) return
  
  isCheckAll.value = !isCheckAll.value
  
  if (isCheckAll.value) {
    // 获取所有可选择的节点ID
    const allKeys: number[] = []
    const traverse = (nodes: Permission[]) => {
      nodes.forEach(node => {
        if (node.type === 'button' || (node.type === 'menu' && node.children?.length)) {
          allKeys.push(node.id)
        }
        if (node.children) {
          traverse(node.children)
        }
      })
    }
    traverse(permissionTree.value)
    
    treeRef.value.setCheckedKeys(allKeys)
    checkedKeys.value = allKeys
  } else {
    treeRef.value.setCheckedKeys([])
    checkedKeys.value = []
  }
}

// 处理节点选中状态变化
const handleCheck = (data: Permission, checked: { checkedKeys: number[] }) => {
  checkedKeys.value = checked.checkedKeys
  
  // 更新全选状态
  const totalSelectableCount = getTotalSelectableCount(permissionTree.value)
  isCheckAll.value = checked.checkedKeys.length === totalSelectableCount
}

// 获取可选择节点总数
const getTotalSelectableCount = (nodes: Permission[]): number => {
  let count = 0
  nodes.forEach(node => {
    if (node.type === 'button' || (node.type === 'menu' && node.children?.length)) {
      count++
    }
    if (node.children) {
      count += getTotalSelectableCount(node.children)
    }
  })
  return count
}

// 提交权限分配
const handleSubmit = async () => {
  if (!props.roleData) return
  
  try {
    loading.value = true
    
    // 获取当前选中的权限ID
    const selectedKeys = treeRef.value?.getCheckedKeys() as number[] || []
    
    await assignRolePermissions({
      roleId: props.roleData.id,
      permissionIds: selectedKeys
    })
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('分配权限失败:', error)
    ElMessage.error('分配权限失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  checkedKeys.value = []
  isExpandAll.value = false
  isCheckAll.value = false
}

// 监听对话框打开
watch(
  () => props.modelValue,
  async (val) => {
    if (val && props.roleData) {
      // 获取权限树数据
      await fetchPermissionTree()
      // 获取角色当前权限
      await fetchRolePermissions()
    }
  }
)
</script>

<style scoped lang="scss">
.permission-dialog-content {
  max-height: 600px;
  overflow-y: auto;

  .role-info {
    margin-bottom: 20px;
  }

  .permission-tree-container {
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    .tree-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e4e7ed;
      background-color: #f5f7fa;

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .tree-actions {
        display: flex;
        gap: 8px;
      }
    }

    .tree-content {
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;

      .tree-node-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;

        .tree-node-icon {
          font-size: 16px;
          color: #606266;
        }

        .tree-node-label {
          flex: 1;
        }

        .tree-node-type {
          font-size: 12px;
          margin-left: auto;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}

:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node__label) {
  flex: 1;
}
</style> 