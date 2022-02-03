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









