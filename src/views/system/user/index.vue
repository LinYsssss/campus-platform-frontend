<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="用户名/姓名" clearable />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.userType" placeholder="全部" clearable>
            <el-option label="学生" :value="0" />
            <el-option label="教师" :value="1" />
            <el-option label="管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="正常" :value="0" />
            <el-option label="停用" :value="1" />
            <el-option label="锁定" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增用户</el-button>
            <el-upload :show-file-list="false" :before-upload="handleImport" accept=".xlsx,.xls">
              <el-button><el-icon><Upload /></el-icon>批量导入</el-button>
            </el-upload>
            <el-button @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="userType" label="用户类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.userType === 0">学生</el-tag>
            <el-tag v-else-if="row.userType === 1" type="warning">教师</el-tag>
            <el-tag v-else type="danger">管理员</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="140">
          <template #default="{ row }">
            <el-tag v-for="name in row.roleNames" :key="name" size="small" style="margin: 2px;">{{ name }}</el-tag>
            <span v-if="!row.roleNames || row.roleNames.length === 0" style="color: #909399;">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : row.status === 1 ? 'danger' : 'warning'">
              {{ row.status === 0 ? '正常' : row.status === 1 ? '停用' : '锁定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="学号/工号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" type="password" placeholder="至少6位" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户类型" prop="userType">
              <el-select v-model="formData.userType" placeholder="请选择" style="width: 100%;">
                <el-option label="学生" :value="0" />
                <el-option label="教师" :value="1" />
                <el-option label="管理员" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="formData.gender" placeholder="请选择" style="width: 100%;">
                <el-option label="未知" :value="0" />
                <el-option label="男" :value="1" />
                <el-option label="女" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="手机号"><el-input v-model="formData.phone" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="邮箱"><el-input v-model="formData.email" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="院系/部门"><el-input v-model="formData.deptName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="班级"><el-input v-model="formData.className" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="角色">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%;">
            <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="formData.remark" type="textarea" rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPage, addUser, updateUser, deleteUser, resetPassword, importUser, exportUser } from '@/api/user'
import { getRoleList } from '@/api/role'

const searchForm = reactive({ keyword: '', userType: null, status: null })
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const roleList = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const submitLoading = ref(false)

const formData = reactive({
  id: null, username: '', password: '', realName: '', gender: 0,
  phone: '', email: '', deptName: '', className: '', userType: null, roleIds: [], remark: ''
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserPage({ ...searchForm, pageNum: pagination.pageNum, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const fetchRoleList = async () => {
  try { roleList.value = (await getRoleList()) || [] } catch (e) { console.error(e) }
}

const handleSearch = () => { pagination.pageNum = 1; fetchData() }
const handleReset = () => { searchForm.keyword = ''; searchForm.userType = null; searchForm.status = null; handleSearch() }

const handleAdd = () => {
  isEdit.value = false; dialogTitle.value = '新增用户'
  Object.assign(formData, { id: null, username: '', password: '', realName: '', gender: 0, phone: '', email: '', deptName: '', className: '', userType: null, roleIds: [], remark: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true; dialogTitle.value = '编辑用户'
  Object.assign(formData, { id: row.id, username: row.username, realName: row.realName, gender: row.gender, phone: row.phone, email: row.email, deptName: row.deptName, className: row.className, userType: row.userType, roleIds: [], remark: row.remark })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) await updateUser(formData); else await addUser(formData)
    ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
    dialogVisible.value = false; fetchData()
  } catch (e) { console.error(e) } finally { submitLoading.value = false }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.realName}" 吗？`, '提示', { type: 'warning' })
    .then(async () => { await deleteUser(row.id); ElMessage.success('删除成功'); fetchData() })
}

const handleResetPwd = (row) => {
  ElMessageBox.prompt(`重置 "${row.realName}" 的密码`, '重置密码', {
    confirmButtonText: '确定', cancelButtonText: '取消',
    inputPattern: /^.{6,20}$/, inputErrorMessage: '密码长度6-20位', inputPlaceholder: '请输入新密码'
  }).then(async ({ value }) => { await resetPassword(row.id, value); ElMessage.success('密码已重置') })
}

const handleImport = async (file) => {
  try { const res = await importUser(file); ElMessage.success(res || '导入成功'); fetchData() } catch (e) { console.error(e) }
  return false
}

const handleExport = async () => {
  try {
    const res = await exportUser(searchForm)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '用户数据.xlsx'; a.click(); URL.revokeObjectURL(url)
  } catch (e) { console.error(e) }
}

const handleSizeChange = (val) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val) => { pagination.pageNum = val; fetchData() }

onMounted(() => { fetchData(); fetchRoleList() })
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions { display: flex; gap: 10px; }
</style>
