import request from './request'

// 获取评价列表
export function getEvaluationPage(params) {
  return request.get('/edu/evaluation/page', { params })
}

// 提交课程评价
export function submitEvaluation(data) {
  return request.post('/edu/evaluation', data)
}

// 获取我的评价
export function getMyEvaluations(params) {
  return request.get('/edu/evaluation/my', { params })
}
