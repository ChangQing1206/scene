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

/**
  * 获取顺序消费记录
  */

export const getOrders = data => request('get', '/api/vistor/getOrders', data);

/**
  * 获取按游客的消费记录
  */

export const getClientOrders = data => request('get', '/api/vistor/getClientOrders', data);

/**
  * 获取顺序消费记录的数量
  */

export const getOrdersCount = data => request('get', '/api/vistor/getOrdersCount', data);

/**
  * 获取顺序充值记录
  */

export const getDeposits = data => request('get', '/api/vistor/getDeposits', data);

/**
  * 获取按游客的充值记录
  */

export const getClientDeposits = data => request('get', '/api/vistor/getClientDeposits', data);

/**
  * 获取顺序充值记录的数量
  */

export const getDepositsCount = data => request('get', '/api/vistor/getDepositsCount', data);

/**
  * 商品分析
  */

export const goodsAnalyse = () => request('get', '/api/vistor/analyse/goods');

/**
  * 位置分析
  */

export const posAnalyse = () => request('get', '/api/vistor/analyse/position');

/** 
 * 创建门票
 */

export const createTicket = data => request('post', '/api/ticket/createTicket', data);

/** 
 * 获取门票信息
 */

export const getTickets = data => request('get', '/api/ticket/getTickets', data)

/** 
 * 获取门票数量
 */

export const getTicketsCount = () => request('get', '/api/ticket/getTicketsCount')

