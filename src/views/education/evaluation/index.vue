<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>课程评价</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="teacherName" label="任课教师" width="120" />
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" show-overflow-tooltip />
        <el-table-column prop="createTime" label="评价时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="!row.hasEvaluated" link type="primary" @click="handleEvaluate(row)">评价</el-button>
            <el-button v-else link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="课程评价" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="课程">
          <el-input v-model="formData.courseName" disabled />
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="formData.rating" :max="5" />
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input v-model="formData.content" type="textarea" rows="4" placeholder="请输入您的评价（最多200字）" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getEvaluationPage, submitEvaluation } from '@/api/evaluation'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({ courseId: null, courseName: '', rating: 5, content: '' })
const formRules = { rating: [{ required: true, message: '请选择评分', trigger: 'change' }], content: [{ required: true, message: '请输入评价内容', trigger: 'blur' }] }

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getEvaluationPage({ pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const handleEvaluate = (row) => { Object.assign(formData, { courseId: row.courseId, courseName: row.courseName, rating: 5, content: '' }); dialogVisible.value = true }
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await submitEvaluation(formData)
    ElMessage.success('评价提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) { console.error(error) }
}
const handleView = (row) => { console.log('查看评价', row) }
const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
