// 音频管理工具类
const audioConfig = require('../config/audio.js');

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
  }

  // 初始化音频
  initAudio(audioKey, callback) {
    return new Promise((resolve, reject) => {
      this.audioContext = wx.createInnerAudioContext();

      audioConfig.getCloudAudioUrl(audioKey).then(audioUrl => {
        this.audioContext.src = audioUrl;

        // 设置音频事件监听
        this.audioContext.onPlay(() => {
          this.isPlaying = true;
          callback && callback.onPlay && callback.onPlay();
        });

        this.audioContext.onPause(() => {
          this.isPlaying = false;
          callback && callback.onPause && callback.onPause();
        });

        this.audioContext.onStop(() => {
          this.isPlaying = false;
          callback && callback.onStop && callback.onStop();
        });

        this.audioContext.onEnded(() => {
          this.isPlaying = false;
          callback && callback.onEnded && callback.onEnded();
        });

        this.audioContext.onError((res) => {
          console.error('音频播放错误:', res);
          this.isPlaying = false;
          callback && callback.onError && callback.onError(res);
        });

        resolve(this.audioContext);
      }).catch(error => {
        console.error('获取音频URL失败:', error);
        reject(error);
      });
    });
  }

  // 播放/暂停切换
  toggle() {
    if (!this.audioContext) {
      wx.showToast({
        title: '音频未加载',
        icon: 'none'
      });
      return;
    }

    if (this.isPlaying) {
      this.audioContext.pause();
    } else {
      this.audioContext.play();
    }
  }

  // 停止播放
  stop() {
    if (this.audioContext) {
      this.audioContext.stop();
    }
  }

  // 销毁音频上下文
  destroy() {
    if (this.audioContext) {
      this.audioContext.stop();
      this.audioContext.destroy();
      this.audioContext = null;
    }
  }
}

module.exports = AudioManager;
