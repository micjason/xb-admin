# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

# mall-admin

本项目为 mall 系统的后台管理系统前端，基于 Vue3 + Element Plus + Pinia + Vite 等技术栈开发，实现商城后台的各类管理功能。

**所有前端相关文件、依赖、配置均放在 admin 目录下，便于前后端分离和独立管理。**

## 技术栈
- Vue 3
- Element Plus
- Pinia
- Vue Router
- Axios
- Echarts
- TypeScript
- Vite

## 配置文件说明
- **vite-env.d.ts**：Vite 项目的全局类型声明文件，主要用于让 TypeScript 识别 .vue 文件和 Vite 的环境变量类型。
- **tsconfig.json**：TypeScript 的主配置文件，指定全局编译选项、包含/排除文件等，是整个项目类型检查和编译的基础。
- **tsconfig.app.json**：为前端应用（src 目录）单独定制的 TypeScript 配置，通常继承自 tsconfig.json，专注于业务代码的类型检查。
- **tsconfig.node.json**：为 Node.js 相关脚本（如 Vite 配置、工具脚本等）定制的 TypeScript 配置，通常继承自 tsconfig.json，适配 Node 环境。

## 开发计划
详见《开发计划.md》，所有功能点将严格按照开发计划推进。
