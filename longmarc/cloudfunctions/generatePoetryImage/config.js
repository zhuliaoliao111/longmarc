// 通义万相API配置
module.exports = {
  // 通义万相API配置
  WANX_CONFIG: {
    // API基础URL
    BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    
    // 模型名称
    MODEL: 'wanx-v1',
    
    // API Key - 请替换为您的实际API Key
    // 获取方式：阿里云控制台 -> 通义万相 -> API Key管理
    API_KEY:'sk-50fc0044cffc4ad99e4ff4807cd96818',
    
    // 请求配置
    REQUEST_CONFIG: {
      timeout: 30000, // 30秒超时
      retryCount: 3,  // 重试次数
    }
  },

  // 支持的绘画风格
  SUPPORTED_STYLES: {
    'chinese_painting': '中国画',
    'realistic': '写实',
    'oil_painting': '油画',
    'watercolor': '水彩',
    'sketch': '素描',
    'anime': '动漫'
  },

  // 支持的图片尺寸
  SUPPORTED_SIZES: [
    '1024*1024',
    '720*1280',
    '1280*720'
  ]
};
