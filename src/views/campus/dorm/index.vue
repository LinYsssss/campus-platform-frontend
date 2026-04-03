<template>
  <div class="page-container">
    <el-tabs v-model="activeTab" type="border-card">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBuildingList, getRoomList, getAllocationList } from '@/api/dorm'

const activeTab = ref('building')
const loading = ref(false)
const buildingList = ref([])
const roomList = ref([])
const allocationList = ref([])

const fetchBuildingList = async () => {
  try {
    const res = await getBuildingList()
    buildingList.value = res || []
  } catch (error) { console.error(error) }
}

const fetchRoomList = async () => {
  loading.value = true
  try {
    const res = await getRoomList()
    roomList.value = res || []
  } finally { loading.value = false }
}

const fetchAllocationList = async () => {
  loading.value = true
  try {
    const res = await getAllocationList()
    allocationList.value = res || []
  } finally { loading.value = false }
}

const handleAddBuilding = () => { ElMessage.info('新增楼栋功能开发中') }
const handleEditBuilding = (row) => { console.log('编辑楼栋', row) }
const handleDeleteBuilding = (row) => { console.log('删除楼栋', row) }
const handleAddRoom = () => { ElMessage.info('新增房间功能开发中') }
const handleEditRoom = (row) => { console.log('编辑房间', row) }
const handleAllocate = () => { ElMessage.info('分配宿舍功能开发中') }
const handleRemoveAllocation = (row) => { console.log('退宿', row) }

onMounted(() => { fetchBuildingList() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
