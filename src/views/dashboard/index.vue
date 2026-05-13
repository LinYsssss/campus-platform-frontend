<template>
  <div class="dashboard-container">
    <!-- Hero 区域 — Dark Tile -->
    <section class="hero-tile">
      <div class="hero-content">
        <div class="hero-left">
          <el-avatar :size="56" :src="authStore.avatar" class="hero-avatar">
            <el-icon :size="28"><User /></el-icon>
          </el-avatar>
          <div class="hero-text">
            <h2 class="hero-title">
              {{ greeting }}，{{ authStore.nickname || authStore.username }}
            </h2>
            <p class="hero-desc">今天是 {{ currentDate }}，祝您工作愉快</p>
          </div>
        </div>
        <div class="hero-actions">
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
    </section>

    <!-- 统计卡片 — Light Tile -->
    <section class="stats-tile">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.studentCount }}</div>
            <div class="stat-label">在校学生</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.teacherCount }}</div>
            <div class="stat-label">在职教师</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.courseCount }}</div>
            <div class="stat-label">开设课程</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.attendanceRate }}%</div>
            <div class="stat-label">今日出勤率</div>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 图表 + 待办 — Parchment Tile -->
    <section class="content-tile">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <div class="tile-card">
            <div class="tile-card-header">
              <span class="tile-card-title">考勤趋势</span>
              <el-radio-group v-model="attendancePeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="attendanceChart" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="8">
          <div class="tile-card">
            <div class="tile-card-header">
              <span class="tile-card-title">待办事项</span>
            </div>
            <div class="todo-list">
              <div v-for="(item, index) in todoList" :key="index" class="todo-item">
                <span class="todo-dot" :class="item.type"></span>
                <span class="todo-text">{{ item.content }}</span>
                <span class="todo-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 公告 + 快捷入口 — Light Tile -->
    <section class="bottom-tile">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="tile-card">
            <div class="tile-card-header">
              <span class="tile-card-title">最新公告</span>
              <a class="tile-link" @click="$router.push('/campus/notice')">更多</a>
            </div>
            <div class="notice-list">
              <div v-for="(notice, index) in latestNotices" :key="index" class="notice-item">
                <span class="notice-dot" :class="{ unread: !notice.read }"></span>
                <div class="notice-content">
                  <div class="notice-title">{{ notice.title }}</div>
                  <div class="notice-meta">
                    <span>{{ notice.publisher }}</span>
                    <span>{{ notice.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="12">
          <div class="tile-card">
            <div class="tile-card-header">
              <span class="tile-card-title">快捷入口</span>
            </div>
            <div class="quick-links">
              <div
                v-for="(link, index) in quickLinks"
                :key="index"
                class="quick-link-item"
                @click="$router.push(link.path)"
              >
                <el-icon :size="20" :color="link.color">
                  <component :is="link.icon" />
                </el-icon>
                <span class="link-text">{{ link.name }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>
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

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const stats = ref({
  studentCount: 0,
  teacherCount: 0,
  courseCount: 0,
  attendanceRate: 0
})

const todoList = ref([
  { type: 'red', content: '期末成绩审核', time: '今天' },
  { type: 'orange', content: '宿舍报修处理', time: '2小时前' },
  { type: 'gray', content: '教学会议', time: '明天 14:00' },
  { type: 'green', content: '课程资料上传', time: '已完成' }
])

const latestNotices = ref([
  { title: '关于2024年寒假放假安排的通知', publisher: '教务处', time: '2小时前', read: false },
  { title: '期末考试时间安排', publisher: '教务处', time: '昨天', read: false },
  { title: '图书馆开放时间调整通知', publisher: '图书馆', time: '3天前', read: true },
  { title: '校园卡系统维护公告', publisher: '信息中心', time: '1周前', read: true }
])

const quickLinks = ref([
  { name: '我的课表', icon: 'Calendar', path: '/education/timetable', color: '#1d1d1f' },
  { name: '成绩查询', icon: 'Trophy', path: '/education/score', color: '#1d1d1f' },
  { name: '请假申请', icon: 'Timer', path: '/education/leave', color: '#1d1d1f' },
  { name: '课程评价', icon: 'Star', path: '/education/evaluation', color: '#1d1d1f' }
])

const initChart = () => {
  if (!attendanceChart.value) return

  chartInstance = echarts.init(attendanceChart.value)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['出勤率', '请假率', '缺勤率'],
      bottom: 0,
      textStyle: { fontSize: 12, color: '#7a7a7a' }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#7a7a7a', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#7a7a7a', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: '出勤率',
        type: 'line',
        smooth: true,
        data: [95, 96, 94, 97, 95, 90, 88],
        itemStyle: { color: '#1d1d1f' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(29, 29, 31, 0.12)' },
            { offset: 1, color: 'rgba(29, 29, 31, 0.02)' }
          ])
        }
      },
      {
        name: '请假率',
        type: 'line',
        smooth: true,
        data: [3, 2, 4, 2, 3, 5, 6],
        itemStyle: { color: '#d2d2d7' }
      },
      {
        name: '缺勤率',
        type: 'line',
        smooth: true,
        data: [2, 2, 2, 1, 2, 5, 6],
        itemStyle: { color: '#ff3b30' },
        lineStyle: { opacity: 0.6 }
      }
    ]
  }
  chartInstance.setOption(option)
}

