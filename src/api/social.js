import request from '@/utils/request'

// 保存字典
export const saveSocial = (data) => {
  return request({
    url: '/social',
    method: 'post',
    data: data
  })
}

// 更新部门
export const updateSocial = (data) => {
  return request({
    url: '/social',
    method: 'put',
    data: data
  })
}

/**
 * 社交登录账户模块
 * @param parms
 */

// 获取社交登录列表
export function getSocialList(parms) {
  return request({
    url: '/social',
    method: 'get',
    params: parms
  })
}

/**
 * 根据id删除岗位
 * @param parms
 */
export function untied(parms) {
  return request({
    url: '/social/untied',
    method: 'post',
    params: parms
  })
}
