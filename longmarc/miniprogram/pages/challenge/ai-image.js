Page({
  data: {
    inputText: '',
    selectedStyle: 'revolutionary_illustration',
    isGenerating: false,
    generatedImage: '',
    backgroundImage: '',
    defaultImage: '',
    styleMap: {
      'revolutionary_illustration': '革命历史插画',
      'red_theme_print': '红色主题版画',
      'revolutionary_print': '革色主题版画',
      'route_drawing': '长征路线图绘',
      'route_drawing2': '长征路线图绘',
      'military_watercolor': '军民鱼水情水彩',
      'historical_oil': '历史场景油画',
      'red_memory_sketch': '红色记忆素描'
    }
  },

  async onLoad() {
    console.log('AI文生图页面加载完成');

    // 异步加载背景图片URL
    await this.loadBackgroundImage();
  },

  // 加载背景图片URL
  async loadBackgroundImage() {
    try {
      const app = getApp();
      const [backgroundImageUrl, defaultImageUrl] = await Promise.all([
        app.getImageUrl('文生图.jpg'),
        app.getImageUrl('军民鱼水情.jpg')
      ]);
      this.setData({
        backgroundImage: backgroundImageUrl,
        defaultImage: defaultImageUrl
      });
      console.log('AI文生图背景图片和默认图片URL加载完成');
    } catch (error) {
      console.error('加载AI文生图图片URL失败:', error);
    }
  },

  // 返回上一页
  goBack() {
    console.log('点击返回按钮');
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 如果无法返回上一页，则跳转到主页面
        console.log('无法返回上一页，跳转到主页面');
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

  // 选择风格 - 单选模式
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
        title: '请输入创作内容',
        icon: 'none'
      });
      return;
    }

    this.setData({ isGenerating: true });

    try {
      wx.showLoading({
        title: 'AI创作中...',
        mask: true
      });

      // 暂时不调用云函数，直接显示默认图片
      setTimeout(() => {
        this.setData({
          generatedImage: this.data.defaultImage
        });

        wx.showToast({
          title: '创作成功！',
          icon: 'success'
        });
        
        this.setData({ isGenerating: false });
        wx.hideLoading();
      }, 1000); // 模拟1秒的加载时间

    } catch (error) {
      console.error('创作失败:', error);
      wx.showToast({
        title: '创作失败，请重试',
        icon: 'none'
      });
      this.setData({ isGenerating: false });
      wx.hideLoading();
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

    wx.saveImageToPhotosAlbum({
      filePath: this.data.generatedImage,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('保存失败:', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享图片
  shareImage() {
    if (!this.data.generatedImage) {
      wx.showToast({
        title: '没有可分享的图片',
        icon: 'none'
      });
      return;
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
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
      title: '图片加载失败',
      icon: 'none'
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '非遗数字艺术创作 - ' + this.data.inputText,
      path: '/pages/challenge/ai-image',
      imageUrl: this.data.generatedImage || ''
    };
  },

  onShareTimeline() {
    return {
      title: '非遗数字艺术创作 - ' + this.data.inputText,
      imageUrl: this.data.generatedImage || ''
    };
  }
});