const fetchData = async () => {
  try {
    const res = await getDashboardOverview()
    stats.value = res
  } catch (error) {
    stats.value = {
      studentCount: 3256,
      teacherCount: 186,
      courseCount: 428,
      attendanceRate: 96.5
    }
  }
}

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
  margin: -16px;
}

/* ============================================================
   Hero — Dark Tile (Apple product-tile-dark)
   ============================================================ */
.hero-tile {
  background: var(--apple-tile-1, #272729);
  padding: 48px;
  color: var(--apple-on-dark, #ffffff);
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-avatar {
  background: rgba(255, 255, 255, 0.1);
  color: var(--apple-body-muted, #cccccc);
}

.hero-title {
  font-family: var(--apple-font-display, "SF Pro Display", system-ui, -apple-system, sans-serif);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.28px;
  line-height: 1.14;
  margin: 0 0 4px;
  color: var(--apple-on-dark, #ffffff);
}

.hero-desc {
  font-size: 17px;
  color: var(--apple-body-muted, #cccccc);
  margin: 0;
  letter-spacing: -0.374px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.hero-actions .el-button {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  color: var(--apple-on-dark, #ffffff) !important;
}

.hero-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.18) !important;
}

.hero-actions .el-button--primary {
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.9) !important;
  color: var(--apple-ink, #1d1d1f) !important;
}

/* ============================================================
   Stats — Light Tile
   ============================================================ */
.stats-tile {
  background: var(--apple-canvas, #ffffff);
  padding: 32px 48px;
}

.stat-card {
  background: var(--apple-canvas, #ffffff);
  border: 1px solid var(--apple-hairline, #e0e0e0);
  border-radius: var(--apple-radius-lg, 18px);
  padding: 24px;
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-family: var(--apple-font-display, "SF Pro Display", system-ui, -apple-system, sans-serif);
  font-size: 34px;
  font-weight: 600;
  letter-spacing: -0.374px;
  line-height: 1.1;
  color: var(--apple-ink, #1d1d1f);
}

.stat-label {
  font-size: 14px;
  color: var(--apple-ink-muted-48, #7a7a7a);
  margin-top: 6px;
  letter-spacing: -0.224px;
}

/* ============================================================
   Content — Parchment Tile
   ============================================================ */
.content-tile {
  background: var(--apple-parchment, #f5f5f7);
  padding: 32px 48px;
}

.tile-card {
  background: var(--apple-canvas, #ffffff);
  border: 1px solid var(--apple-hairline, #e0e0e0);
  border-radius: var(--apple-radius-lg, 18px);
  padding: 24px;
}

.tile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tile-card-title {
  font-family: var(--apple-font-display, "SF Pro Display", system-ui, -apple-system, sans-serif);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.231px;
  color: var(--apple-ink, #1d1d1f);
}

.tile-link {
  color: var(--apple-link, #0066cc);
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  letter-spacing: -0.224px;
}

.tile-link:hover {
  text-decoration: underline;
}

.chart-container {
  height: 280px;
}

/* ============================================================
   Bottom — Light Tile
   ============================================================ */
.bottom-tile {
  background: var(--apple-canvas, #ffffff);
  padding: 32px 48px;
}

/* ============================================================
   Todo List
   ============================================================ */
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
  border-radius: var(--apple-radius-sm, 8px);
  background: var(--apple-parchment, #f5f5f7);
}

.todo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.todo-dot.red { background: #ff3b30; }
.todo-dot.orange { background: #ff9500; }
.todo-dot.green { background: #34c759; }
.todo-dot.gray { background: var(--apple-chip, #d2d2d7); }

.todo-text {
  flex: 1;
  font-size: 14px;
  color: var(--apple-ink, #1d1d1f);
  letter-spacing: -0.224px;
}

.todo-time {
  font-size: 12px;
  color: var(--apple-ink-muted-48, #7a7a7a);
  letter-spacing: -0.12px;
}

/* ============================================================
   Notice List
   ============================================================ */
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
  border-radius: var(--apple-radius-sm, 8px);
  cursor: pointer;
  transition: background 0.2s;
}

.notice-item:hover {
  background: var(--apple-parchment, #f5f5f7);
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--apple-chip, #d2d2d7);
  margin-top: 7px;
  flex-shrink: 0;
}

.notice-dot.unread {
  background: var(--apple-ink, #1d1d1f);
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 14px;
  color: var(--apple-ink, #1d1d1f);
  letter-spacing: -0.224px;
  line-height: 1.43;
}

.notice-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--apple-ink-muted-48, #7a7a7a);
  margin-top: 4px;
  letter-spacing: -0.12px;
}

/* ============================================================
   Quick Links
   ============================================================ */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: var(--apple-parchment, #f5f5f7);
  border-radius: var(--apple-radius-lg, 18px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-link-item:hover {
  background: #ececee;
  transform: translateY(-1px);
}

.link-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--apple-ink, #1d1d1f);
  letter-spacing: -0.224px;
}

/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 833px) {
  .hero-tile,
  .stats-tile,
  .content-tile,
  .bottom-tile {
    padding: 24px;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-title {
    font-size: 24px;
  }

  .stat-value {
    font-size: 28px;
  }
}

@media (max-width: 640px) {
  .hero-actions {
    flex-wrap: wrap;
  }
}
</style>
