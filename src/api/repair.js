import request from './request'

// 获取报修分页
export function getRepairPage(params) {
  return request.get('/svc/repair/page', { params })
}

// 获取我的报修
export function getMyRepairs(params) {
  return request.get('/svc/repair/my', { params })
}

// 提交报修
export function submitRepair(data) {
  return request.post('/svc/repair', data)
}

// 更新报修状态
export function updateRepairStatus(id, status) {
  return request.put(`/svc/repair/${id}/status`, { status })
}
