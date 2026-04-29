<template>
  <div class="page-container">
    <el-tabs v-model="activeTab" type="border-card" @tab-change="onTabChange">
      <el-tab-pane label="楼栋管理" name="building">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>楼栋列表</span>
              <el-button type="primary" @click="handleAddBuilding"><el-icon><Plus /></el-icon>新增楼栋</el-button>
            </div>
          </template>
          <el-table :data="buildingList" v-loading="loading" stripe>
            <el-table-column prop="buildingNo" label="楼栋编号" />
            <el-table-column prop="buildingName" label="楼栋名称" />
            <el-table-column prop="floorCount" label="楼层数" />
            <el-table-column prop="roomCount" label="房间数" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditBuilding(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteBuilding(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="房间管理" name="room">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>房间列表</span>
              <el-button type="primary" @click="handleAddRoom"><el-icon><Plus /></el-icon>新增房间</el-button>
            </div>
          </template>
          <el-table :data="roomList" v-loading="loading" stripe>
            <el-table-column prop="buildingName" label="所属楼栋" />
            <el-table-column prop="roomNo" label="房间号" />
            <el-table-column prop="capacity" label="容纳人数" />
            <el-table-column prop="occupied" label="已住人数" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '可用' : '已满' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditRoom(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="住宿分配" name="allocation">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>住宿分配</span>
              <el-button type="primary" @click="handleAllocate"><el-icon><Plus /></el-icon>分配宿舍</el-button>
            </div>
          </template>
          <el-table :data="allocationList" v-loading="loading" stripe>
            <el-table-column prop="studentNo" label="学号" />
            <el-table-column prop="studentName" label="姓名" />
            <el-table-column prop="buildingName" label="楼栋" />
            <el-table-column prop="roomNo" label="房间号" />
            <el-table-column prop="bedNo" label="床位" />
            <el-table-column prop="checkInTime" label="入住时间" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="danger" @click="handleRemoveAllocation(row)">退宿</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 楼栋表单 -->
    <el-dialog v-model="buildingDialogVisible" :title="buildingDialogTitle" width="500px">
      <el-form :model="buildingForm" label-width="100px">
        <el-form-item label="楼栋编号">
          <el-input v-model="buildingForm.buildingNo" placeholder="请输入楼栋编号" />
        </el-form-item>
        <el-form-item label="楼栋名称">
          <el-input v-model="buildingForm.buildingName" placeholder="请输入楼栋名称" />
        </el-form-item>
        <el-form-item label="楼层数">
          <el-input-number v-model="buildingForm.floorCount" :min="1" :max="30" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="buildingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBuilding">确定</el-button>
      </template>
    </el-dialog>

    <!-- 房间表单 -->
    <el-dialog v-model="roomDialogVisible" :title="roomDialogTitle" width="500px">
      <el-form :model="roomForm" label-width="100px">
        <el-form-item label="所属楼栋">
          <el-select v-model="roomForm.buildingId" placeholder="请选择楼栋">
            <el-option v-for="b in buildingList" :key="b.id" :label="b.buildingName" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="roomForm.roomNo" placeholder="请输入房间号" />
        </el-form-item>
        <el-form-item label="容纳人数">
          <el-input-number v-model="roomForm.capacity" :min="1" :max="12" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roomDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRoom">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配宿舍 -->
    <el-dialog v-model="allocateDialogVisible" title="分配宿舍" width="500px">
      <el-form :model="allocateForm" label-width="100px">
        <el-form-item label="学生ID">
          <el-input v-model="allocateForm.studentId" placeholder="请输入学生ID" />
        </el-form-item>
        <el-form-item label="所属楼栋">
          <el-select v-model="allocateForm.buildingId" placeholder="请选择楼栋" @change="onAllocateBuildingChange">
            <el-option v-for="b in buildingList" :key="b.id" :label="b.buildingName" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间">
          <el-select v-model="allocateForm.roomId" placeholder="请选择房间">
            <el-option v-for="r in availableRooms" :key="r.id" :label="r.roomNo + ' (容量' + r.capacity + ')'" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="床位号">
          <el-input v-model="allocateForm.bedNo" placeholder="请输入床位号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="allocateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAllocate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getBuildingList, addBuilding, updateBuilding, deleteBuilding,
  getRoomList, addRoom, updateRoom,
  getAllocationList, allocateDorm, deallocateDorm
} from '@/api/dorm'

const activeTab = ref('building')
const loading = ref(false)
const buildingList = ref([])
const roomList = ref([])
const allocationList = ref([])

const fetchBuildingList = async () => {
  loading.value = true
  try {
    const res = await getBuildingList()
    buildingList.value = res.data || res || []
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const fetchRoomList = async () => {
  loading.value = true
  try {
    const res = await getRoomList()
    roomList.value = res.data || res || []
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const fetchAllocationList = async () => {
  loading.value = true
  try {
    const res = await getAllocationList()
    allocationList.value = res.data || res || []
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const onTabChange = (tab) => {
  if (tab === 'building') fetchBuildingList()
  else if (tab === 'room') fetchRoomList()
  else if (tab === 'allocation') fetchAllocationList()
}

// 楼栋
const buildingDialogVisible = ref(false)
const buildingDialogTitle = ref('')
const buildingForm = reactive({ id: null, buildingNo: '', buildingName: '', floorCount: 1 })

const handleAddBuilding = () => {
  buildingDialogTitle.value = '新增楼栋'
  Object.assign(buildingForm, { id: null, buildingNo: '', buildingName: '', floorCount: 1 })
  buildingDialogVisible.value = true
}

const handleEditBuilding = (row) => {
  buildingDialogTitle.value = '编辑楼栋'
  Object.assign(buildingForm, row)
  buildingDialogVisible.value = true
}

const submitBuilding = async () => {
  try {
    if (buildingForm.id) {
      await updateBuilding(buildingForm)
      ElMessage.success('修改成功')
    } else {
      await addBuilding(buildingForm)
      ElMessage.success('新增成功')
    }
    buildingDialogVisible.value = false
    fetchBuildingList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDeleteBuilding = (row) => {
  ElMessageBox.confirm('确认删除该楼栋？', '提示', { type: 'warning' }).then(async () => {
    try {
      await deleteBuilding(row.id)
      ElMessage.success('删除成功')
      fetchBuildingList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 房间
const roomDialogVisible = ref(false)
const roomDialogTitle = ref('')
const roomForm = reactive({ id: null, buildingId: null, roomNo: '', capacity: 4 })

const handleAddRoom = () => {
  roomDialogTitle.value = '新增房间'
  Object.assign(roomForm, { id: null, buildingId: null, roomNo: '', capacity: 4 })
  roomDialogVisible.value = true
}

const handleEditRoom = (row) => {
  roomDialogTitle.value = '编辑房间'
  Object.assign(roomForm, row)
  roomDialogVisible.value = true
}

const submitRoom = async () => {
  try {
    if (roomForm.id) {
      await updateRoom(roomForm)
      ElMessage.success('修改成功')
    } else {
      await addRoom(roomForm)
      ElMessage.success('新增成功')
    }
    roomDialogVisible.value = false
    fetchRoomList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 分配
const allocateDialogVisible = ref(false)
const allocateForm = reactive({ studentId: '', buildingId: null, roomId: null, bedNo: '' })
const availableRooms = computed(() => {
  if (!allocateForm.buildingId) return []
  return roomList.value.filter(r => r.buildingId === allocateForm.buildingId && r.status === 1)
})

const handleAllocate = () => {
  Object.assign(allocateForm, { studentId: '', buildingId: null, roomId: null, bedNo: '' })
  allocateDialogVisible.value = true
}

const onAllocateBuildingChange = () => {
  allocateForm.roomId = null
}

const submitAllocate = async () => {
  try {
    await allocateDorm(allocateForm)
    ElMessage.success('分配成功')
    allocateDialogVisible.value = false
    fetchAllocationList()
  } catch (error) {
    ElMessage.error('分配失败')
  }
}

const handleRemoveAllocation = (row) => {
  ElMessageBox.confirm('确认办理退宿？', '提示', { type: 'warning' }).then(async () => {
    try {
      await deallocateDorm(row.id)
      ElMessage.success('退宿成功')
      fetchAllocationList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

onMounted(() => { fetchBuildingList() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
