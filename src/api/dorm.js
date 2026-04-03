import request from './request'

// 获取楼栋列表
export function getBuildingList() {
  return request.get('/svc/dorm/building/list')
}

// 新增楼栋
export function addBuilding(data) {
  return request.post('/svc/dorm/building', data)
}

// 修改楼栋
export function updateBuilding(data) {
  return request.put('/svc/dorm/building', data)
}

// 删除楼栋
export function deleteBuilding(id) {
  return request.delete(`/svc/dorm/building/${id}`)
}

// 获取房间列表
export function getRoomList(params) {
  return request.get('/svc/dorm/room/list', { params })
}

// 新增房间
export function addRoom(data) {
  return request.post('/svc/dorm/room', data)
}

// 修改房间
export function updateRoom(data) {
  return request.put('/svc/dorm/room', data)
}

// 删除房间
export function deleteRoom(id) {
  return request.delete(`/svc/dorm/room/${id}`)
}

// 获取住宿分配列表
export function getAllocationList(params) {
  return request.get('/svc/dorm/allocation/list', { params })
}

// 分配宿舍
export function allocateDorm(data) {
  return request.post('/svc/dorm/allocation', data)
}
