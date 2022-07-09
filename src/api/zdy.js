import request from '@/utils/request'

// 删除所有异常日志
export const deleteTenant1 = () => {
  return request({
    url: '/log/deleteLast',
    method: 'delete'
  })
}

