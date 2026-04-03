<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>公告通知</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>发布公告
          </el-button>
        </div>
      </template>

      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="标题">
          <el-input v-model="searchForm.title" placeholder="请输入标题" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.noticeType" placeholder="请选择" clearable>
            <el-option label="通知" value="notice" />
            <el-option label="公告" value="announcement" />
            <el-option label="新闻" value="news" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="noticeType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.noticeType === 'notice' ? 'primary' : row.noticeType === 'announcement' ? 'warning' : 'info'">
              {{ row.noticeType === 'notice' ? '通知' : row.noticeType === 'announcement' ? '公告' : '新闻' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="发布人" width="120" />
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '已发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型" prop="noticeType">
          <el-select v-model="formData.noticeType" placeholder="请选择类型" style="width: 100%;">
            <el-option label="通知" value="notice" />
            <el-option label="公告" value="announcement" />
            <el-option label="新闻" value="news" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" rows="6" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">立即发布</el-radio>
            <el-radio :label="0">保存草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNoticePage, addNotice, updateNotice, deleteNotice } from '@/api/notice'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ title: '', noticeType: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({ id: null, title: '', noticeType: '', content: '', status: 1 })
const formRules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], noticeType: [{ required: true, message: '请选择类型', trigger: 'change' }], content: [{ required: true, message: '请输入内容', trigger: 'blur' }] }

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getNoticePage({ ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { Object.keys(searchForm).forEach(k => searchForm[k] = ''); handleSearch() }
const handleAdd = () => { isEdit.value = false; dialogTitle.value = '发布公告'; Object.assign(formData, { id: null, title: '', noticeType: '', content: '', status: 1 }); dialogVisible.value = true }
const handleEdit = (row) => { isEdit.value = true; dialogTitle.value = '编辑公告'; Object.assign(formData, row); dialogVisible.value = true }
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) await updateNotice(formData); else await addNotice(formData)
    ElMessage.success('保存成功'); dialogVisible.value = false; fetchData()
  } catch (error) { console.error(error) }
}
const handleDelete = (row) => { ElMessageBox.confirm(`确定要删除公告 "${row.title}" 吗？`, '提示', { type: 'warning' }).then(async () => { await deleteNotice(row.id); ElMessage.success('删除成功'); fetchData() }) }
const handleView = (row) => { console.log('查看公告', row) }
const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
</style>
