<template>
  <div class="dashboard-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <el-avatar :size="64" :src="authStore.avatar" class="welcome-avatar">
          <el-icon :size="32"><User /></el-icon>
        </el-avatar>
        <div class="welcome-text">
          <h2 class="welcome-title">
            {{ greeting }}，{{ authStore.nickname || authStore.username }}
          </h2>
          <p class="welcome-desc">今天是 {{ currentDate }}，祝您工作愉快！</p>
        </div>
      </div>
      <div class="quick-actions">
        <el-button type="primary" @click="$router.push('/education/attendance')">
          <el-icon><Checked /></el-icon>考勤签到
        </el-button>
        <el-button @click="$router.push('/campus/repair')">
          <el-icon><Tools /></el-icon>提交报修
        </el-button>
        <el-button @click="$router.push('/campus/notice')">
          <el-icon><Bell /></el-icon>查看公告
        </el-button>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <el-row :gutter="16" class="data-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon student">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.studentCount }}</div>
            <div class="stat-label">在校学生</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon teacher">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.teacherCount }}</div>
            <div class="stat-label">在职教师</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon course">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.courseCount }}</div>
            <div class="stat-label">开设课程</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon attendance">
            <el-icon><Checked /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.attendanceRate }}%</div>
            <div class="stat-label">今日出勤率</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-section">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>考勤趋势</span>
              <el-radio-group v-model="attendancePeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="attendanceChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-link type="primary" :underline="false">查看全部</el-link>
            </div>
          </template>
          <div class="todo-list">
            <div v-for="(item, index) in todoList" :key="index" class="todo-item">
              <el-tag :type="item.type" size="small">{{ item.tag }}</el-tag>
              <span class="todo-text">{{ item.content }}</span>
              <span class="todo-time">{{ item.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部区域 -->
    <el-row :gutter="16" class="bottom-section">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新公告</span>
              <el-link type="primary" :underline="false" @click="$router.push('/campus/notice')">
                更多
              </el-link>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="(notice, index) in latestNotices" :key="index" class="notice-item">
              <div class="notice-dot" :class="{ unread: !notice.read }"></div>
              <div class="notice-content">
                <div class="notice-title">{{ notice.title }}</div>
                <div class="notice-meta">
                  <span>{{ notice.publisher }}</span>
                  <span>{{ notice.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷入口</span>
            </div>
          </template>
          <div class="quick-links">
            <div 
              v-for="(link, index) in quickLinks" 
              :key="index" 
              class="quick-link-item"
              @click="$router.push(link.path)"
            >
              <el-icon :size="24" :color="link.color">
                <component :is="link.icon" />
              </el-icon>
              <span class="link-text">{{ link.name }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useAuthStore } from '@/stores/auth'
import { getDashboardOverview } from '@/api/dashboard'
import { User, UserFilled, Reading, Checked, Bell, Tools, Calendar, Trophy, Timer, Star } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const attendanceChart = ref(null)
const attendancePeriod = ref('week')
let chartInstance = null

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据
const stats = ref({
  studentCount: 0,
  teacherCount: 0,
  courseCount: 0,
  attendanceRate: 0
})

// 待办事项
const todoList = ref([
  { type: 'danger', tag: '紧急', content: '期末成绩审核', time: '今天' },
  { type: 'warning', tag: '待办', content: '宿舍报修处理', time: '2小时前' },
  { type: 'info', tag: '提醒', content: '教学会议', time: '明天 14:00' },
  { type: 'success', tag: '完成', content: '课程资料上传', time: '已完成' }
])

// 最新公告
const latestNotices = ref([
  { title: '关于2024年寒假放假安排的通知', publisher: '教务处', time: '2小时前', read: false },
  { title: '期末考试时间安排', publisher: '教务处', time: '昨天', read: false },
  { title: '图书馆开放时间调整通知', publisher: '图书馆', time: '3天前', read: true },
  { title: '校园卡系统维护公告', publisher: '信息中心', time: '1周前', read: true }
])

// 快捷入口
const quickLinks = ref([
  { name: '我的课表', icon: 'Calendar', path: '/education/timetable', color: '#409EFF' },
  { name: '成绩查询', icon: 'Trophy', path: '/education/score', color: '#67C23A' },
  { name: '请假申请', icon: 'Timer', path: '/education/leave', color: '#E6A23C' },
  { name: '课程评价', icon: 'Star', path: '/education/evaluation', color: '#F56C6C' }
])

// 初始化图表
const initChart = () => {
  if (!attendanceChart.value) return
  
  chartInstance = echarts.init(attendanceChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['出勤率', '请假率', '缺勤率'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '出勤率',
        type: 'line',
        smooth: true,
        data: [95, 96, 94, 97, 95, 90, 88],
        itemStyle: { color: '#67C23A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      },
      {
        name: '请假率',
        type: 'line',
        smooth: true,
        data: [3, 2, 4, 2, 3, 5, 6],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '缺勤率',
        type: 'line',
        smooth: true,
        data: [2, 2, 2, 1, 2, 5, 6],
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }
  chartInstance.setOption(option)
}

// 获取数据
const fetchData = async () => {
  try {
    const res = await getDashboardOverview()
    stats.value = res
  } catch (error) {
    // 使用模拟数据
    stats.value = {
      studentCount: 3256,
      teacherCount: 186,
      courseCount: 428,
      attendanceRate: 96.5
    }
  }
}

// 监听窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  fetchData()
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #409EFF 0%, #2c5cc9 100%);
  border-radius: 12px;
  padding: 24px 32px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-avatar {
  background: #fff;
}

.welcome-title {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
}

.welcome-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 12px;
}

.quick-actions .el-button {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.quick-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.25);
}

.quick-actions .el-button--primary {
  background: #fff;
  border-color: #fff;
  color: #409EFF;
}

/* 数据卡片 */
.data-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.student {
  background: #ecf5ff;
  color: #409EFF;
}

.stat-icon.teacher {
  background: #f0f9eb;
  color: #67C23A;
}

.stat-icon.course {
  background: #fdf6ec;
  color: #E6A23C;
}

.stat-icon.attendance {
  background: #fef0f0;
  color: #F56C6C;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 图表区域 */
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.chart-container {
  height: 320px;
}

/* 待办列表 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.todo-text {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.todo-time {
  font-size: 12px;
  color: #909399;
}

/* 公告列表 */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.notice-item:hover {
  background: #f5f7fa;
}

.notice-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  margin-top: 6px;
  flex-shrink: 0;
}

.notice-dot.unread {
  background: #409EFF;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notice-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

/* 快捷链接 */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-link-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.link-text {
  font-size: 14px;
  color: #606266;
}

/* 底部区域 */
.bottom-section {
  margin-bottom: 20px;
}
</style>
