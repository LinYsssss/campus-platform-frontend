<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>报修管理</span>
          <el-button type="primary" @click="handleSubmit">
            <el-icon><Plus /></el-icon>提交报修
          </el-button>
        </div>
      </template>

      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="报修类型">
          <el-select v-model="searchForm.repairType" placeholder="请选择" clearable>
            <el-option label="水电维修" value="water_elec" />
            <el-option label="家具维修" value="furniture" />
            <el-option label="设备维修" value="equipment" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待处理" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="已完成" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="工单号" width="150" />
        <el-table-column prop="repairType" label="报修类型">
          <template #default="{ row }">
            <el-tag>{{ row.repairType === 'water_elec' ? '水电维修' : row.repairType === 'furniture' ? '家具维修' : row.repairType === 'equipment' ? '设备维修' : '其他' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="报修地点" />
        <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : row.status === 1 ? 'primary' : 'success'">
              {{ row.status === 0 ? '待处理' : row.status === 1 ? '处理中' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status === 0" link type="primary" @click="handleProcess(row)">处理</el-button>
            <el-button v-if="row.status === 1" link type="success" @click="handleComplete(row)">完成</el-button>
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="提交报修" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="报修类型" prop="repairType">
          <el-select v-model="formData.repairType" placeholder="请选择报修类型" style="width: 100%;">
            <el-option label="水电维修" value="water_elec" />
            <el-option label="家具维修" value="furniture" />
            <el-option label="设备维修" value="equipment" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="报修地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入报修地点" />
        </el-form-item>
        <el-form-item label="问题描述" prop="description">
          <el-input v-model="formData.description" type="textarea" rows="4" placeholder="请详细描述问题" />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload action="#" list-type="picture-card" :auto-upload="false">
            <el-icon><Plus /></el-icon>
          </el-upload>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRepairPage, submitRepair, updateRepairStatus } from '@/api/repair'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ repairType: '', status: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({ repairType: '', location: '', description: '' })
const formRules = { repairType: [{ required: true, message: '请选择报修类型', trigger: 'change' }], location: [{ required: true, message: '请输入报修地点', trigger: 'blur' }], description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }] }

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRepairPage({ ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { Object.keys(searchForm).forEach(k => searchForm[k] = ''); handleSearch() }
const handleSubmit = () => { Object.assign(formData, { repairType: '', location: '', description: '' }); dialogVisible.value = true }
const handleFormSubmit = async () => {
  await formRef.value.validate()
  try {
    await submitRepair(formData)
    ElMessage.success('报修提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) { console.error(error) }
}
const handleProcess = (row) => { updateRepairStatus(row.id, 1); ElMessage.success('已开始处理'); fetchData() }
const handleComplete = (row) => { updateRepairStatus(row.id, 2); ElMessage.success('已标记完成'); fetchData() }
const handleView = (row) => { console.log('查看详情', row) }
const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
</style>
