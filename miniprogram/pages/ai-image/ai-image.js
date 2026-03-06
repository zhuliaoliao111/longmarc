// 引入加密库
const CryptoJS = require('../../utils/crypto-js');

// 腾讯云混元文生图配置
const IMAGE_CONFIG = {
  SECRET_ID: 'AKIDLbeU6VN6aruiLvISRCj1BE6oKfyIWWLx', 
  SECRET_KEY: 'Xr44d1HLAk6yhCSUHtITQ9j7HCsKZZMw', 
  ENDPOINT: 'hunyuan.tencentcloudapi.com',
  REGION: 'ap-guangzhou',
  ACTION: 'TextToImageLite',
  VERSION: '2023-09-01'
};

// 风格到提示词的映射
const STYLE_PROMPTS = {
  'revolutionary_illustration': '历史主题插画风格，人物形象与场景适配，场景庄重',
  'red_theme_print': '主题版画风格，线条简洁有力，色彩对比鲜明',
  'revolutionary_print': '主题版画，黑白对比鲜明，构图稳重',
  'route_drawing': '路线图绘风格，地图元素清晰，路线明确',
  'historical_oil': '历史场景油画风格，色彩厚重，细节丰富',
  'red_memory_sketch': '纯素描风格，铅笔线条，黑白灰调，无文字无装饰'
};

// 构建图片生成提示词，修改为更安全的描述
function buildImagePrompt(userInput, style) {
  const styleDesc = STYLE_PROMPTS[style] || '历史主题风格';
  
  // 使用更安全的词汇替换可能敏感的内容
  const safeUserInput = userInput
    .replace(/长征/g, '历史征程')
    .replace(/红军/g, '历史队伍')
    .replace(/革命/g, '历史进程')
    .replace(/红色/g, '主题色彩')
    .replace(/精神/g, '意志品质');
  
  return `请根据以下要求生成图片：
主题内容：${safeUserInput}
艺术风格：${styleDesc}
场景类型：历史主题
时代背景：近现代时期，战争年代
氛围特点：符合用户要求
构图要求：主体突出，视角合适
图片要求：内容积极健康，向上向善`;
}

// 生成TC3-HMAC-SHA256签名
function generateTC3Signature(secretKey, timestamp, payload) {
  try {
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    
    const kDate = CryptoJS.HmacSHA256(date, "TC3" + secretKey);
    const kService = CryptoJS.HmacSHA256("hunyuan", kDate);
    const kSigning = CryptoJS.HmacSHA256("tc3_request", kService);
    const signature = CryptoJS.HmacSHA256(payload, kSigning);
    
    return CryptoJS.enc.Hex.stringify(signature);
  } catch (error) {
    console.error('生成签名失败:', error);
    throw new Error('签名生成失败: ' + error.message);
  }
}

