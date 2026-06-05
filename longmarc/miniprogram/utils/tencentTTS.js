// utils/tencentTTS.js - 简化版本
const CryptoJS = require('crypto-js');

// 腾讯云配置
const TENCENT_CONFIG = {
  secretId: 'AKIDUr7C5oLuMcidPEtPksnX8c4PacSDqUyI',
  secretKey: 'DC1d4JMJ6h4JNI1PipkS0MWTDpQ3YsQ3',
  region: 'ap-beijing',
  endpoint: 'tts.tencentcloudapi.com',
  version: '2019-08-23',
  action: 'TextToVoice'
};

// 简化的签名生成
function getSignature(params, secretKey) {
  // 按参数名排序
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  // 构建签名字符串
  const stringToSign = `POST\n${TENCENT_CONFIG.endpoint}\n/\n${queryString}`;
  
  console.log('签名字符串:', stringToSign);
  
  // 生成签名
  const signature = CryptoJS.HmacSHA1(stringToSign, secretKey).toString(CryptoJS.enc.Base64);
  
  console.log('生成的签名:', signature);
  
  return signature;
}

// 腾讯云语音合成
function synthesizeWithTencent(text, voiceType = 1001, speed = 0, volume = 0, emotion = 'neutral') {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 1000000000);
    
    // 构建请求参数
    const params = {
      Action: TENCENT_CONFIG.action,
      Version: TENCENT_CONFIG.version,
      Region: TENCENT_CONFIG.region,
      Timestamp: timestamp,
      Nonce: nonce,
      SecretId: TENCENT_CONFIG.secretId,
      Text: text,
      SessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      VoiceType: voiceType,
      Speed: speed,
      Volume: volume,
      PrimaryLanguage: 1,
      SampleRate: 16000,
      Codec: 'mp3',
      ProjectId: 0,
      ModelType: 1
    };

    // 添加情感参数
    if (emotion && emotion !== 'neutral') {
      params.EmotionCategory = emotion;
      params.EmotionIntensity = 100;
    }

    console.log('请求参数（签名前）:', params);

    // 生成签名
    const signature = getSignature(params, TENCENT_CONFIG.secretKey);
    params.Signature = signature;

    console.log('最终请求参数:', params);

    // 构建请求体
    const requestBody = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

    console.log('请求体:', requestBody);

    wx.request({
      url: `https://${TENCENT_CONFIG.endpoint}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: requestBody,
      success: (res) => {
        console.log('腾讯云TTS响应:', res);
        
        if (res.statusCode === 200) {
          try {
            let responseData = res.data;
            if (typeof responseData === 'string') {
              responseData = JSON.parse(responseData);
            }
            
            console.log('解析后的响应数据:', responseData);
            
            if (responseData.Response && responseData.Response.Audio) {
              resolve(responseData.Response.Audio);
            } else if (responseData.Response && responseData.Response.Error) {
              const errorMsg = responseData.Response.Error.Message || '未知错误';
              console.error('腾讯云TTS错误:', responseData.Response.Error);
              reject(new Error(`腾讯云TTS错误: ${errorMsg}`));
            } else {
              console.error('响应格式异常:', responseData);
              reject(new Error('响应格式异常，未找到Audio字段'));
            }
          } catch (error) {
            console.error('解析腾讯云TTS响应失败:', error);
            console.error('原始响应数据:', res.data);
            reject(new Error(`解析响应失败: ${error.message}`));
          }
        } else {
          console.error('HTTP错误:', res.statusCode, res.data);
          reject(new Error(`HTTP错误: ${res.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('腾讯云TTS请求失败:', error);
        reject(new Error(`请求失败: ${error.errMsg}`));
      }
    });
  });
}

// 保存并播放音频
function playTencentAudio(audioData) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    const tempFilePath = `${wx.env.USER_DATA_PATH}/tencent_audio_${Date.now()}.mp3`;
    
    console.log('准备保存腾讯云音频数据，长度:', audioData.length);
    
    if (!audioData || audioData.length === 0) {
      reject(new Error('音频数据为空'));
      return;
    }
    
    fs.writeFile({
      filePath: tempFilePath,
      data: audioData,
      encoding: 'base64',
      success: () => {
        console.log('腾讯云音频文件保存成功:', tempFilePath);
        resolve(tempFilePath);
      },
      fail: (error) => {
        console.error('腾讯云音频文件保存失败:', error);
        reject(error);
      }
    });
  });
}

// 音色类型映射
const VOICE_TYPES = {
  narrator: 1001, // 智逍遥
  dialogue: 1002, // 智聆
  dialect: 1003, // 智言
  emotion: 1004   // 智悠
};

module.exports = {
  TENCENT_CONFIG,
  synthesizeWithTencent,
  playTencentAudio,
  VOICE_TYPES
};