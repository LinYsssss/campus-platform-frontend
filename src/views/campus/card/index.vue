<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="card-balance">
          <div class="balance-header">
            <span>校园卡余额</span>
            <el-button type="danger" size="small" @click="handleReportLoss">挂失</el-button>
          </div>
          <div class="balance-amount">¥ {{ cardInfo.balance || '0.00' }}</div>
          <div class="balance-actions">
            <el-button type="primary" @click="handleRecharge">充值</el-button>
            <el-button @click="handleQuery">查询明细</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>消费记录</span>
              <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleDateChange" />
            </div>
          </template>
          <el-table :data="recordList" v-loading="loading" stripe>
            <el-table-column prop="transactionNo" label="交易号" width="180" />
            <el-table-column prop="transactionType" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.transactionType === 'recharge' ? 'success' : 'primary'">{{ row.transactionType === 'recharge' ? '充值' : '消费' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <span :style="{ color: row.transactionType === 'recharge' ? '#67C23A' : '#F56C6C' }">{{ row.transactionType === 'recharge' ? '+' : '-' }}{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="消费地点" />
            <el-table-column prop="transactionTime" label="交易时间" width="180" />
          </el-table>
          <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="rechargeDialogVisible" title="卡片充值" width="400px">
      <el-form ref="formRef" :model="rechargeForm" :rules="rechargeRules" label-width="80px">
        <el-form-item label="卡号">
          <el-input v-model="rechargeForm.cardNo" disabled />
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input-number v-model="rechargeForm.amount" :min="10" :max="1000" :step="10" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRechargeSubmit">确认充值</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyCardRecords, rechargeCard, reportLoss } from '@/api/card'

const loading = ref(false)
const cardInfo = reactive({ balance: 256.5, cardNo: '20240001' })
const recordList = ref([])
const dateRange = ref([])
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const rechargeDialogVisible = ref(false)
const formRef = ref(null)
const rechargeForm = reactive({ cardNo: '20240001', amount: 100 })
const rechargeRules = { amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }] }

const fetchData = async () => {
  loading.value = true
  try {
    const params = { pageNum: pagination.pageNum, pageSize: pagination.pageSize }
    if (dateRange.value && dateRange.value.length === 2) { params.startTime = dateRange.value[0]; params.endTime = dateRange.value[1] }
    const res = await getMyCardRecords(params)
    recordList.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const handleDateChange = () => { fetchData() }
const handleRecharge = () => { rechargeDialogVisible.value = true }
const handleRechargeSubmit = async () => {
  await formRef.value.validate()
  try {
    await rechargeCard(rechargeForm)
    ElMessage.success('充值成功')
    rechargeDialogVisible.value = false
    fetchData()
  } catch (error) { console.error(error) }
}
const handleReportLoss = () => {
  ElMessageBox.confirm('确定要挂失校园卡吗？挂失后卡片将被冻结。', '提示', { type: 'warning' })
    .then(async () => {
      await reportLoss(cardInfo.cardNo)
      ElMessage.success('挂失成功')
    })
}
const handleQuery = () => { fetchData() }
const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-balance { text-align: center; padding: 20px; }
.balance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 16px; color: #606266; }
.balance-amount { font-size: 48px; font-weight: bold; color: #409EFF; margin: 30px 0; }
.balance-actions { display: flex; justify-content: center; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
