<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-radio-group v-model="logType">
            <el-radio-button label="operate">操作日志</el-radio-button>
            <el-radio-button label="login">登录日志</el-radio-button>
          </el-radio-group>
          <el-button @click="fetchData">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </template>

      <!-- 搜索 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operName" placeholder="请输入操作人" clearable />
        </el-form-item>
        <el-form-item label="操作模块">
          <el-input v-model="searchForm.module" placeholder="请输入模块" clearable />
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker v-model="searchForm.timeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column v-if="logType === 'operate'" prop="module" label="操作模块" width="120" />
        <el-table-column v-if="logType === 'operate'" prop="operType" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOperTypeType(row.operType)">{{ row.operType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operName" label="操作人" width="120" />
        <el-table-column prop="operIp" label="IP地址" width="140" />
        <el-table-column prop="operLocation" label="操作地点" width="150" />
        <el-table-column prop="operParam" label="请求参数" min-width="200" show-overflow-tooltip />
        <el-table-column prop="jsonResult" label="返回结果" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operTime" label="操作时间" width="180" />
      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { getOperateLogPage, getLoginLogPage } from '@/api/log'

const logType = ref('operate')
const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({ operName: '', module: '', timeRange: [] })

const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const getOperTypeType = (type) => {
  const types = { '新增': 'success', '修改': 'warning', '删除': 'danger', '查询': 'info', '导出': 'primary' }
  return types[type] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize }
    let res
    if (logType.value === 'operate') res = await getOperateLogPage(params)
    else res = await getLoginLogPage(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { Object.keys(searchForm).forEach(k => searchForm[k] = k === 'timeRange' ? [] : ''); handleSearch() }
const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

watch(logType, () => { handleSearch() })
onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
</style>
