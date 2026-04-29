<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>成绩管理</span>
          <div>
            <el-button type="primary" @click="handleImport">
              <el-icon><Upload /></el-icon>批量导入
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </div>
        </div>
      </template>

      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学期">
          <el-select v-model="searchForm.semester" placeholder="选择学期" clearable>
            <el-option label="2024-2025学年第一学期" value="2024-1" />
            <el-option label="2024-2025学年第二学期" value="2024-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-input v-model="searchForm.courseName" placeholder="请输入课程名称" clearable />
        </el-form-item>
        <el-form-item label="学生">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="usualScore" label="平时成绩" width="100" />
        <el-table-column prop="examScore" label="考试成绩" width="100" />
        <el-table-column prop="totalScore" label="总评成绩" width="100">
          <template #default="{ row }">
            <el-tag :type="getScoreType(row.totalScore)">{{ row.totalScore }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 2 ? 'success' : row.status === 1 ? 'warning' : 'info'">
              {{ row.status === 2 ? '已归档' : row.status === 1 ? '审核中' : '录入中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 1" link type="success" @click="handleAudit(row, true)">通过</el-button>
            <el-button v-if="row.status === 1" link type="danger" @click="handleAudit(row, false)">驳回</el-button>
            <el-button link type="primary" @click="handleAppeal(row)">申诉</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <!-- 成绩录入/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="学生姓名">
          <el-input v-model="formData.studentName" disabled />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="formData.courseName" disabled />
        </el-form-item>
        <el-form-item label="平时成绩" prop="usualScore">
          <el-input-number v-model="formData.usualScore" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="考试成绩" prop="examScore">
          <el-input-number v-model="formData.examScore" :min="0" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入成绩" width="500px">
      <el-form label-width="100px">
        <el-form-item label="课程ID">
          <el-input v-model="importForm.courseId" placeholder="请输入课程ID" />
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="importForm.semester" placeholder="例如 2024-1" />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload ref="uploadRef" action="#" :auto-upload="false" :limit="1" :on-change="handleFileChange">
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImport">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getScorePage, addScore, updateScore, importScore, auditScore, submitScoreAppeal } from '@/api/score'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ semester: '', courseName: '', studentName: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const dialogTitle = ref('成绩录入')
const formRef = ref(null)
const formData = reactive({ id: null, studentName: '', courseName: '', usualScore: 0, examScore: 0 })
const formRules = { usualScore: [{ required: true, message: '请输入平时成绩', trigger: 'blur' }], examScore: [{ required: true, message: '请输入考试成绩', trigger: 'blur' }] }

const importDialogVisible = ref(false)
const importForm = reactive({ courseId: '', semester: '' })
const importFile = ref(null)
const uploadRef = ref(null)

const getScoreType = (score) => { if (score >= 90) return 'success'; if (score >= 60) return ''; return 'danger' }

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getScorePage({ ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { Object.keys(searchForm).forEach(k => searchForm[k] = ''); handleSearch() }

const handleEdit = (row) => {
  dialogTitle.value = row.id ? '编辑成绩' : '成绩录入'
  Object.assign(formData, { id: row.id, studentName: row.studentName, courseName: row.courseName, usualScore: row.usualScore ?? 0, examScore: row.examScore ?? 0 })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (formData.id) {
      await updateScore(formData)
    } else {
      await addScore(formData)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) { console.error(error) }
}

const handleAudit = (row, approved) => {
  ElMessageBox.confirm(`确定要${approved ? '通过' : '驳回'}该成绩吗？`, '提示').then(async () => {
    try {
      await auditScore(row.id, approved ? 2 : 0, '')
      ElMessage.success('审核完成')
      fetchData()
    } catch (error) { ElMessage.error('审核失败') }
  }).catch(() => {})
}

const handleAppeal = (row) => {
  ElMessageBox.prompt('请输入申诉原因', '成绩申诉').then(async ({ value }) => {
    try {
      await submitScoreAppeal({ scoreId: row.id, reason: value })
      ElMessage.success('申诉提交成功')
    } catch (error) { ElMessage.error('申诉失败') }
  }).catch(() => {})
}

const handleImport = () => {
  importForm.courseId = ''
  importForm.semester = ''
  importFile.value = null
  if (uploadRef.value) uploadRef.value.clearFiles()
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  importFile.value = file.raw
}

const submitImport = async () => {
  if (!importFile.value || !importForm.courseId || !importForm.semester) {
    ElMessage.warning('请填写完整信息并选择文件')
    return
  }
  try {
    await importScore(importFile.value, importForm.courseId, importForm.semester)
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    fetchData()
  } catch (error) { ElMessage.error('导入失败') }
}

const handleExport = () => { ElMessage.info('导出功能开发中') }
const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
</style>
