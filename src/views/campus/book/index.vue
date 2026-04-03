<template>
  <div class="page-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="图书检索" name="search">
        <el-card shadow="never">
          <el-form :model="searchForm" inline>
            <el-form-item label="书名">
              <el-input v-model="searchForm.bookName" placeholder="请输入书名" clearable />
            </el-form-item>
            <el-form-item label="作者">
              <el-input v-model="searchForm.author" placeholder="请输入作者" clearable />
            </el-form-item>
            <el-form-item label="ISBN">
              <el-input v-model="searchForm.isbn" placeholder="请输入ISBN" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="bookList" v-loading="loading" stripe>
            <el-table-column prop="bookName" label="书名" min-width="180" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="publisher" label="出版社" />
            <el-table-column prop="isbn" label="ISBN" width="150" />
            <el-table-column prop="totalStock" label="库存" width="80" />
            <el-table-column prop="availableStock" label="可借" width="80">
              <template #default="{ row }">
                <el-tag :type="row.availableStock > 0 ? 'success' : 'danger'">{{ row.availableStock }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button v-if="row.availableStock > 0" link type="primary" @click="handleBorrow(row)">借阅</el-button>
                <el-button v-else link disabled>暂无库存</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="我的借阅" name="my">
        <el-card shadow="never">
          <el-table :data="borrowList" v-loading="loading" stripe>
            <el-table-column prop="bookName" label="书名" min-width="180" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="borrowTime" label="借阅时间" />
            <el-table-column prop="dueTime" label="应还时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'borrowed' ? 'primary' : row.status === 'overdue' ? 'danger' : 'success'">
                  {{ row.status === 'borrowed' ? '借阅中' : row.status === 'overdue' ? '已逾期' : '已归还' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button v-if="row.status === 'borrowed' || row.status === 'overdue'" link type="primary" @click="handleReturn(row)">归还</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBookPage, getMyBorrows, borrowBook, returnBook } from '@/api/book'

const activeTab = ref('search')
const loading = ref(false)
const searchForm = reactive({ bookName: '', author: '', isbn: '' })
const bookList = ref([])
const borrowList = ref([])
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const fetchBookList = async () => {
  loading.value = true
  try {
    const res = await getBookPage({ ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    bookList.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const fetchBorrowList = async () => {
  loading.value = true
  try {
    const res = await getMyBorrows()
    borrowList.value = res.list || []
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchBookList() }
const handleReset = () => { Object.keys(searchForm).forEach(k => searchForm[k] = ''); handleSearch() }
const handleBorrow = async (row) => {
  try {
    await borrowBook(row.id)
    ElMessage.success('借阅成功')
    fetchBookList()
  } catch (error) { console.error(error) }
}
const handleReturn = async (row) => {
  try {
    await returnBook(row.id)
    ElMessage.success('归还成功')
    fetchBorrowList()
  } catch (error) { console.error(error) }
}
const handleSizeChange = (val) => { pagination.pageSize = val; fetchBookList() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchBookList() }

onMounted(() => { fetchBookList(); fetchBorrowList() })
</script>
