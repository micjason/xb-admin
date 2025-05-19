<template>
  <div class="login-bg">
    <div class="login-wrapper">
      <el-card class="login-card">
        <div class="login-header">
          <div class="login-logo-placeholder"></div>
          <div class="login-title">商城后台管理系统</div>
        </div>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" size="large">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password clearable />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="form.remember">记住我</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width:100%" @click="onLogin" :loading="loading">登 录</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <div class="login-footer">© 2025 mall-admin. Powered by Vue3 + Element Plus</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const formRef = ref();
const loading = ref(false);
const form = ref({
  username: '',
  password: '',
  remember: false
});
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const onLogin = () => {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return;
    loading.value = true;
    // TODO: 调用后端登录接口
    setTimeout(() => {
      loading.value = false;
      ElMessage.success('登录成功（请对接后端接口）');
      // 登录成功后跳转主页面
    }, 1000);
  });
};
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ef 0%, #f5f7fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-wrapper {
  width: 420px;
  margin: 0 auto;
}
.login-card {
  border-radius: 12px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  padding: 36px 32px 24px 32px;
}
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}
.login-logo-placeholder {
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: #e5e6eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #bbb;
  border: 1.5px dashed #d3d3d3;
}
.login-title {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 2px;
}
.login-footer {
  text-align: center;
  color: #aaa;
  font-size: 13px;
  margin-top: 18px;
}
</style> 