
const CryptoJS = require('crypto-js');

// 腾讯云配置
const TENCENT_CONFIG = {
  appId: '1380841699', 
  secretId: 'xxx',
  secretKey: 'xxxxx',
  region: 'ap-beijing',
  endpoint: 'tts.tencentcloudapi.com',
  version: '2019-08-23',
  action: 'TextToVoice' 
};

// SHA256哈希计算
function sha256Hex(str) {
  return CryptoJS.SHA256(str).toString();
}

// HMAC-SHA256计算
function hmacSha256(key, data) {
  // 确保数据为字符串
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  // CryptoJS.HmacSHA256需要先计算哈希，然后转换为十六进制字符串
  return CryptoJS.HmacSHA256(dataStr, key).toString(CryptoJS.enc.Hex);
}

// 生成签名
function getSignature(secretId, secretKey, host, contentType, timestamp, body) {
  console.log('【腾讯云签名】开始生成签名');
  console.log('【腾讯云签名】secretId:', secretId);
  console.log('【腾讯云签名】host:', host);
  console.log('【腾讯云签名】contentType:', contentType);
  console.log('【腾讯云签名】timestamp:', timestamp);
  console.log('【腾讯云签名】body:', body);
  
  // 1. 构建规范请求 (CanonicalRequest)
  const canonicalURI = '/';
  const canonicalQueryString = '';
  // 确保头部格式正确，末尾必须有换行符
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  
  // 确保body是字符串
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const hashedRequestPayload = sha256Hex(bodyStr);
  
  //构建canonicalRequest
  const canonicalRequest = `POST\n${canonicalURI}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
  
  console.log('【腾讯云签名】规范请求:', canonicalRequest);
  
  // 2. 构建待签名字符串 (StringToSign)
  const algorithm = 'TC3-HMAC-SHA256';
  
  // 格式化日期 (YYYY-MM-DD)
  const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
  console.log('【腾讯云签名】日期:', date);
  
  // 服务名从host中提取
  const service = host.split('.')[0];
  console.log('【腾讯云签名】服务名:', service);
  
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = sha256Hex(canonicalRequest);
  
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
  
  console.log('【腾讯云签名】待签名字符串:', stringToSign);
  
  // 3. 计算签名 
  // 生成派生密钥
  const tc3SecretKey = `TC3${secretKey}`;
  console.log('【腾讯云签名】TC3密钥前缀:', tc3SecretKey.substring(0, 10) + '...');
  
  // 注意：CryptoJS的HMAC-SHA256实现需要确保正确处理十六进制字符串
  const secretDate = CryptoJS.HmacSHA256(date, tc3SecretKey);
  console.log('【腾讯云签名】secretDate:', secretDate.toString(CryptoJS.enc.Hex));
  
  const secretService = CryptoJS.HmacSHA256(service, secretDate);
  console.log('【腾讯云签名】secretService:', secretService.toString(CryptoJS.enc.Hex));
  
  const secretSigning = CryptoJS.HmacSHA256('tc3_request', secretService);
  console.log('【腾讯云签名】secretSigning:', secretSigning.toString(CryptoJS.enc.Hex));
  
  // 使用最终密钥计算签名
  const signature = CryptoJS.HmacSHA256(stringToSign, secretSigning).toString(CryptoJS.enc.Hex);
  
  console.log('【腾讯云签名】生成的签名:', signature);
  
  // 4. 构建Authorization头 
  const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  console.log('【腾讯云签名】Authorization:', authorization);
  
  return authorization;
}

// 腾讯云TTS API调用 - 支持Promise方式，符合调用约定，添加了文本分块处理功能
function synthesizeWithTencent(text, voiceType, speed = 0, volume = 5, emotion = 'neutral', returnAllBlocks = false) {
  return new Promise((resolve, reject) => {
    try {
      console.log('【腾讯云TTS】开始合成请求');
      console.log('【腾讯云TTS】文本内容长度:', text.length, '字符');
      console.log('【腾讯云TTS】音色类型:', voiceType || VOICE_TYPES.narrator);
      console.log('【腾讯云TTS】是否返回所有音频块:', returnAllBlocks);
      
      // 检查文本长度，腾讯云TTS有长度限制，设置非常保守的限制值
      const MAX_TEXT_LENGTH = 300; 
      
     
      console.log(`【腾讯云TTS】文本长度(${text.length}字符)，进行分块处理`);
      
      // 传递returnAllBlocks参数给handleLongText函数
      handleLongText(text, voiceType, speed, volume, resolve, reject, returnAllBlocks);
    } catch (error) {
      console.error('【腾讯云TTS】请求处理异常:', error);
      reject(new Error(`请求处理异常: ${error.message || '未知错误'}`));
    }
  });
}

// 处理单块文本的TTS请求
function processSingleTextBlock(text, voiceType, speed, volume) {
  return new Promise((resolve, reject) => {
    try {
      // 生成时间戳和会话ID - 确保是10位时间戳
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const sessionId = Date.now() + '_' + Math.floor(Math.random() * 10000);
      
      console.log('【腾讯云TTS】处理文本块，长度:', text.length, '字符');
      console.log('【腾讯云TTS】时间戳:', timestamp);
      
      // 构建业务参数JSON对象
      const requestBody = {
        Text: text,
        SessionId: sessionId,
        Volume: volume, // C#示例中使用5作为默认值
        Speed: speed,   // C#示例中使用0作为默认值
        VoiceType: voiceType || VOICE_TYPES.narrator,
        SampleRate: 16000, // 16kHz采样率
        ModelType: 1,  
        ProjectId: 0 
      };
      
      // 将对象转换为字符串
      const bodyStr = JSON.stringify(requestBody);
      
      console.log('【腾讯云TTS】请求体:', bodyStr);
      
      // 准备生成签名所需参数
      const host = TENCENT_CONFIG.endpoint;
      const contentType = 'application/json'; 
      
      // 生成认证签名
      const auth = getSignature(
        TENCENT_CONFIG.secretId, 
        TENCENT_CONFIG.secretKey, 
        host, 
        contentType, 
        timestamp, 
        bodyStr
      );
      
      // 发送请求 
      const apiUrl = `https://${host}`;
      console.log('【腾讯云TTS】API请求地址:', apiUrl);
      
      // 构建请求头部
      const headers = {
        'Content-Type': contentType,
        'Host': host,
        'X-TC-Timestamp': timestamp,
        'X-TC-Version': TENCENT_CONFIG.version,
        'X-TC-Action': TENCENT_CONFIG.action,
        'X-TC-Region': TENCENT_CONFIG.region,
        'Authorization': auth
      };
      
      console.log('【腾讯云TTS】请求头部:', JSON.stringify(headers));
      
      wx.request({
        url: apiUrl,
        method: 'POST',
        header: headers,
        data: requestBody, // 注意：这里直接发送对象，让wx.request自动处理序列化
        success: function (res) {
          console.log('【腾讯云TTS】响应结果:', res);
          
          console.log('【腾讯云TTS】响应状态码:', res.statusCode);
          console.log('【腾讯云TTS】响应数据:', JSON.stringify(res.data));
          
          if (res.statusCode === 200) {
            if (res.data.Response) {
              if (res.data.Response.Error) {
                console.error('【腾讯云TTS】API错误:', res.data.Response.Error);
                reject(new Error(`腾讯云TTS错误: ${res.data.Response.Error.Message || res.data.Response.Error.Code || '未知API错误'}`));
              } else if (res.data.Response.Audio) {
                console.log('【腾讯云TTS】成功获取音频数据，长度:', res.data.Response.Audio.length);
                resolve(res.data.Response.Audio);
              } else {
                console.error('【腾讯云TTS】响应格式错误，缺少Audio字段');
                reject(new Error('腾讯云TTS错误: 响应格式错误，缺少Audio字段'));
              }
            } else {
              console.error('【腾讯云TTS】响应格式错误，缺少Response字段');
              reject(new Error('腾讯云TTS错误: 响应格式错误，缺少Response字段'));
            }
          } else {
            console.error('【腾讯云TTS】HTTP错误响应，状态码:', res.statusCode);
            const errorMsg = res.data.Response && res.data.Response.Error ? 
              res.data.Response.Error.Message : 
              res.errMsg || '请求失败';
            reject(new Error(`腾讯云TTS错误: ${errorMsg} (状态码: ${res.statusCode})`));
          }
        },
        fail: function (err) {
          console.error('【腾讯云TTS】网络请求失败:', err);
          reject(new Error(`网络请求失败: ${err.errMsg || '未知错误'}`));
        }
      });
    } catch (error) {
      console.error('【腾讯云TTS】请求处理异常:', error);
      reject(new Error(`请求处理异常: ${error.message || '未知错误'}`));
    }
  });
}

