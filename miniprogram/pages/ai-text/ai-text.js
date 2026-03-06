// 引入加密库
const CryptoJS = require('../../utils/crypto-js');

// 腾讯云混元大模型配置
const HUNYUAN_CONFIG = {
  SECRET_ID: 'AKIDeBVcXEKEuOehjZDk7LfokeR3RI2bw3wb',
  SECRET_KEY: 'UkmmfLo4A3iDamrjNr8BEAtPjrDNa1Pe',
  MODEL: 'hunyuan-turbos-latest',
  REGION: 'ap-beijing',
  ENDPOINT: 'hunyuan.tencentcloudapi.com'
};

// 构建提示词
function buildEnhancedPrompt(userInput, type, style) {
  const typeDescriptions = {
    'poetry': '创作一首关于长征主题的诗词，',
    'prose': '创作一段关于长征主题的散文，',
    'story': '创作一个关于长征主题的短故事，'
  };

  const styleDescriptions = {
    'classical': '使用古典风格，语言优美，意境深远，',
    'modern': '使用现代风格，语言通俗易懂，情感真挚，',
    'heroic': '使用豪迈风格，气势磅礴，充满力量，'
  };

  const typeDesc = typeDescriptions[type] || '创作内容，';
  const styleDesc = styleDescriptions[style] || '';
  
  return `请${typeDesc}以"${userInput}"为主题，${styleDesc}内容要积极向上，体现长征精神，字数适中，语言流畅自然。注意：禁止使用任何Markdown格式符号（如##、**、#、*等）。`;
}

// 生成TC3-HMAC-SHA256签名
function generateTC3Signature(secretKey, timestamp, payload) {
  try {
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    
    // 步骤1: 生成签名日期
    const kDate = CryptoJS.HmacSHA256(date, "TC3" + secretKey);
    
    // 步骤2: 生成签名服务
    const kService = CryptoJS.HmacSHA256("hunyuan", kDate);
    
    // 步骤3: 生成签名请求
    const kSigning = CryptoJS.HmacSHA256("tc3_request", kService);
    
    // 步骤4: 生成签名
    const signature = CryptoJS.HmacSHA256(payload, kSigning);
    
    return CryptoJS.enc.Hex.stringify(signature);
  } catch (error) {
    console.error('生成签名失败:', error);
    throw error;
  }
}

