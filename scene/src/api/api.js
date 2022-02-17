import {request} from '@/network/request.js'

/**
  * 登陆
  */

export const login = data => request('post', '/api/admin/login', data);

/**
  * 退出
  */

export const signout = () => request('get', '/api/admin/signout');

/**
  * 获取用户信息
  */

export const getAdminInfo = () => request('get', '/api/admin/info');

/**
  * 更新游客的景点
  */

export const updateScene = data => request('post', '/api/vistor/updateScene', data);

/**
  * 获取游客数据
  */

export const getVistors = data => request('post', '/api/vistor/getVistors', data);

/**
  * 获取游客数量
  */

export const getVistorsCount = () => request('get', '/api/vistor/getVistorsCount');

/**
  * 删除指定游客
  */

export const deleteVistor = data => request('post', '/api/vistor/deleteVistor', data);