// 处理长文本，将文本分割成多个小块并按顺序处理
function handleLongText(text, voiceType, speed, volume, resolve, reject, returnAllBlocks = false) {
 
  const BLOCK_SIZE = 100; 
  
 
  const splitTextByPunctuation = (text, maxLength) => {
    const result = [];
    // 标点符号优先级分组
    const highPriorityPunctuation = ['。', '！', '？', '；', ';', '.', '!', '?', '\n', '\r\n'];
    const lowPriorityPunctuation = ['，', ',', '、'];
    
    let currentPosition = 0;
    
    while (currentPosition < text.length) {
      console.log(`【腾讯云TTS】开始处理文本块，当前位置: ${currentPosition}，剩余长度: ${text.length - currentPosition}`);
      
      // 计算当前块的最大可能结束位置
      let endPos = Math.min(currentPosition + maxLength, text.length);
      
      // 如果当前块就是整个文本剩余部分，直接添加
      if (endPos === text.length) {
        const lastBlock = text.substring(currentPosition);
        console.log(`【腾讯云TTS】添加最后一个块: "${lastBlock.substring(0, 30)}..." (长度: ${lastBlock.length})`);
        result.push(lastBlock);
        break;
      }
      
      // 先尝试在最大位置之前找到最后一个高优先级标点符号
      let splitPos = -1;
      
      // 从endPos向前扫描，先寻找高优先级标点符号
      for (let i = endPos; i > currentPosition; i--) {
        if (highPriorityPunctuation.includes(text[i])) {
          splitPos = i;
          break;
        }
      }
      
      // 如果没有找到高优先级标点符号，再寻找低优先级标点符号
      if (splitPos === -1) {
        for (let i = endPos; i > currentPosition; i--) {
          if (lowPriorityPunctuation.includes(text[i])) {
            splitPos = i;
            break;
          }
        }
      }
      
      // 如果找到了合适的标点符号，在标点处分割
      if (splitPos > currentPosition) {
        const block = text.substring(currentPosition, splitPos + 1);
        console.log(`【腾讯云TTS】在标点处分割，添加块: "${block.substring(0, 30)}..." (长度: ${block.length})`);
        result.push(block);
        currentPosition = splitPos + 1;
      } else {
        // 如果没有找到标点符号，强制分割
        const block = text.substring(currentPosition, endPos);
        console.log(`【腾讯云TTS】强制分割，添加块: "${block.substring(0, 30)}..." (长度: ${block.length})`);
        result.push(block);
        currentPosition = endPos;
      }
    }
    
    return result;
  };
  
  // 分割文本
  const textBlocks = splitTextByPunctuation(text, BLOCK_SIZE);
  console.log(`【腾讯云TTS】文本分割完成，共${textBlocks.length}个块`);
  
  // 保留原始文本块，避免截断导致内容丢失
  // 文本已经通过splitTextByPunctuation函数按照安全大小分割
  const safeBlocks = textBlocks.map(block => {
    console.log(`【腾讯云TTS】块长度检查: ${block.length}字符`);
    return block;
  });
  
  // 存储每个块的音频数据
  const audioBlocks = [];
  
  // 递归处理每个文本块，增加最大重试次数
  function processNextBlock(index, retryCount = 0) {
    if (index >= safeBlocks.length) {
      // 所有块处理完成
      console.log(`【腾讯云TTS】所有${audioBlocks.length}个文本块处理完成`);
      console.log(`【腾讯云TTS】总文本长度: ${text.length}字符，总音频块数: ${audioBlocks.length}`);
      
      // 根据参数决定返回格式
      if (returnAllBlocks) {
        // 返回所有音频块对象
        console.log(`【腾讯云TTS】返回所有音频块，共${audioBlocks.length}个`);
        resolve({
          audioBlocks: audioBlocks,
          totalBlocks: audioBlocks.length
        });
      } else {
        // 默认只返回第一个块，保持向后兼容
        console.log('【腾讯云TTS】返回第一个音频块，保持向后兼容');
        resolve(audioBlocks[0]);
      }
      return;
    }
    
    
    const currentBlock = safeBlocks[index];
    const previewText = currentBlock.length > 50 ? currentBlock.substring(0, 50) + '...' : currentBlock;
    console.log(`【腾讯云TTS】处理第${index + 1}/${safeBlocks.length}个文本块，长度: ${currentBlock.length}字符，内容预览: "${previewText}"`);
    
    processSingleTextBlock(currentBlock, voiceType, speed, volume)
      .then(audioData => {
        console.log(`【腾讯云TTS】第${index + 1}个文本块处理成功，生成音频数据`);
        audioBlocks.push(audioData);
        // 延迟处理下一个块，避免请求过于密集
        console.log(`【腾讯云TTS】等待1000ms后处理下一个块`);
        setTimeout(() => {
          processNextBlock(index + 1);
        }, 1000); // 进一步增加延迟时间，确保API请求不会过于频繁
      })
      .catch(error => {
        console.error(`【腾讯云TTS】处理第${index + 1}个文本块失败:`, error);
        // 如果是文本过长错误，尝试进一步缩短文本块，最多重试2次
        if (error.message && error.message.includes('Text too long') && retryCount < 2) {
          console.log(`【腾讯云TTS】尝试第${retryCount + 1}次重试，进一步缩短文本块长度`);
          // 每次重试将文本长度减少50%
          const retryLength = Math.floor(currentBlock.length * Math.pow(0.5, retryCount + 1));
          const shorterBlock = currentBlock.substring(0, retryLength > 50 ? retryLength : 50); // 确保至少保留50字符
          console.log(`【腾讯云TTS】重试块长度: ${shorterBlock.length}字符，内容预览: "${shorterBlock.substring(0, 30)}..."`);
          
          processSingleTextBlock(shorterBlock, voiceType, speed, volume)
            .then(shorterAudio => {
              console.log(`【腾讯云TTS】第${index + 1}个文本块重试成功`);
              audioBlocks.push(shorterAudio);
              setTimeout(() => {
                processNextBlock(index + 1);
              }, 1000);
            })
            .catch(retryError => {
              console.error(`【腾讯云TTS】第${index + 1}个文本块重试失败:`, retryError);
              // 增加重试计数
              processNextBlock(index, retryCount + 1);
            });
        } else {
          console.error(`【腾讯云TTS】达到最大重试次数或非文本过长错误，终止处理`);
          reject(error);
        }
      });
  }
  
  // 开始处理第一个块
  processNextBlock(0);
}

