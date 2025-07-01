<template>
  <div class="product-detail">
    <div class="detail-header">
      <el-card>
        <div class="header-content">
          <el-button @click="goBack" type="info" plain>
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <div class="header-actions">
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑商品
            </el-button>
            <el-button type="warning" @click="handleRecommend">
              <el-icon><Star /></el-icon>
              推荐设置
            </el-button>
            <el-button type="success" @click="handleStock">
              <el-icon><Box /></el-icon>
              库存管理
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="20" v-if="productData">
        <!-- 基本信息 -->
        <el-col :span="16">
          <el-card title="基本信息" class="detail-card">
            <template #header>
              <span>基本信息</span>
            </template>
            
            <div class="info-section">
              <div class="product-header">
                <h2 class="product-name">{{ productData.name }}</h2>
                <div class="product-tags">
                  <el-tag v-if="productData.isNew" type="success" effect="dark">新品</el-tag>
                  <el-tag v-if="productData.isHot" type="danger" effect="dark">热销</el-tag>
                  <el-tag v-if="productData.isFeatured" type="warning" effect="dark">精选</el-tag>
                  <el-tag v-if="productData.isRecommended" type="primary" effect="dark">推荐</el-tag>
                  <el-tag :type="productData.status === 1 ? 'success' : 'danger'">
                    {{ productData.status === 1 ? '上架' : '下架' }}
                  </el-tag>
                </div>
              </div>

              <el-descriptions :column="2" border>
                <el-descriptions-item label="商品ID">
                  {{ productData.id }}
                </el-descriptions-item>
                <el-descriptions-item label="商品编码">
                  {{ productData.sku || '暂无' }}
                </el-descriptions-item>
                <el-descriptions-item label="商品分类">
                  {{ productData.categoryName || '暂无' }}
                </el-descriptions-item>
                <el-descriptions-item label="商品品牌">
                  {{ productData.brand || '暂无' }}
                </el-descriptions-item>
                <el-descriptions-item label="商品型号">
                  {{ productData.model || '暂无' }}
                </el-descriptions-item>
                <el-descriptions-item label="商品重量">
                  {{ productData.weight ? `${productData.weight}g` : '暂无' }}
                </el-descriptions-item>
              </el-descriptions>

              <div class="description-section" v-if="productData.description">
                <h4>商品描述</h4>
                <p class="description-text">{{ productData.description }}</p>
              </div>

              <div class="tags-section" v-if="productData.tags && productData.tags.length">
                <h4>商品标签</h4>
                <el-tag v-for="tag in productData.tags" :key="tag" class="tag-item">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 图片和价格信息 -->
        <el-col :span="8">
          <el-card title="商品图片" class="detail-card">
            <template #header>
              <span>商品图片</span>
            </template>
            
            <div class="images-section">
              <div class="main-image" v-if="productData.images && productData.images.length">
                <el-image 
                  :src="mainImage" 
                  fit="cover"
                  style="width: 100%; height: 300px;"
                  :preview-src-list="productData.images"
                />
              </div>
              <div class="image-thumbnails" v-if="productData.images && productData.images.length > 1">
                <el-image 
                  v-for="(image, index) in productData.images" 
                  :key="index"
                  :src="image"
                  fit="cover"
                  class="thumbnail"
                  @click="mainImage = image"
                />
              </div>
              <div v-else class="no-image">
                <el-icon size="80"><Picture /></el-icon>
                <p>暂无图片</p>
              </div>
            </div>
          </el-card>

          <el-card title="价格库存" class="detail-card" style="margin-top: 20px;">
            <template #header>
              <span>价格库存</span>
            </template>
            
            <div class="price-stock-section">
              <div class="price-item">
                <span class="label">销售价格:</span>
                <span class="price current-price">¥{{ productData.price?.toFixed(2) }}</span>
              </div>
              <div class="price-item" v-if="productData.originalPrice">
                <span class="label">原价:</span>
                <span class="price original-price">¥{{ productData.originalPrice.toFixed(2) }}</span>
              </div>
              <div class="price-item" v-if="productData.cost">
                <span class="label">成本价:</span>
                <span class="price cost-price">¥{{ productData.cost.toFixed(2) }}</span>
              </div>
              <div class="stock-item">
                <span class="label">库存数量:</span>
                <span class="stock" :class="{ 'low-stock': productData.stock < 10 }">
                  {{ productData.stock }}
                </span>
              </div>
              <div class="stock-item">
                <span class="label">销售数量:</span>
                <span class="sales">{{ productData.sales || 0 }}</span>
              </div>
              <div class="profit-item" v-if="productData.profitMargin">
                <span class="label">利润率:</span>
                <span class="profit">{{ productData.profitMargin }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 相关商品推荐 -->
      <el-card title="相关商品推荐" class="detail-card" style="margin-top: 20px;" v-if="relatedProducts.length">
        <template #header>
          <span>相关商品推荐</span>
        </template>
        
        <div class="related-products">
          <el-row :gutter="16">
            <el-col :span="6" v-for="product in relatedProducts" :key="product.id">
              <div class="related-product-card" @click="handleViewRelated(product.id)">
                <el-image 
                  :src="product.primaryImage || ''"
                  fit="cover"
                  class="related-image"
                />
                <div class="related-info">
                  <p class="related-name">{{ product.name }}</p>
                  <p class="related-price">¥{{ product.price?.toFixed(2) }}</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 推荐设置对话框 -->
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
        <el-button type="primary" @click="handleSaveRecommend">保存</el-button>
      </template>
    </el-dialog>

    <!-- 库存管理对话框 -->
    <el-dialog v-model="stockVisible" title="库存管理" width="500px">
      <el-form :model="stockForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="stockForm.operation">
            <el-radio value="set">设置库存</el-radio>
            <el-radio value="add">增加库存</el-radio>
            <el-radio value="reduce">减少库存</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="stockForm.quantity" :min="0" />
        </el-form-item>
        <el-form-item label="当前库存" v-if="productData">
          <span>{{ productData.stock }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveStock">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Star, Box, Picture } from '@element-plus/icons-vue'
import { getProductById, updateProductRecommend, updateProductStock, getRelatedProducts } from '@/api/product'
import type { Product } from '@/types/product'

const route = useRoute()
const router = useRouter()

// 数据状态
const loading = ref(false)
const productData = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const mainImage = ref('')

// 对话框状态
const recommendVisible = ref(false)
const stockVisible = ref(false)

// 表单数据
const recommendForm = ref({
  isRecommended: false,
  isHot: false,
  isFeatured: false,
  isNew: false
})

const stockForm = ref({
  operation: 'set' as 'set' | 'add' | 'reduce',
  quantity: 0
})

// 计算属性
const productId = computed(() => route.params.id as string)

// 返回列表
const goBack = () => {
  router.push('/product/goods')
}

// 编辑商品
const handleEdit = () => {
  // 返回到商品列表页面，可以通过路由参数传递要编辑的商品ID
  router.push({
    path: '/product/goods',
    query: { edit: productId.value }
  })
}

// 推荐设置
const handleRecommend = () => {
  if (productData.value) {
    recommendForm.value = {
      isRecommended: productData.value.isRecommended,
      isHot: productData.value.isHot,
      isFeatured: productData.value.isFeatured,
      isNew: productData.value.isNew
    }
    recommendVisible.value = true
  }
}

// 保存推荐设置
const handleSaveRecommend = async () => {
  try {
    const response = await updateProductRecommend(productId.value, recommendForm.value)
    if (response.success) {
      ElMessage.success('推荐设置更新成功')
      recommendVisible.value = false
      loadProductDetail()
    } else {
      ElMessage.error(response.message || '推荐设置更新失败')
    }
  } catch (error) {
    console.error('推荐设置更新失败:', error)
    ElMessage.error('推荐设置更新失败')
  }
}

// 库存管理
const handleStock = () => {
  stockForm.value = {
    operation: 'set',
    quantity: productData.value?.stock || 0
  }
  stockVisible.value = true
}

// 保存库存
const handleSaveStock = async () => {
  try {
    const response = await updateProductStock(productId.value, stockForm.value)
    if (response.success) {
      ElMessage.success('库存更新成功')
      stockVisible.value = false
      loadProductDetail()
    } else {
      ElMessage.error(response.message || '库存更新失败')
    }
  } catch (error) {
    console.error('库存更新失败:', error)
    ElMessage.error('库存更新失败')
  }
}

// 查看相关商品
const handleViewRelated = (id: string) => {
  router.push(`/product/goods/${id}`)
}

// 加载商品详情
const loadProductDetail = async () => {
  loading.value = true
  try {
    const response = await getProductById(productId.value)
    if (response.success) {
      productData.value = response.data
      if (productData.value.images && productData.value.images.length > 0) {
        mainImage.value = productData.value.images[0]
      }
      loadRelatedProducts()
    } else {
      ElMessage.error(response.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 加载相关商品
const loadRelatedProducts = async () => {
  try {
    const response = await getRelatedProducts(productId.value, 4)
    if (response.success) {
      relatedProducts.value = response.data
    }
  } catch (error) {
    console.error('获取相关商品失败:', error)
  }
}

onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped lang="scss">
.product-detail {
  padding: 20px;

  .detail-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .detail-card {
    margin-bottom: 20px;
  }

  .product-header {
    margin-bottom: 20px;

    .product-name {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }

    .product-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .description-section, .tags-section {
    margin-top: 20px;

    h4 {
      margin: 0 0 10px 0;
      color: #606266;
    }

    .description-text {
      line-height: 1.6;
      color: #606266;
      margin: 0;
    }

    .tag-item {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .images-section {
    .main-image {
      margin-bottom: 12px;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-thumbnails {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .thumbnail {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.3s;

        &:hover {
          border-color: #409EFF;
        }
      }
    }

    .no-image {
      text-align: center;
      color: #C0C4CC;
      padding: 60px 0;

      p {
        margin: 10px 0 0 0;
      }
    }
  }

  .price-stock-section {
    .price-item, .stock-item, .profit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #EBEEF5;

      .label {
        color: #606266;
        font-weight: 500;
      }

      .price {
        font-weight: bold;
        
        &.current-price {
          color: #E6A23C;
          font-size: 18px;
        }

        &.original-price {
          color: #909399;
          text-decoration: line-through;
        }

        &.cost-price {
          color: #F56C6C;
        }
      }

      .stock {
        font-weight: bold;
        color: #67C23A;

        &.low-stock {
          color: #F56C6C;
        }
      }

      .sales {
        font-weight: bold;
        color: #409EFF;
      }

      .profit {
        font-weight: bold;
        color: #67C23A;
      }
    }
  }

  .related-products {
    .related-product-card {
      border: 1px solid #EBEEF5;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      .related-image {
        width: 100%;
        height: 120px;
      }

      .related-info {
        padding: 12px;

        .related-name {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .related-price {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
          color: #E6A23C;
        }
      }
    }
  }
}
</style> 