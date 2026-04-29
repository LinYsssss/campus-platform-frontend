<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>课表管理</span>
          <div>
            <el-select v-model="selectedSemester" placeholder="选择学期" style="width: 200px; margin-right: 10px;" clearable>
              <el-option label="2024-2025学年第一学期" value="2024-2025-1" />
              <el-option label="2024-2025学年第二学期" value="2024-2025-2" />
            </el-select>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>排课
            </el-button>
          </div>
        </div>
      </template>

      <!-- 周课表视图 -->
      <div class="timetable-wrapper">
        <el-table :data="timetableDisplayData" border v-loading="loading">
          <el-table-column prop="time" label="时间/星期" width="140" fixed />
          <el-table-column v-for="day in weekDays" :key="day.key" :label="day.label" min-width="180">
            <template #default="{ row }">
              <div v-if="row[day.key]" class="course-cell">
                <div class="course-name">{{ row[day.key].courseName }}</div>
                <div class="course-info">{{ row[day.key].classroom || row[day.key].className }}</div>
                <div class="course-teacher">{{ row[day.key].teacherName }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 课表列表 -->
      <el-divider />
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="className" label="班级" />
        <el-table-column prop="teacherName" label="教师" />
        <el-table-column prop="dayOfWeek" label="星期" width="80">
          <template #default="{ row }">
            {{ weekDays.find(d => d.key === getDayKey(row.dayOfWeek))?.label || row.dayOfWeek }}
          </template>
        </el-table-column>
        <el-table-column prop="startSection" label="节次" width="120">
          <template #default="{ row }">
            第{{ row.startSection }}-{{ row.endSection }}节
          </template>
        </el-table-column>
        <el-table-column prop="classroom" label="教室" />
        <el-table-column prop="semester" label="学期" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 排课对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="课程" prop="courseName">
          <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="formData.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="教师ID" prop="teacherId">
          <el-input-number v-model="formData.teacherId" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="formData.semester" placeholder="选择学期" style="width: 100%;">
            <el-option label="2024-2025学年第一学期" value="2024-2025-1" />
            <el-option label="2024-2025学年第二学期" value="2024-2025-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="星期" prop="dayOfWeek">
          <el-select v-model="formData.dayOfWeek" placeholder="选择星期" style="width: 100%;">
            <el-option v-for="(day, index) in weekDayOptions" :key="index" :label="day.label" :value="day.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始节次" prop="startSection">
          <el-input-number v-model="formData.startSection" :min="1" :max="12" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束节次" prop="endSection">
          <el-input-number v-model="formData.endSection" :min="1" :max="12" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="教室" prop="classroom">
          <el-input v-model="formData.classroom" placeholder="请输入教室" />
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTimetablePage, addTimetable, updateTimetable, deleteTimetable } from '@/api/timetable'

const loading = ref(false)
const selectedSemester = ref('')
const tableData = ref([])
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const weekDays = [
  { key: 'monday', label: '周一' },
  { key: 'tuesday', label: '周二' },
  { key: 'wednesday', label: '周三' },
  { key: 'thursday', label: '周四' },
  { key: 'friday', label: '周五' },
  { key: 'saturday', label: '周六' },
  { key: 'sunday', label: '周日' }
]

const weekDayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 }
]

const sectionTimes = [
  '第1-2节', '第3-4节', '第5-6节', '第7-8节', '第9-10节', '第11-12节'
]

const getDayKey = (dayOfWeek) => {
  const map = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday', 7: 'sunday' }
  return map[dayOfWeek]
}

// 将课表数据转换为周视图显示格式
const timetableDisplayData = computed(() => {
  const result = []
  sectionTimes.forEach((time, index) => {
    const row = { time }
    const startSec = index * 2 + 1
    weekDays.forEach(day => {
      const dayValue = weekDays.indexOf(day) + 1
      const course = tableData.value.find(item =>
        item.dayOfWeek === dayValue &&
        item.startSection <= startSec &&
        item.endSection >= startSec
      )
      if (course) {
        row[day.key] = course
      }
    })
    result.push(row)
  })
  return result
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      semester: selectedSemester.value || undefined
    }
    const res = await getTimetablePage(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch(selectedSemester, () => { pagination.pageNum = 1; fetchData() })

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  courseName: '',
  className: '',
  teacherId: null,
  semester: '',
  dayOfWeek: 1,
  startSection: 1,
  endSection: 2,
  classroom: ''
})

const formRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请输入教师ID', trigger: 'blur' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  dayOfWeek: [{ required: true, message: '请选择星期', trigger: 'change' }],
  startSection: [{ required: true, message: '请输入开始节次', trigger: 'blur' }],
  endSection: [{ required: true, message: '请输入结束节次', trigger: 'blur' }],
  classroom: [{ required: true, message: '请输入教室', trigger: 'blur' }]
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增课表'
  Object.assign(formData, {
    id: null, courseName: '', className: '', teacherId: null,
    semester: selectedSemester.value || '', dayOfWeek: 1, startSection: 1, endSection: 2, classroom: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑课表'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await updateTimetable(formData)
    } else {
      await addTimetable(formData)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除该课表安排吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteTimetable(row.id)
      ElMessage.success('删除成功')
      fetchData()
    })
}

const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.timetable-wrapper { margin-bottom: 20px; }
.course-cell { padding: 8px; text-align: center; background: #ecf5ff; border-radius: 4px; }
.course-name { font-weight: bold; color: #409EFF; margin-bottom: 4px; }
.course-info { font-size: 12px; color: #606266; }
.course-teacher { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