// 保存并播放音频
function playTencentAudio(audioData) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    const tempFilePath = `${wx.env.USER_DATA_PATH}/tencent_audio_${Date.now()}.mp3`;
    
    // 处理可能的对象类型输入
    let actualAudioData = audioData;
    if (audioData && typeof audioData === 'object' && audioData.audioBlocks) {
      // 如果传入的是包含audioBlocks的对象，则取第一个块
      console.log('【腾讯云TTS】检测到音频块对象，取第一个块进行播放');
      actualAudioData = audioData.audioBlocks[0];
    }
    
    console.log('准备保存腾讯云音频数据，长度:', actualAudioData ? actualAudioData.length : 'undefined');
    
    if (!actualAudioData || actualAudioData.length === 0) {
      reject(new Error('音频数据为空'));
      return;
    }
    
    // 确保数据类型正确
    if (typeof actualAudioData !== 'string') {
      console.error('【腾讯云TTS】音频数据类型错误:', typeof actualAudioData);
      reject(new Error(`音频数据类型错误，期望字符串，收到: ${typeof actualAudioData}`));
      return;
    }
    
    fs.writeFile({
      filePath: tempFilePath,
      data: actualAudioData,
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
  // 大模型音色
  zhini: 502001, // 智小柔（聊天女声）
  zhinan: 502002, // 智小满（营销女声）
  zhinong: 502003, // 智小敏（聊天女声）
  zhinan2: 502004, // 智小满（营销女声）
  zhijie: 502005, // 智小解（解说男声）
  zhiwu: 502006, // 智小悟（聊天男声）
  zhixiao: 502007, // 智小虎（聊天童声）
  
  // 精品音色 - 常用女声
  zhimei: 101027, // 智梅（通用女声）
  zhixi: 101026, // 智希（通用女声）
  zhiyan: 101019, // 智彤（粤语女声）
  zhitu: 101055, // 智付（通用女声）
  zhiyanxinwen: 101011, // 智燕（新闻女声）
  zhiyu: 101001, // 智瑜（情感女声）
  
  // 精品音色 - 常用男声
  zhike: 101030, // 智柯（通用男声）
  zhiyou: 101054, // 智友（通用男声）
  zhiyun: 101004, // 智云（通用男声）
  zhihui: 101013, // 智辉（新闻男声）
  zhirui: 101021, // 智瑞（新闻男声）
  
  // 童声
  zhimeng: 101015, // 智萌（男童声）
  zhitian: 101016, // 智甜（女童声）
  
  // 默认值
  narrator: 101001 // 智瑜（情感女声）作为默认值
};

// 辅助函数：按顺序播放多个音频块
function playAudioBlocks(audioBlocks) {
  return new Promise((resolve, reject) => {
    // 处理可能的对象类型输入
    let actualAudioBlocks = audioBlocks;
    if (audioBlocks && typeof audioBlocks === 'object' && audioBlocks.audioBlocks) {
      // 如果传入的是包含audioBlocks的对象，则取其audioBlocks数组
      console.log('【腾讯云TTS】检测到音频块对象，使用其audioBlocks数组');
      actualAudioBlocks = audioBlocks.audioBlocks;
    }
    
    if (!actualAudioBlocks || !Array.isArray(actualAudioBlocks) || actualAudioBlocks.length === 0) {
      reject(new Error('没有有效的音频块需要播放'));
      return;
    }
    
    let currentBlockIndex = 0;
    const tempFilePaths = [];
    
    // 递归播放每个音频块
    function playNextBlock() {
      if (currentBlockIndex >= actualAudioBlocks.length) {
        resolve(tempFilePaths);
        return;
      }
      
      console.log(`【腾讯云TTS】播放第${currentBlockIndex + 1}/${actualAudioBlocks.length}个音频块`);
      
      // 直接传递单个音频块数据，避免嵌套调用playTencentAudio的类型检查
      const fs = wx.getFileSystemManager();
      const tempFilePath = `${wx.env.USER_DATA_PATH}/tencent_audio_${Date.now()}_${currentBlockIndex}.mp3`;
      const blockData = actualAudioBlocks[currentBlockIndex];
      
      // 确保数据类型正确
      if (typeof blockData !== 'string') {
        console.error(`【腾讯云TTS】第${currentBlockIndex + 1}个音频块数据类型错误:`, typeof blockData);
        reject(new Error(`第${currentBlockIndex + 1}个音频块数据类型错误，期望字符串`));
        return;
      }
      
      fs.writeFile({
        filePath: tempFilePath,
        data: blockData,
        encoding: 'base64',
        success: () => {
          tempFilePaths.push(tempFilePath);
          // 创建音频上下文播放当前文件
          const audioContext = wx.createInnerAudioContext();
          audioContext.src = tempFilePath;
          
          audioContext.onEnded(() => {
            currentBlockIndex++;
            playNextBlock();
          });
          
          audioContext.onError(error => {
            console.error(`【腾讯云TTS】第${currentBlockIndex + 1}个音频块播放失败:`, error);
            reject(new Error(`音频播放失败: ${error.errMsg}`));
          });
          
          audioContext.play();
        },
        fail: (error) => {
          console.error(`【腾讯云TTS】第${currentBlockIndex + 1}个音频块保存失败:`, error);
          reject(error);
        }
      });
    }
    
    // 开始播放第一个块
    playNextBlock();
  });
}

module.exports = {
  TENCENT_CONFIG,
  synthesizeWithTencent,
  playTencentAudio,
  playAudioBlocks,
  VOICE_TYPES
};