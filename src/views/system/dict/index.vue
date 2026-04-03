<template>
  <div class="page-container">
    <el-row :gutter="16">
      <!-- 字典类型 -->
      <el-col :xs="24" :lg="10">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>字典类型</span>
              <el-button type="primary" @click="handleAddType">
                <el-icon><Plus /></el-icon>新增
              </el-button>
            </div>
          </template>
          <el-table :data="dictTypeList" v-loading="loading" highlight-current-row @current-change="handleTypeSelect">
            <el-table-column prop="dictName" label="字典名称" />
            <el-table-column prop="dictType" label="字典类型" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click.stop="handleEditType(row)">编辑</el-button>
                <el-button link type="danger" @click.stop="handleDeleteType(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 字典数据 -->
      <el-col :xs="24" :lg="14">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>字典数据 {{ selectedType ? `(${selectedType.dictName})` : '' }}</span>
              <el-button type="primary" :disabled="!selectedType" @click="handleAddData">
                <el-icon><Plus /></el-icon>新增数据
              </el-button>
            </div>
          </template>
          <el-table :data="dictDataList" v-loading="dataLoading">
            <el-table-column prop="dictLabel" label="字典标签" />
            <el-table-column prop="dictValue" label="字典值" />
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditData(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteData(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 类型对话框 -->
    <el-dialog v-model="typeDialogVisible" :title="typeDialogTitle" width="500px">
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="typeForm.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitType">确定</el-button>
      </template>
    </el-dialog>

    <!-- 数据对话框 -->
    <el-dialog v-model="dataDialogVisible" :title="dataDialogTitle" width="500px">
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dataForm.remark" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dataForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitData">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDictTypeList, addDictType, updateDictType, deleteDictType, getDictDataByType, addDictData, updateDictData, deleteDictData } from '@/api/dict'

const loading = ref(false)
const dataLoading = ref(false)
const dictTypeList = ref([])
const dictDataList = ref([])
const selectedType = ref(null)

// 类型对话框
const typeDialogVisible = ref(false)
const typeDialogTitle = ref('')
const isEditType = ref(false)
const typeFormRef = ref(null)
const typeForm = reactive({ id: null, dictName: '', dictType: '', remark: '', status: 1 })
const typeRules = { dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }], dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }] }

// 数据对话框
const dataDialogVisible = ref(false)
const dataDialogTitle = ref('')
const isEditData = ref(false)
const dataFormRef = ref(null)
const dataForm = reactive({ id: null, dictType: '', dictLabel: '', dictValue: '', sort: 0, remark: '', status: 1 })
const dataRules = { dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }], dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }] }

const fetchTypeList = async () => {
  loading.value = true
  try {
    const res = await getDictTypeList()
    dictTypeList.value = res || []
  } finally {
    loading.value = false
  }
}

const handleTypeSelect = async (row) => {
  selectedType.value = row
  if (row) {
    dataLoading.value = true
    try {
      const res = await getDictDataByType(row.dictType)
      dictDataList.value = res || []
    } finally {
      dataLoading.value = false
    }
  } else {
    dictDataList.value = []
  }
}

const handleAddType = () => {
  isEditType.value = false
  typeDialogTitle.value = '新增字典类型'
  Object.assign(typeForm, { id: null, dictName: '', dictType: '', remark: '', status: 1 })
  typeDialogVisible.value = true
}

const handleEditType = (row) => {
  isEditType.value = true
  typeDialogTitle.value = '编辑字典类型'
  Object.assign(typeForm, row)
  typeDialogVisible.value = true
}

const handleSubmitType = async () => {
  await typeFormRef.value.validate()
  try {
    if (isEditType.value) await updateDictType(typeForm)
    else await addDictType(typeForm)
    ElMessage.success('保存成功')
    typeDialogVisible.value = false
    fetchTypeList()
  } catch (error) { console.error(error) }
}

const handleDeleteType = (row) => {
  ElMessageBox.confirm(`确定要删除字典类型 "${row.dictName}" 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteDictType(row.id)
      ElMessage.success('删除成功')
      fetchTypeList()
    })
}

const handleAddData = () => {
  isEditData.value = false
  dataDialogTitle.value = '新增字典数据'
  Object.assign(dataForm, { id: null, dictType: selectedType.value.dictType, dictLabel: '', dictValue: '', sort: 0, remark: '', status: 1 })
  dataDialogVisible.value = true
}

const handleEditData = (row) => {
  isEditData.value = true
  dataDialogTitle.value = '编辑字典数据'
  Object.assign(dataForm, row)
  dataDialogVisible.value = true
}

const handleSubmitData = async () => {
  await dataFormRef.value.validate()
  try {
    if (isEditData.value) await updateDictData(dataForm)
    else await addDictData(dataForm)
    ElMessage.success('保存成功')
    dataDialogVisible.value = false
    handleTypeSelect(selectedType.value)
  } catch (error) { console.error(error) }
}

const handleDeleteData = (row) => {
  ElMessageBox.confirm(`确定要删除字典数据 "${row.dictLabel}" 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteDictData(row.id)
      ElMessage.success('删除成功')
      handleTypeSelect(selectedType.value)
    })
}

onMounted(() => { fetchTypeList() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
