import request from './request'

// 成绩分页查询
export function getScorePage(params) {
  return request.get('/edu/score/page', { params })
}

// 获取我的成绩
export function getMyScores(params) {
  return request.get('/edu/score/my', { params })
}

// 新增成绩
export function addScore(data) {
  return request.post('/edu/score', data)
}

// 批量导入成绩
export function batchImportScore(data) {
  return request.post('/edu/score/batch-import', data)
}

// 提交成绩审核
export function submitScoreAudit(id) {
  return request.post(`/edu/score/${id}/submit`)
}

// 管理员审核成绩
export function auditScore(data) {
  return request.put('/edu/score/audit', data)
}

// 提交成绩申诉
export function submitScoreAppeal(data) {
  return request.post('/edu/score/appeal', data)
}

// 获取申诉列表
export function getScoreAppealPage(params) {
  return request.get('/edu/score/appeal/page', { params })
}
