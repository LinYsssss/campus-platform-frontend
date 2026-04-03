import request from './request'

// 课程分页查询
export function getCoursePage(params) {
  return request.get('/edu/course/page', { params })
}

// 获取课程详情
export function getCourseById(id) {
  return request.get(`/edu/course/${id}`)
}

// 新增课程
export function addCourse(data) {
  return request.post('/edu/course', data)
}

// 修改课程
export function updateCourse(data) {
  return request.put('/edu/course', data)
}

// 删除课程
export function deleteCourse(id) {
  return request.delete(`/edu/course/${id}`)
}

// 获取教师课程列表
export function getTeacherCourses(params) {
  return request.get('/edu/course/teacher/list', { params })
}

// 获取学生课程列表
export function getStudentCourses(params) {
  return request.get('/edu/course/student/list', { params })
}
