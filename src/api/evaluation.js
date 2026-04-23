import request from './request'

// 获取评价列表
export function getEvaluationPage(params) {
  return request.get('/edu/evaluation/page', { params })
}

// 提交课程评价
export function submitEvaluation(data) {
  return request.post('/edu/evaluation', data)
}

// 删除评价（管理员）
export function deleteEvaluation(id) {
  return request.delete(`/edu/evaluation/${id}`)
}
