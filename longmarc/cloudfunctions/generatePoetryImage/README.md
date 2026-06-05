# 通义万相API集成说明

## 🔑 API Key 获取步骤

### 1. 登录阿里云控制台
- 访问：https://dashscope.console.aliyun.com/
- 使用您的阿里云账号登录

### 2. 开通通义万相服务
- 在控制台中找到"通义万相"服务
- 点击开通服务（可能需要实名认证）
- 确认服务状态为"已开通"

### 3. 获取API Key
- 进入"API Key管理"页面
- 点击"创建新的API Key"
- 复制生成的API Key（格式类似：sk-xxxxxxxxxx）

### 4. 配置API Key
有两种方式配置API Key：

#### 方式一：修改配置文件
编辑 `config.js` 文件：
```javascript
API_KEY: 'your-actual-api-key-here', // 替换为您的实际API Key
```

#### 方式二：环境变量（推荐）
在云函数环境中设置环境变量：
- 变量名：`WANX_API_KEY`
- 变量值：您的实际API Key

## 📋 API 信息

### 基础信息
- **API URL**: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis`
- **模型名称**: `wanx-v1`
- **认证方式**: Bearer Token
- **请求格式**: JSON

### 支持的绘画风格
- `chinese_painting`: 中国画
- `realistic`: 写实
- `oil_painting`: 油画
- `watercolor`: 水彩
- `sketch`: 素描
- `anime`: 动漫

### 支持的图片尺寸
- `1024*1024`: 正方形
- `720*1280`: 竖屏
- `1280*720`: 横屏

## 🚀 使用方法

### 1. 部署云函数
```bash
# 在云函数目录下执行
npm install
```

### 2. 配置API Key
按照上述步骤配置您的API Key

### 3. 调用示例
```javascript
// 在小程序中调用
const result = await wx.cloud.callFunction({
  name: 'generatePoetryImage',
  data: {
    poetry: '红军不怕远征难，万水千山只等闲',
    style: 'chinese_painting',
    size: '1024x1024'
  }
});
```

## 🔧 故障排除

### 常见问题

1. **API Key 无效**
   - 检查API Key是否正确复制
   - 确认API Key有图像生成权限
   - 检查阿里云账户是否有足够余额

2. **请求超时**
   - 图片生成通常需要10-30秒
   - 已设置30秒超时，如仍超时可联系技术支持

3. **生成失败**
   - 检查诗词内容是否符合规范
   - 查看云函数日志了解详细错误信息

### 日志查看
在微信开发者工具中：
1. 打开"云开发"控制台
2. 进入"云函数"页面
3. 找到"generatePoetryImage"函数
4. 点击"日志"查看详细调用信息

## 📞 技术支持

如果遇到问题，请：
1. 查看云函数日志
2. 检查API Key配置
3. 确认网络连接正常
4. 联系阿里云技术支持

## 💡 注意事项

- API Key请妥善保管，不要在代码中硬编码
- 建议使用环境变量管理敏感信息
- 定期检查API调用量和费用
- 遵守阿里云服务使用条款
