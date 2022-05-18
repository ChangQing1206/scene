import axios from 'axios';
import qs from 'qs'
axios.defaults.withCredentials=true;

// axios 配置
var instance = axios.create({
  // content-type 决定浏览器将以什么形式、什么编码读取这个文件
    headers:{
        'Content-Type': 'application/json', // json格式
    },
    timeout: 30000,
    // baseURL: '',   //接口请求地址
    baseURL: 'http://localhost:3000', // 后端地址 baseURL固定写法
})


// 添加请求拦截器
instance.interceptors.request.use(config => {
    console.log("这是拦截请求");
    
    console.log("", config);
    console.log(config.url)
    if(config.url !== "/api/admin/register") {
        var user_token = localStorage.getItem("user_token")
        if(user_token) {
            config.headers.Authorization = `Bearer ${user_token}`
        }
    }
    return config
}, error => {
    // 对请求错误做些什么
    
    console.log(error) // for debug
    return Promise.reject(error);
})

// 添加响应拦截器
instance.interceptors.response.use(response => {
    return response;
}, error => {
    // 对响应错误做点什么
    console.log('err' + error)// for debug
    return Promise.reject(error);
});

export default instance;

/**
 * post 请求方法
 * @param url
 * @param data
 * @returns {Promise}
 */

/**
 * get 请求方法
 * @param url
 * @param data
 * @returns {Promise}
 */


/**
 * 封装所有请求
 * @param methed
 * @param url
 * @param data 
 * @param headers
 * @returns {Promise}
 */
export function request(methed,url, data = {},headers) {
    return new Promise((resolve, reject) => {
        
        instance({
            method: methed || 'post', // 如果不传methed，默认是post
            url:url,
            params: methed === 'get' ? data :'',
            data: methed !== 'get' ?  data :'',
            headers: headers || {'Content-Type':'application/json'},
        })
        .then(response => {
            //对接口错误码做处理
            resolve(response.data);
        })
        .catch(err => {
            reject(err)
        })
    })
}