<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>报修管理</span>
          <el-button type="primary" @click="handleNewRepair">
            <el-icon><Plus /></el-icon>提交报修
          </el-button>
        </div>
      </template>

      <!-- 管理员：全部工单 -->
      <template v-if="isAdmin">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="待审批" :value="0" />
              <el-option label="待维修" :value="1" />
              <el-option label="已完成" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
            <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="orderNo" label="工单号" width="150" />
          <el-table-column prop="title" label="报修标题" min-width="150" />
          <el-table-column label="紧急程度" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.urgencyLevel === 0">普通</el-tag>
              <el-tag v-else-if="row.urgencyLevel === 1" type="warning">紧急</el-tag>
              <el-tag v-else type="danger">非常紧急</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status]">{{ statusMap[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="提交时间" width="170" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 0" link type="primary" @click="handleAccept(row)">受理</el-button>
              <el-button v-if="row.status === 1" link type="success" @click="handleFinish(row)">完成</el-button>
              <el-button v-if="row.status === 2" link type="info" disabled>已完结</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]" :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </template>

      <!-- 学生/教师：我的报修 -->
      <template v-else>
        <el-table :data="myOrders" v-loading="loading" stripe>
          <el-table-column prop="orderNo" label="工单号" width="150" />
          <el-table-column prop="title" label="报修标题" min-width="150" />
          <el-table-column label="紧急程度" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.urgencyLevel === 0">普通</el-tag>
              <el-tag v-else-if="row.urgencyLevel === 1" type="warning">紧急</el-tag>
              <el-tag v-else type="danger">非常紧急</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status]">{{ statusMap[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="提交时间" width="170" />
        </el-table>
        <el-empty v-if="myOrders.length === 0" description="暂无报修记录" />
      </template>
    </el-card>

    <!-- 提交报修对话框 -->
    <el-dialog v-model="dialogVisible" title="提交报修" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="报修标题" prop="title">
          <el-input v-model="formData.title" placeholder="如：宿舍水管漏水" />
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="formData.urgencyLevel" style="width: 100%;">
            <el-option label="普通" :value="0" />
            <el-option label="紧急" :value="1" />
            <el-option label="非常紧急" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" prop="description">
          <el-input v-model="formData.description" type="textarea" rows="4" placeholder="请详细描述问题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRepairPage, getMyRepairs, submitRepair, acceptRepair, finishRepair } from '@/api/repair'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.userInfo?.userType === 2)

const loading = ref(false)
const tableData = ref([])
const myOrders = ref([])
const searchForm = reactive({ status: null })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({ title: '', description: '', urgencyLevel: 0 })
const formRules = {
  title: [{ required: true, message: '请输入报修标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }]
}

const statusMap = { 0: '待审批', 1: '待维修', 2: '已完成' }
const statusTagType = { 0: 'warning', 1: 'primary', 2: 'success' }

// 管理员：加载全部工单
const fetchAllOrders = async () => {
  loading.value = true
  try {
    const res = await getRepairPage({ ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

// 学生/教师：加载我的工单
const fetchMyOrders = async () => {
  loading.value = true
  try {
    const res = await getMyRepairs({ pageNum: 1, pageSize: 50 })
    myOrders.value = res.list || []
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchAllOrders() }
const handleReset = () => { searchForm.status = null; handleSearch() }

const handleNewRepair = () => {
  Object.assign(formData, { title: '', description: '', urgencyLevel: 0 })
  dialogVisible.value = true
}

const handleFormSubmit = async () => {
  await formRef.value.validate()
  try {
    await submitRepair(formData)
    ElMessage.success('报修提交成功')
    dialogVisible.value = false
    if (isAdmin.value) fetchAllOrders()
    else fetchMyOrders()
  } catch (e) { console.error(e) }
}

// 管理员操作
const handleAccept = async (row) => {
  try {
    await acceptRepair(row.id, authStore.userInfo?.id)
    ElMessage.success('已受理')
    fetchAllOrders()
  } catch (e) { console.error(e) }
}

const handleFinish = (row) => {
  ElMessageBox.prompt('请输入完成备注', '完成报修').then(async ({ value }) => {
    try {
      await finishRepair(row.id, value)
      ElMessage.success('已完成')
      fetchAllOrders()
    } catch (e) { console.error(e) }
  }).catch(() => {})
}

const handleSizeChange = (val) => { pagination.pageSize = val; fetchAllOrders() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchAllOrders() }

onMounted(() => {
  if (isAdmin.value) fetchAllOrders()
  else fetchMyOrders()
})
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
</style>