// 调用腾讯云混元大模型API
async function callHunyuanAPI(prompt) {
  try {
    if (!HUNYUAN_CONFIG.SECRET_ID || !HUNYUAN_CONFIG.SECRET_KEY) {
      throw new Error('腾讯云混元大模型API密钥未配置完整');
    }
    
    // 构建请求体
    const requestBody = {
      Model: HUNYUAN_CONFIG.MODEL,
      Messages: [
        {
          Role: "system",
          Content: "简短回答，专注于用户要求的内容"
        },
        {
          Role: "user",
          Content: prompt
        }
      ],
      Stream: false,
      TopP: 1.0,
      Temperature: 0.7
    };
    
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    
    // 构建规范请求
    const hashedRequestPayload = CryptoJS.SHA256(JSON.stringify(requestBody)).toString(CryptoJS.enc.Hex);
    const httpRequestMethod = "POST";
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders = "content-type:application/json\nhost:" + HUNYUAN_CONFIG.ENDPOINT + "\n";
    const signedHeaders = "content-type;host";
    
    const canonicalRequest = httpRequestMethod + "\n" +
                           canonicalUri + "\n" +
                           canonicalQueryString + "\n" +
                           canonicalHeaders + "\n" +
                           signedHeaders + "\n" +
                           hashedRequestPayload;
    
    const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
    
    // 构建待签字符串
    const algorithm = "TC3-HMAC-SHA256";
    const credentialScope = date + "/hunyuan/tc3_request";
    const stringToSign = algorithm + "\n" +
                        timestamp + "\n" +
                        credentialScope + "\n" +
                        hashedCanonicalRequest;
    
    // 生成签名
    const signature = generateTC3Signature(HUNYUAN_CONFIG.SECRET_KEY, timestamp, stringToSign);
    
    // 构建Authorization头
    const authorization = algorithm + " " +
                         "Credential=" + HUNYUAN_CONFIG.SECRET_ID + "/" + credentialScope + ", " +
                         "SignedHeaders=" + signedHeaders + ", " +
                         "Signature=" + signature;
    
    const url = `https://${HUNYUAN_CONFIG.ENDPOINT}`;
    
    console.log('请求URL:', url);
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': authorization,
          'Host': HUNYUAN_CONFIG.ENDPOINT,
          'X-TC-Action': 'ChatCompletions',
          'X-TC-Version': '2023-09-01',
          'X-TC-Timestamp': timestamp.toString(),
          'X-TC-Region': HUNYUAN_CONFIG.REGION
        },
        data: requestBody,
        timeout: 15000,
        success: (res) => {
          console.log('API响应状态码:', res.statusCode);
          console.log('API响应数据:', JSON.stringify(res.data, null, 2));
          
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP错误: ${res.statusCode}`));
            return;
          }
          
          if (res.data && res.data.Response && res.data.Response.Error) {
            const error = res.data.Response.Error;
            reject(new Error(`API错误: ${error.Message} (错误码: ${error.Code})`));
            return;
          }
          
          if (res.data?.Response?.Choices?.[0]?.Message?.Content) {
            resolve(res.data.Response.Choices[0].Message.Content);
          } else {
            console.log('响应结构:', res.data);
            reject(new Error('未获取到生成内容'));
          }
        },
        fail: (error) => {
          console.error('请求失败详情:', error);
          reject(new Error('网络请求失败: ' + error.errMsg));
        }
      });
    });
  } catch (error) {
    console.error('API调用异常:', error);
    throw error;
  }
}

// 生成文本函数
async function generatePoetryText(keywords, type = 'poetry', style = 'classical') {
  if (!keywords || !keywords.trim()) {
    return {
      code: -1,
      message: '关键词内容不能为空'
    };
  }

  try {
    const enhancedPrompt = buildEnhancedPrompt(keywords, type, style);
    console.log('最终提示词:', enhancedPrompt);
    
    const generatedText = await callHunyuanAPI(enhancedPrompt);
    
    if (generatedText) {
      return {
        code: 0,
        data: {
          text: generatedText,
          keywords: keywords,
          type: type,
          style: style,
          generationMethod: 'hunyuan_api',
          timestamp: Date.now()
        },
        message: '生成成功'
      };
    } else {
      throw new Error('文本生成失败');
    }

  } catch (error) {
    console.error('生成文本失败:', error);
    return {
      code: -1,
      message: '文本生成失败: ' + error.message
    };
  }
}


Page({
  data: {
    inputText: '',
    selectedType: 'poetry',
    selectedStyle: 'classical',
    isGenerating: false,
    generatedText: '',
    generatedTime: '',
    historyList: [],
    backgroundImage: '',
    typeMap: {
      'poetry': '诗词创作',
      'prose': '散文创作',
      'story': '故事创作'
    },
    styleMap: {
      'classical': '古典风格',
      'modern': '现代风格',
      'heroic': '豪迈风格'
    }
  },

  async onLoad() {
    console.log('AI文生文页面加载完成');
    await this.loadBackgroundImage();
    this.loadHistory();
  },

  async loadBackgroundImage() {
    try {
      const app = getApp();
      const backgroundImageUrl = await app.getImageUrl('文生文.jpg');
      this.setData({ backgroundImage: backgroundImageUrl });
    } catch (error) {
      console.error('加载背景图片失败:', error);
    }
  },

  goBack() {
    wx.navigateBack();
  },

  onTextInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  selectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  selectStyle(e) {
    this.setData({ selectedStyle: e.currentTarget.dataset.style });
  },

  async startCreation() {
    if (!this.data.inputText.trim()) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }

    this.setData({ isGenerating: true });

    try {
      const result = await generatePoetryText(
        this.data.inputText.trim(),
        this.data.selectedType,
        this.data.selectedStyle
      );

      if (result.code === 0 && result.data?.text) {
        const now = new Date();
        const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

        this.setData({
          generatedText: result.data.text,
          generatedTime: timeStr
        });

        this.saveToHistory(result.data.text, this.data.selectedType, this.data.selectedStyle, timeStr);
        
      
        wx.hideLoading();
        wx.showLoading({ title: '创作成功！', mask: true });
       
        setTimeout(() => {
          wx.hideLoading();
        }, 1500);
      } else {
        throw new Error(result.message || '文本生成失败');
      }
    } catch (error) {
     
      wx.hideLoading();
      wx.showModal({
        title: '创作失败',
        content: error.message || '未知错误',
        showCancel: false
      });
      this.setData({ generatedText: `错误: ${error.message}` });
    } finally {
      this.setData({ isGenerating: false });
      try {
        wx.hideLoading();
      } catch (e) {
      }
    }
  },

  regenerateText() {
    this.setData({ generatedText: '' });
    this.startCreation();
  },

  copyText() {
    if (!this.data.generatedText) {
      wx.showToast({ title: '没有可复制的文本', icon: 'none' });
      return;
    }

    wx.setClipboardData({
      data: this.data.generatedText,
      success: () => wx.showToast({ title: '复制成功', icon: 'success' }),
      fail: () => wx.showToast({ title: '复制失败', icon: 'none' })
    });
  },

// 分享功能
shareText() {
  if (!this.data.generatedText) {
    wx.showToast({ 
      title: '没有可分享的文本', 
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 使用微信的分享面板
  wx.showActionSheet({
    itemList: ['分享给好友', '分享到朋友圈'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 分享给好友
        this.shareToFriend();
      } else if (res.tapIndex === 1) {
        // 分享到朋友圈
        this.shareToTimeline();
      }
    },
    fail: (err) => {
      console.log('分享操作取消', err);
    }
  });
},

// 分享给好友
  shareToFriend() {
   
    wx.showToast({
      title: '请点击右上角分享给好友',
      icon: 'none',
      duration: 2000
    });
  },

  // 分享到朋友圈
  shareToTimeline() {
    wx.showToast({
      title: '请点击右上角分享到朋友圈',
      icon: 'none', 
      duration: 2000
    });
  },

  selectHistoryItem(e) {
    const index = e.currentTarget.dataset.index;
    const historyItem = this.data.historyList[index];
    this.setData({
      generatedText: historyItem.content,
      selectedType: historyItem.type,
      selectedStyle: historyItem.style,
      generatedTime: historyItem.time
    });
  },

  saveToHistory(content, type, style, time) {
    const historyItem = { content, type, style, time, timestamp: Date.now() };
    let historyList = [...this.data.historyList];
    historyList.unshift(historyItem);
    if (historyList.length > 10) historyList = historyList.slice(0, 10);
    this.setData({ historyList });
    wx.setStorageSync('textHistory', historyList);
  },

  loadHistory() {
    try {
      const historyList = wx.getStorageSync('textHistory') || [];
      this.setData({ historyList });
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  },

  // 添加分享到好友功能
  onShareAppMessage(options) {
    const shareInfo = {
      title: '长征精神AI创作 - ' + (this.data.inputText || '文生文创作'),
      path: '/pages/ai-text/ai-text',
      imageUrl: '' // 留空，微信会自动生成截图
    };
    
    // 如果有生成的内容，可以分享具体内容
    if (this.data.generatedText) {
      shareInfo.title = `AI创作：${this.data.inputText || '长征主题作品'}`;
      // 分享文本内容有限制，不能太长
      const shareContent = this.data.generatedText.length > 50 
        ? this.data.generatedText.substring(0, 50) + '...' 
        : this.data.generatedText;
      shareInfo.desc = shareContent;
    }
    
    console.log('分享信息:', shareInfo);
    return shareInfo;
  },

  // 添加分享到朋友圈功能
  onShareTimeline() {
    const timelineInfo = {
      title: '长征精神AI创作 - ' + (this.data.inputText || '文生文创作'),
      // 朋友圈分享可以设置图片
      imageUrl: '' 
    };
    
    // 如果有生成的内容
    if (this.data.generatedText) {
      timelineInfo.title = `AI创作：${this.data.inputText || '长征主题作品'}`;
    }
    
    console.log('朋友圈分享信息:', timelineInfo);
    return timelineInfo;
  }
});