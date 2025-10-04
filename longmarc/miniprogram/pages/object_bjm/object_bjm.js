
// pages/object_bjm/object_bjm.js

Page({
  data: {
    artifact: null,
    isPlaying: false,
    vrUrl: 'https://vr.81.cn/H5/jb/78/index.html',
    artifactImageUrl: '',
    pauseIconUrl: '',
    speakerIconUrl: ''
  },

  async onLoad(options) {
    console.log('八角帽VR展示页面加载');

    // 异步获取图片URL
    const [artifactImageUrl, pauseIconUrl, speakerIconUrl] = await Promise.all([
      getApp().getImageUrl('八角帽.jpg'),
      getApp().getImageUrl('暂停.png'),
      getApp().getImageUrl('扬声器.png')
    ]);

    this.setData({
      artifactImageUrl,
      pauseIconUrl,
      speakerIconUrl
    });

    this.loadArtifactDetail('bjm');
  },

  onUnload: function() {
    if (this.audioContext) {
      this.audioContext.stop();
      this.audioContext.destroy();
    }
  },

  // 加载文物详情
  async loadArtifactDetail(artifactId) {
    try {
      wx.showLoading({
        title: '加载中...'
      });

      // 调用云函数获取文物详情
      const result = await wx.cloud.callFunction({
        name: 'getArtifacts',
        data: {
          action: 'detail',
          artifactId: artifactId
        }
      });

      wx.hideLoading();

      if (result.result.code === 0) {
        const artifact = result.result.data;
        this.setData({
          artifact: artifact
        });

        // 初始化音频（如果有音频URL）
        if (artifact.audioUrl) {
          this.initAudio(artifact.audioUrl);
        } else {
          console.log('此文物没有音频文件');
        }
      } else {
        console.error('获取文物详情失败:', result.result.message);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('调用云函数失败:', error);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  },

  initAudio: function(audioUrl) {
    console.log('初始化音频:', audioUrl);
    this.audioContext = wx.createInnerAudioContext();
    this.audioContext.src = audioUrl;

    this.audioContext.onPlay(() => {
      console.log('音频开始播放');
      this.setData({ isPlaying: true });
    });

    this.audioContext.onPause(() => {
      console.log('音频暂停');
      this.setData({ isPlaying: false });
    });

    this.audioContext.onStop(() => {
      console.log('音频停止');
      this.setData({ isPlaying: false });
    });

    this.audioContext.onEnded(() => {
      console.log('音频播放结束');
      this.setData({ isPlaying: false });
    });

    this.audioContext.onError((res) => {
      console.error('音频播放错误:', res);
      this.setData({ isPlaying: false });
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
    });

    console.log('音频初始化完成');
  },

  // 切换音频播放状态
  toggleAudio: function() {
    if (!this.audioContext) {
      wx.showToast({
        title: '音频未加载',
        icon: 'none'
      });
      return;
    }

    if (this.data.isPlaying) {
      this.audioContext.pause();
    } else {
      this.audioContext.play();
    }
  },

  openVR: function() {
    wx.showModal({
      title: '进入VR体验',
      content: '即将跳转到VR体验页面，是否继续？',
      confirmText: '进入VR',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/vr/vr?url=${encodeURIComponent(this.data.vrUrl)}&title=VR体验`
          });
        }
      }
    });
  },
  toggleExpand() {
    this.setData({
      isExpanded: !this.data.isExpanded
    });
  }
});