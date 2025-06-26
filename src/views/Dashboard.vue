<template>
  <div class="dashboard">
    <el-card class="welcome-card">
      <h1>欢迎来到商城管理系统</h1>
      <p>当前用户：{{ userInfo?.username || '未知用户' }}</p>
      <p>当前时间：{{ currentTime }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()
const currentTime = ref('')

// 计算属性
const userInfo = computed(() => authStore.userInfo)

// 更新时间
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 1000)
  
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
}

.welcome-card {
  text-align: center;
  
  h1 {
    color: #409EFF;
    margin-bottom: 20px;
  }
  
  p {
    margin: 10px 0;
    color: #666;
  }
}
</style> 