// 调用腾讯云文生图API
async function callTextToImageAPI(prompt, style) {
  try {
    console.log('开始调用文生图API...');
    //调试信息
    if (!IMAGE_CONFIG.SECRET_ID || !IMAGE_CONFIG.SECRET_KEY) {
      throw new Error('腾讯云文生图API密钥未配置完整，检查SECRET_ID和SECRET_KEY');
    }
    
    // 构建请求体
    const requestBody = {
      Prompt: prompt,
      NegativePrompt: "现代服饰，现代建筑，卡通风格，失真比例，彩色头发，机械元素，科幻场景，模糊不清，杂乱无章，不符合历史年代的物品，过度明亮，英文乱码",
      Resolution: "1024:1024",
      LogoAdd: 0,
      RspImgType: "url"
    };
    
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    
    // 构建规范请求
    const hashedRequestPayload = CryptoJS.SHA256(JSON.stringify(requestBody)).toString(CryptoJS.enc.Hex);
    const httpRequestMethod = "POST";
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders = "content-type:application/json\nhost:" + IMAGE_CONFIG.ENDPOINT + "\n";
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
    const signature = generateTC3Signature(IMAGE_CONFIG.SECRET_KEY, timestamp, stringToSign);
    
    // 构建Authorization头
    const authorization = algorithm + " " +
                         "Credential=" + IMAGE_CONFIG.SECRET_ID + "/" + credentialScope + ", " +
                         "SignedHeaders=" + signedHeaders + ", " +
                         "Signature=" + signature;
    
    const url = `https://${IMAGE_CONFIG.ENDPOINT}`;
    
    console.log('API请求URL:', url);
    console.log('API请求体:', JSON.stringify(requestBody, null, 2));
    console.log('时间戳:', timestamp);
    console.log('签名范围:', credentialScope);
    console.log('使用Region:', IMAGE_CONFIG.REGION);
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': authorization,
          'Host': IMAGE_CONFIG.ENDPOINT,
          'X-TC-Action': IMAGE_CONFIG.ACTION,
          'X-TC-Version': IMAGE_CONFIG.VERSION,
          'X-TC-Timestamp': timestamp.toString(),
          'X-TC-Region': IMAGE_CONFIG.REGION
        },
        data: requestBody,
        timeout: 30000,
        success: (res) => {
          console.log('API响应状态码:', res.statusCode);
          console.log('API完整响应:', JSON.stringify(res.data, null, 2));
          
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP请求失败，状态码: ${res.statusCode}`));
            return;
          }
          
          if (res.data && res.data.Response && res.data.Response.Error) {
            const error = res.data.Response.Error;
            reject(new Error(`腾讯云API错误: ${error.Message} (错误码: ${error.Code})`));
            return;
          }
          
          if (res.data?.Response?.ResultImage) {
            console.log('图片生成成功，URL:', res.data.Response.ResultImage);
            resolve(res.data.Response.ResultImage);
          } else {
            console.error('响应数据格式错误:', res.data);
            reject(new Error('API返回数据格式不正确，未找到图片URL'));
          }
        },
        fail: (error) => {
          console.error('网络请求失败:', error);
          let errorMsg = '网络请求失败';
          if (error.errMsg) {
            if (error.errMsg.includes('fail') && error.errMsg.includes('url')) {
              errorMsg = '网络连接失败，请检查域名配置和网络连接';
            } else {
              errorMsg = error.errMsg;
            }
          }
          reject(new Error(errorMsg));
        }
      });
    });
  } catch (error) {
    console.error('API调用异常:', error);
    throw new Error('API调用过程异常: ' + error.message);
  }
}

// 生成图片函数
async function generatePoetryImage(poetry, style = 'revolutionary_illustration') {
  if (!poetry || !poetry.trim()) {
    return {
      code: -1,
      message: '创作内容不能为空'
    };
  }

  try {
    console.log('开始生成图片，内容:', poetry, '风格:', style);
    
    let enhancedPrompt;
    if (style === 'red_memory_sketch') {
      enhancedPrompt = `黑白铅笔素描，${poetry}，纯艺术效果，无文字无边框无装饰`;
    } else {
      enhancedPrompt = buildImagePrompt(poetry, style);
    }
    
    console.log('生成的提示词:', enhancedPrompt);
    
    const imageUrl = await callTextToImageAPI(enhancedPrompt, style);
    
    if (imageUrl) {
      return {
        code: 0,
        data: {
          imageUrl: imageUrl,
          poetry: poetry,
          style: style,
          generationMethod: 'hunyuan_image_api',
          timestamp: Date.now()
        },
        message: '图片生成成功'
      };
    } else {
      throw new Error('API返回的图片URL为空');
    }

  } catch (error) {
    console.error('生成图片过程失败:', error);
    return {
      code: -1,
      message: error.message || '图片生成失败'
    };
  }
}

// 验证图片URL
function validateImageUrl(url) {
  if (!url) {
    return false;
  }
  
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(url)) {
    console.error('无效的图片URL:', url);
    return false;
  }
  
  return true;
}

// 检查网络状态
function checkNetworkStatus() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        console.log('当前网络类型:', networkType);
        
        if (networkType === 'none') {
          wx.showToast({
            title: '网络未连接',
            icon: 'none'
          });
          resolve(false);
        } else {
          resolve(true);
        }
      },
      fail: () => {
        resolve(true);
      }
    });
  });
}

Page({
  data: {
    inputText: '',
    selectedStyle: 'revolutionary_illustration',
    isGenerating: false,
    generatedImage: '',
    backgroundImage: '',
    styleMap: {
      'revolutionary_illustration': '革命历史插画',
      'red_theme_print': '红色主题版画',
      'revolutionary_print': '革色主题版画',
      'route_drawing': '长征路线图绘',
      'red_memory_sketch': '红色记忆素描',
      'historical_oil': '历史场景油画'
    }
  },

  async onLoad() {
    console.log('AI文生图页面加载完成');
    await this.loadBackgroundImage();
  },

  // 加载背景图片URL
  async loadBackgroundImage() {
    try {
      const app = getApp();
      const backgroundImageUrl = await app.getImageUrl('文生图.jpg');
      this.setData({
        backgroundImage: backgroundImageUrl
      });
      console.log('背景图片加载完成');
    } catch (error) {
      console.error('加载背景图片失败:', error);
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/challenge/challenge'
        });
      }
    });
  },

  // 文本输入
  onTextInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 选择风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({
      selectedStyle: style
    });
  },

  // 开始创作
  async startCreation() {
    if (!this.data.inputText.trim()) {
      wx.showToast({
        title: '请输入AI创作内容（注意：不要使用敏感词汇）',
        icon: 'none'
      });
      return;
    }

    this.setData({ 
      isGenerating: true,
      generatedImage: '' // 清空之前的结果
    });

    try {
      // 检查网络状态
      const isNetworkOk = await checkNetworkStatus();
      if (!isNetworkOk) {
        return;
      }
      
      const result = await generatePoetryImage(
        this.data.inputText.trim(),
        this.data.selectedStyle
      );

      console.log('生成结果:', result);

      if (result.code === 0 && result.data?.imageUrl) {
        this.setData({
          generatedImage: result.data.imageUrl
        });
      } else {
        throw new Error(result.message || '图片生成失败');
      }

    } catch (error) {
      console.error('创作失败:', error);
      wx.showModal({
        title: '生成失败',
        content: error.message || '长征主题创作失败，请检查提示词后重试',
        showCancel: false,
        confirmText: '知道了'
      });
      this.setData({ generatedImage: '' });
    } finally {
      this.setData({ isGenerating: false }); 
    }
  },

  // 保存图片到相册
  saveImage() {
    if (!this.data.generatedImage) {
      wx.showToast({
        title: '没有可保存的图片',
        icon: 'none'
      });
      return;
    }

    // 验证图片URL
    if (!validateImageUrl(this.data.generatedImage)) {
      wx.showToast({
        title: '图片链接无效',
        icon: 'none'
      });
      return;
    }

    // 检查网络状态
    checkNetworkStatus().then(isNetworkOk => {
      if (!isNetworkOk) {
        return;
      }
      
      // 检查相册权限
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: () => {
                this.downloadAndSaveImage();
              },
              fail: () => {
                wx.showModal({
                  title: '需要相册权限',
                  content: '需要您授权保存图片到相册',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting();
                    }
                  }
                });
              }
            });
          } else {
            this.downloadAndSaveImage();
          }
        }
      });
    });
  },

  // 下载并保存图片
  downloadAndSaveImage() {
    
    wx.downloadFile({
      url: this.data.generatedImage,
      timeout: 45000,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          console.log('图片下载成功，临时路径:', res.tempFilePath);
          // 检查文件大小
          wx.getFileInfo({
            filePath: res.tempFilePath,
            success: (fileRes) => {
              console.log('文件大小:', fileRes.size);
              if (fileRes.size > 1024) {
                this.saveImageToAlbum(res.tempFilePath);
              } else {
                wx.showToast({
                  title: '下载的文件太小，可能无效',
                  icon: 'none'
                });
                this.showRetryOption();
              }
            },
            fail: (fileError) => {
              console.error('获取文件信息失败:', fileError);
              // 文件信息获取失败时仍然尝试保存
              this.saveImageToAlbum(res.tempFilePath);
            }
          });
        } else {
          console.error('下载失败，状态码:', res.statusCode);
          wx.showToast({
            title: `下载失败: 状态码${res.statusCode}`,
            icon: 'none'
          });
          this.showRetryOption();
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('下载图片失败:', error);
        
        // 根据错误类型显示不同的提示信息
        let errorMsg = '下载失败';
        if (error.errMsg.includes('time out')) {
          errorMsg = '下载超时，图片服务器响应慢，请重试';
        } else if (error.errMsg.includes('fail') && error.errMsg.includes('url')) {
          errorMsg = '网络连接失败，请检查网络';
        } else if (error.errno === 5) {
          errorMsg = '下载超时，请稍后重试';
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
        
        this.showRetryOption();
      }
    });
  },

// 修改点12：新增保存图片到相册的独立函数
saveImageToAlbum(tempFilePath) {
  wx.saveImageToPhotosAlbum({
    filePath: tempFilePath,
    success: () => {
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });
    },
    fail: (error) => {
      console.error('保存失败:', error);
      let saveErrorMsg = '保存失败';
      if (error.errMsg.includes('auth deny')) {
        saveErrorMsg = '没有相册权限，请在设置中开启';
      }
      wx.showToast({
        title: saveErrorMsg,
        icon: 'none'
      });
    }
  });
},

// 修改点13：新增重试选项函数
showRetryOption() {
  wx.showModal({
    title: '下载失败',
    content: '图片下载失败，是否立即重试？',
    confirmText: '重试下载',
    cancelText: '稍后再试',
    success: (res) => {
      if (res.confirm) {
        this.downloadAndSaveImage();
      }
    }
  });
},

  // 分享功能
  shareImage() {
    if (!this.data.generatedImage) {
      wx.showToast({
        title: '没有可分享的图片',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 使用微信的分享面板
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈'],
      success: (res) => {
        if (res.tapIndex === 0 || res.tapIndex === 1) {
          // 提示用户点击右上角分享
          wx.showToast({
            title: '请点击右上角分享',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.log('分享操作取消', err);
      }
    });
  },

  // 图片加载成功
  onImageLoad() {
    console.log('图片加载成功');
  },

  // 图片加载失败
  onImageError(e) {
    console.error('图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败，请重新生成',
      icon: 'none'
    });
    this.setData({
      generatedImage: '' // 清空加载失败的图片
    });
  },

  // 分享功能
  onShareAppMessage() {
    const shareInfo = {
      title: '长征精神AI创作 - ' + (this.data.inputText || '文生图创作'),
      path: '/pages/ai-image/ai-image',
      imageUrl: this.data.generatedImage || ''
    };
    
    // 如果有生成的图片，可以分享具体内容
    if (this.data.generatedImage && this.data.inputText) {
      shareInfo.title = `AI创作：${this.data.inputText || '长征主题作品'}`;
      // 获取选中的风格名称
      const styleName = this.data.styleMap[this.data.selectedStyle] || '长征主题';
      shareInfo.desc = `${styleName}风格创作，欢迎体验AI创作功能`;
    }
    
    console.log('分享信息:', shareInfo);
    return shareInfo;
  },

  onShareTimeline() {
    const timelineInfo = {
      title: '长征精神AI创作 - ' + (this.data.inputText || '文生图创作'),
      imageUrl: this.data.generatedImage || ''
    };
    
    // 如果有生成的图片
    if (this.data.generatedImage && this.data.inputText) {
      timelineInfo.title = `AI创作：${this.data.inputText || '长征主题作品'}`;
    }
    
    console.log('朋友圈分享信息:', timelineInfo);
    return timelineInfo;
  }
});