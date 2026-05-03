import axios, { type AxiosRequestConfig } from 'axios';
import qs from 'qs';

axios.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 1) {
      // toast.error(res.msg);
      alert(res.msg);
      return Promise.reject(res.msg);
    } else {
      return res.data;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 类型工具：提取 API 响应中 data 字段的类型
type ExtractDataType<T> = T extends { data: infer D } ? D : T;

export const customAxiosInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<ExtractDataType<T>> => {
  // 直接返回 axios 调用的结果
  // 响应拦截器已经处理了数据解构，返回的就是最终的业务数据
  config.baseURL = 'http://localhost:8080/api';
  return axios({
    paramsSerializer: (params) => qs.stringify(params, { encode: true }),
    ...config,
    ...options,
  }) as Promise<ExtractDataType<T>>;
};
