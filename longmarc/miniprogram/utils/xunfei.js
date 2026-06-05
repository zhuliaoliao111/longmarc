// utils/xunfei.js
const CryptoJS = require('crypto-js');

// 讯飞配置 - 根据你的平台信息更新
const XUNFEI_CONFIG = {
  // 更新为超拟人语音合成的WebSocket地址
  websocket_url: "wss://cbm01.cn-huabei-1.xf-yun.com/v1/private/mcd9m97e6",
  app_id: "ddfa5d50", // 你的AppID
  api_key: "ca9932b6d57bda0f180f1d89c3095379", // 你的API Key
  api_secret: "ODRlYTNkYjQ1NTRjNGVkN2Y3ZDUwMGQ0", // 你的API Secret
  voices: {
    narrator: "x5_lingfeiyi_flow",     // 叙述者音色
    dialogue: "x5_lingxiaotang_flow",  // 对话音色
    dialect: "x4_ziyang_oral",         // 东北话
    emotion: "x5_lingyuyan_flow"       // 情感音色
  }
};

// 构建讯飞WebSocket认证URL - 添加调试信息
function buildXunfeiWebSocketUrl() {
  const { websocket_url, api_key, api_secret } = XUNFEI_CONFIG;
  
  console.log('原始URL:', websocket_url);
  console.log('API Key:', api_key);
  console.log('API Secret:', api_secret);
  
  // 手动解析URL，避免使用URL构造函数
  const urlMatch = websocket_url.match(/wss?:\/\/([^\/]+)(.*)/);
  if (!urlMatch) {
    throw new Error('Invalid WebSocket URL format');
  }
  
  const host = urlMatch[1];
  const path = urlMatch[2] || '/';
  const date = new Date().toUTCString();
  const requestLine = `GET ${path} HTTP/1.1`;
  
  console.log('解析结果:', { host, path, date });
  
  // 构建签名字符串
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;
  
  // 计算签名
  const signature = CryptoJS.HmacSHA256(signatureOrigin, api_secret).toString(CryptoJS.enc.Base64);
  
  // 构建authorization
  const authorizationOrigin = `api_key="${api_key}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
  
  const finalUrl = `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${host}`;
  console.log('最终URL:', finalUrl);
  
  return finalUrl;
}

// 调用讯飞TTS API - 修复为超拟人语音合成格式
function synthesizeWithXunfei(text, voice = 'x5_lingfeiyi_flow') {
  return new Promise((resolve, reject) => {
    const wsUrl = buildXunfeiWebSocketUrl();
    let audioData = '';
    let isResolved = false;
    let audioChunks = []; // 存储音频数据块
    let totalAudioLength = 0; // 跟踪总音频长度
    
    // 设置30秒超时
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        if (socketTask) {
          socketTask.close();
        }
        reject(new Error('语音合成超时，请检查网络连接'));
      }
    }, 30000);
    
    const socketTask = wx.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket连接成功');
      },
      fail: (error) => {
        console.error('WebSocket连接失败:', error);
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          reject(new Error(`WebSocket连接失败: ${JSON.stringify(error)}`));
        }
      }
    });
    
    socketTask.onOpen(() => {
      console.log('WebSocket已打开');
      
      // 关键修复：使用正确的文本编码方式
      // 先将文本转换为UTF-8字节数组，再进行Base64编码
      const textBytes = CryptoJS.enc.Utf8.parse(text);
      const base64Text = CryptoJS.enc.Base64.stringify(textBytes);
      
      console.log('原始文本:', text);
      console.log('UTF-8字节长度:', textBytes.sigBytes);
      console.log('Base64编码后:', base64Text);
      
      // 发送合成请求 - 使用超拟人语音合成格式
      const requestData = {
        header: {
          app_id: XUNFEI_CONFIG.app_id,
          status: 2
        },
        parameter: {
          oral: {
            oral_level: "mid"
          },
          tts: {
            vcn: voice,
            speed: 50,
            volume: 50,
            pitch: 50,
            bgs: 0,
            reg: 0,
            rdn: 0,
            rhy: 0,
            audio: {
              encoding: "lame",
              sample_rate: 24000,
              channels: 1,
              bit_depth: 16,
              frame_size: 0
            }
          }
        },
        payload: {
          text: {
            encoding: "utf8",
            compress: "raw",
            format: "plain",
            status: 2,
            seq: 0,
            // 关键修复：直接使用Base64编码的文本
            text: base64Text
          }
        }
      };
      
      console.log('发送请求数据:', requestData);
      
      socketTask.send({
        data: JSON.stringify(requestData)
      });
    });
    
    socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        console.log('收到消息:', data);
        
        // 检查header消息
        if (data.header) {
          console.log('收到header消息:', data.header);
          
          // 检查是否有错误
          if (data.header.code && data.header.code !== 0) {
            console.error('服务端返回错误:', data.header);
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              socketTask.close();
              reject(new Error(`服务端错误: ${data.header.message || '未知错误'}`));
            }
            return;
          }
        }
        
        // 处理音频数据 - 关键修复：改进数据收集逻辑
        if (data.payload && data.payload.audio) {
          if (data.payload.audio.audio) {
            audioChunks.push(data.payload.audio.audio);
            totalAudioLength += data.payload.audio.audio.length;
            console.log('收到音频数据块，长度:', data.payload.audio.audio.length, '累计长度:', totalAudioLength);
          }
          
          // 检查是否合成完成
          if (data.payload.audio.status === 2) {
            console.log('语音合成完成，总数据块数:', audioChunks.length, '总音频长度:', totalAudioLength);
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              socketTask.close();
              // 合并所有音频数据块
              const completeAudioData = audioChunks.join('');
              console.log('完整音频数据长度:', completeAudioData.length);
              console.log('数据块数量验证:', audioChunks.length);
              
              // 验证音频数据完整性
              if (completeAudioData.length !== totalAudioLength) {
                console.warn('音频数据长度不匹配！期望:', totalAudioLength, '实际:', completeAudioData.length);
              }
              
              resolve(completeAudioData);
            }
          }
        }
      } catch (error) {
        console.error('解析消息失败:', error);
        console.error('原始数据:', res.data);
      }
    });
    
    socketTask.onError((error) => {
      console.error('WebSocket错误:', error);
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        socketTask.close();
        reject(new Error(`WebSocket连接错误: ${JSON.stringify(error)}`));
      }
    });
  });
}

// 保存并播放音频 - 修复为MP3格式
function playAudio(audioData) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    // 使用.mp3扩展名，因为使用lame编码
    const tempFilePath = `${wx.env.USER_DATA_PATH}/temp_audio_${Date.now()}.mp3`;
    
    console.log('准备保存音频数据，长度:', audioData.length);
    
    // 验证音频数据
    if (!audioData || audioData.length === 0) {
      reject(new Error('音频数据为空'));
      return;
    }
    
    fs.writeFile({
      filePath: tempFilePath,
      data: audioData,
      encoding: 'base64',
      success: () => {
        console.log('音频文件保存成功:', tempFilePath);
        resolve(tempFilePath);
      },
      fail: (error) => {
        console.error('音频文件保存失败:', error);
        reject(error);
      }
    });
  });
}

// 检测文本中的对话内容
function detectDialogue(text) {
  const dialogueRegex = /[""「」『』]([^""「」『』]+)[""「」『』]/g;
  const matches = [];
  let match;
  
  while ((match = dialogueRegex.exec(text)) !== null) {
    matches.push({
      text: match[1],
      start: match.index,
      end: match.index + match[0].length,
      isDialogue: true
    });
  }
  
  return matches;
}

// 分段处理文本，区分叙述和对话
function segmentText(text) {
  const segments = [];
  const dialogues = detectDialogue(text);
  
  if (dialogues.length === 0) {
    // 没有对话，全部作为叙述
    segments.push({
      text: text,
      type: 'narrator',
      voice: XUNFEI_CONFIG.voices.narrator
    });
  } else {
    // 有对话，分段处理
    let lastIndex = 0;
    
    dialogues.forEach((dialogue) => {
      // 添加对话前的叙述
      if (dialogue.start > lastIndex) {
        const narratorText = text.substring(lastIndex, dialogue.start);
        if (narratorText.trim()) {
          segments.push({
            text: narratorText.trim(),
            type: 'narrator',
            voice: XUNFEI_CONFIG.voices.narrator
          });
        }
      }
      
      // 添加对话
      segments.push({
        text: dialogue.text,
        type: 'dialogue',
        voice: XUNFEI_CONFIG.voices.dialogue
      });
      
      lastIndex = dialogue.end;
    });
    
    // 添加最后一段叙述
    if (lastIndex < text.length) {
      const lastNarratorText = text.substring(lastIndex);
      if (lastNarratorText.trim()) {
        segments.push({
          text: lastNarratorText.trim(),
          type: 'narrator',
          voice: XUNFEI_CONFIG.voices.narrator
        });
      }
    }
  }
  
  return segments;
}

module.exports = {
  XUNFEI_CONFIG,
  synthesizeWithXunfei,
  playAudio,
  segmentText
};