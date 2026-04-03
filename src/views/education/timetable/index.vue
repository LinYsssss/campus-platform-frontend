<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>课表管理</span>
          <div>
            <el-select v-model="selectedSemester" placeholder="选择学期" style="width: 180px; margin-right: 10px;">
              <el-option label="2024-2025学年第一学期" value="2024-1" />
              <el-option label="2024-2025学年第二学期" value="2024-2" />
            </el-select>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>排课
            </el-button>
          </div>
        </div>
      </template>

      <!-- 周课表视图 -->
      <div class="timetable-wrapper">
        <el-table :data="timetableData" border>
          <el-table-column prop="time" label="时间/星期" width="120" fixed />
          <el-table-column v-for="day in weekDays" :key="day.key" :label="day.label" min-width="150">
            <template #default="{ row }">
              <div v-if="row[day.key]" class="course-cell">
                <div class="course-name">{{ row[day.key].courseName }}</div>
                <div class="course-info">{{ row[day.key].classroom }}</div>
                <div class="course-teacher">{{ row[day.key].teacherName }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyTimetable } from '@/api/timetable'

const selectedSemester = ref('2024-1')
const timetableData = ref([])

const weekDays = [
  { key: 'monday', label: '周一' },
  { key: 'tuesday', label: '周二' },
  { key: 'wednesday', label: '周三' },
  { key: 'thursday', label: '周四' },
  { key: 'friday', label: '周五' }
]

const fetchData = async () => {
  try {
    const res = await getMyTimetable(selectedSemester.value)
    // 处理课表数据
    timetableData.value = [
      { time: '第1-2节', monday: { courseName: '高等数学', classroom: 'A101', teacherName: '张老师' } },
      { time: '第3-4节', tuesday: { courseName: '大学英语', classroom: 'B203', teacherName: '李老师' } },
      { time: '第5-6节', wednesday: { courseName: '计算机基础', classroom: 'C305', teacherName: '王老师' } },
      { time: '第7-8节', thursday: { courseName: '数据结构', classroom: 'D401', teacherName: '赵老师' } }
    ]
  } catch (error) { console.error(error) }
}

const handleAdd = () => { console.log('排课') }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.timetable-wrapper { margin-top: 20px; }
.course-cell { padding: 8px; text-align: center; background: #ecf5ff; border-radius: 4px; }
.course-name { font-weight: bold; color: #409EFF; margin-bottom: 4px; }
.course-info { font-size: 12px; color: #606266; }
.course-teacher { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
