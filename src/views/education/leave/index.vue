<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>请假管理</span>
          <el-button type="primary" @click="handleApply">
            <el-icon><Plus /></el-icon>申请请假
          </el-button>
        </div>
      </template>

      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="请假类型">
          <el-select v-model="searchForm.leaveType" placeholder="请选择" clearable>
            <el-option label="病假" value="sick" />
            <el-option label="事假" value="personal" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待审核" value="0" />
            <el-option label="已通过" value="1" />
            <el-option label="已驳回" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="leaveType" label="请假类型">
          <template #default="{ row }">
            <el-tag>{{ row.leaveType === 'sick' ? '病假' : row.leaveType === 'personal' ? '事假' : '其他' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="reason" label="请假原因" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 0 ? '待审核' : row.status === 1 ? '已通过' : '已驳回' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status === 0" link type="success" @click="handleAudit(row, true)">通过</el-button>
            <el-button v-if="row.status === 0" link type="danger" @click="handleAudit(row, false)">驳回</el-button>
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="申请请假" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="formData.leaveType" placeholder="请选择请假类型" style="width: 100%;">
            <el-option label="病假" value="sick" />
            <el-option label="事假" value="personal" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="formData.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="formData.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input v-model="formData.reason" type="textarea" rows="3" placeholder="请输入请假原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLeavePage, submitLeave, auditLeave } from '@/api/leave'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ leaveType: '', status: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({ leaveType: '', startTime: '', endTime: '', reason: '' })
const formRules = { leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }], startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }], endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }], reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }] }

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLeavePage({ ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { Object.keys(searchForm).forEach(k => searchForm[k] = ''); handleSearch() }
const handleApply = () => { Object.assign(formData, { leaveType: '', startTime: '', endTime: '', reason: '' }); dialogVisible.value = true }
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await submitLeave(formData)
    ElMessage.success('申请提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) { console.error(error) }
}
const handleAudit = (row, approved) => { ElMessageBox.confirm(`确定要${approved ? '通过' : '驳回'}该请假申请吗？`, '提示').then(async () => { await auditLeave({ id: row.id, status: approved ? 1 : 2, remark: '' }); ElMessage.success('审核完成'); fetchData() }) }
const handleView = (row) => { console.log('查看详情', row) }
const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
</style>
