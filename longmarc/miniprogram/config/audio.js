// 音频文件配置
// 将来这些URL会指向微信云存储中的文件
const AUDIO_CONFIG = {
  // 文物音频配置
  objects: {
    bjm: {
      name: '八角帽',
      localPath: '/audio/bjm.mp3',
      cloudPath: 'audio/bjm.mp3',
      description: '关于八角帽的历史介绍'
    },
    byp: {
      name: '菠萝叶盘',
      localPath: '/audio/byp.mp3',
      cloudPath: 'audio/byp.mp3',
      description: '关于菠萝叶盘的历史介绍'
    },
    cx: {
      name: '草鞋',
      localPath: '/audio/cx.mp3',
      cloudPath: 'audio/cx.mp3',
      description: '关于草鞋的历史介绍'
    },
    fhy: {
      name: '防寒衣',
      localPath: '/audio/fhy.mp3',
      cloudPath: 'audio/fhy.mp3',
      description: '关于防寒衣的历史介绍'
    },
    tfw: {
      name: '藤饭碗',
      localPath: '/audio/tfw.mp3',
      cloudPath: 'audio/tfw.mp3',
      description: '关于藤饭碗的历史介绍'
    },
    yy: {
      name: '银元',
      localPath: '/audio/yy.mp3',
      cloudPath: 'audio/yy.mp3',
      description: '关于银元的历史介绍'
    }
  }
};

// 获取音频URL的函数
function getAudioUrl(audioKey, useCloud = true) {
  const audio = AUDIO_CONFIG.objects[audioKey];
  if (!audio) {
    console.error('音频文件不存在:', audioKey);
    return null;
  }

  // 暂时使用本地路径，上传到云端后可以切换为云端URL
  return audio.localPath;
}

// 从云端获取音频URL（异步）
function getCloudAudioUrl(audioKey) {
  return new Promise((resolve, reject) => {
    const audio = AUDIO_CONFIG.objects[audioKey];
    if (!audio) {
      reject(new Error('音频文件不存在: ' + audioKey));
      return;
    }

    // 直接返回云存储URL，不需要调用云函数
    const cloudUrl = `cloud://cloud1-3gt1133gaf836a9f-1311195237/audio/${audioKey}.mp3`;
    console.log('使用云存储URL:', cloudUrl);

    // 获取临时文件URL
    wx.cloud.getTempFileURL({
      fileList: [cloudUrl],
      success: (res) => {
        if (res.fileList && res.fileList.length > 0 && res.fileList[0].tempFileURL) {
          console.log('获取临时URL成功');
          resolve(res.fileList[0].tempFileURL);
        } else {
          console.warn('获取临时URL失败，使用本地路径');
          resolve(audio.localPath); // fallback到本地路径
        }
      },
      fail: (error) => {
        console.warn('获取临时URL失败，使用本地路径:', error);
        resolve(audio.localPath); // fallback到本地路径
      }
    });
  });
}

// 获取音频信息
function getAudioInfo(audioKey) {
  return AUDIO_CONFIG.objects[audioKey] || null;
}

module.exports = {
  AUDIO_CONFIG,
  getAudioUrl,
  getCloudAudioUrl,
  getAudioInfo
};
