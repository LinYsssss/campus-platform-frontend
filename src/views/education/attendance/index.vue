<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>发起考勤</span>
            </div>
          </template>
          <el-form :model="attendanceForm" label-width="100px">
            <el-form-item label="选择课程">
              <el-select v-model="attendanceForm.courseId" placeholder="请选择课程" style="width: 100%;">
                <el-option v-for="course in courseList" :key="course.id" :label="course.courseName" :value="course.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="考勤时长">
              <el-input-number v-model="attendanceForm.duration" :min="5" :max="60" /> 分钟
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCreateSession" :loading="creating">
                发起考勤
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="currentSession" class="session-info">
            <el-divider />
            <h4>当前考勤场次</h4>
            <p>课程：{{ currentSession.courseName }}</p>
            <p>签到码：<span class="session-code">{{ currentSession.sessionCode }}</span></p>
            <p>剩余时间：{{ remainingTime }} 秒</p>
            <el-progress :percentage="progressPercent" :status="progressStatus" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>考勤记录</span>
              <el-button @click="fetchData"><el-icon><Refresh /></el-icon>刷新</el-button>
            </div>
          </template>
          <el-table :data="attendanceList" v-loading="loading" stripe>
            <el-table-column prop="courseName" label="课程名称" />
            <el-table-column prop="sessionCode" label="签到码" />
            <el-table-column prop="startTime" label="开始时间" />
            <el-table-column prop="endTime" label="结束时间" />
            <el-table-column prop="totalCount" label="应到人数" />
            <el-table-column prop="signedCount" label="实到人数" />
            <el-table-column label="出勤率">
              <template #default="{ row }">
                <el-progress :percentage="Math.round((row.signedCount / row.totalCount) * 100)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 学生签到 -->
    <el-card shadow="never" style="margin-top: 16px;" v-if="userRole === 'student'">
      <template #header>
        <div class="card-header">
          <span>学生签到</span>
        </div>
      </template>
      <div class="student-sign">
        <el-input v-model="signCode" placeholder="请输入签到码" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" @click="handleSign" :loading="signing">立即签到</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createAttendanceSession, getAttendanceSessionPage, attendanceSign } from '@/api/attendance'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userRole = computed(() => authStore.userRole)

const loading = ref(false)
const creating = ref(false)
const signing = ref(false)
const courseList = ref([])
const attendanceList = ref([])
const currentSession = ref(null)
const remainingTime = ref(0)
const signCode = ref('')
let timer = null

const attendanceForm = reactive({ courseId: null, duration: 30 })

const progressPercent = computed(() => {
  if (!currentSession.value) return 0
  return Math.round((remainingTime.value / (currentSession.value.duration * 60)) * 100)
})

const progressStatus = computed(() => {
  if (remainingTime.value < 60) return 'exception'
  if (remainingTime.value < 300) return 'warning'
  return ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAttendanceSessionPage({ pageNum: 1, pageSize: 10 })
    attendanceList.value = res.list || []
  } finally { loading.value = false }
}

const handleCreateSession = async () => {
  if (!attendanceForm.courseId) { ElMessage.warning('请选择课程'); return }
  creating.value = true
  try {
    const res = await createAttendanceSession(attendanceForm)
    currentSession.value = res
    remainingTime.value = attendanceForm.duration * 60
    startTimer()
    ElMessage.success('考勤发起成功')
    fetchData()
  } finally { creating.value = false }
}

const startTimer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (remainingTime.value > 0) remainingTime.value--
    else { clearInterval(timer); currentSession.value = null }
  }, 1000)
}

const handleSign = async () => {
  if (!signCode.value) { ElMessage.warning('请输入签到码'); return }
  signing.value = true
  try {
    await attendanceSign(signCode.value)
    ElMessage.success('签到成功')
    signCode.value = ''
  } finally { signing.value = false }
}

const handleViewDetail = (row) => { console.log('查看详情', row) }

onMounted(() => { fetchData() })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.session-info { margin-top: 20px; }
.session-code { font-size: 24px; font-weight: bold; color: #409EFF; letter-spacing: 4px; }
.student-sign { display: flex; align-items: center; padding: 20px; }
</style>
