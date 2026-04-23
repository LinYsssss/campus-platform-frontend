import request from './request'

// 成绩分页查询
export function getScorePage(params) {
  return request.get('/edu/score/page', { params })
}

// 新增成绩
export function addScore(data) {
  return request.post('/edu/score', data)
}

// 批量导入成绩
export function importScore(file, courseId, semester) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/edu/score/import?courseId=${courseId}&semester=${semester}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 更新成绩
export function updateScore(data) {
  return request.put('/edu/score', data)
}

// 管理员审核成绩
export function auditScore(id, status, remark) {
  return request.put(`/edu/score/${id}/audit`, null, { params: { status, remark } })
}

// 提交成绩申诉
export function submitScoreAppeal(data) {
  return request.post('/edu/score/appeal', data)
}

// 获取申诉列表
export function getScoreAppealPage(params) {
  return request.get('/edu/score/appeal/page', { params })
}

// 处理成绩申诉
export function handleScoreAppeal(id, status, result) {
  return request.put(`/edu/score/appeal/${id}/handle`, null, { params: { status, result } })
}
