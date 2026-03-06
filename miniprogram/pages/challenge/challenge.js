Page({
  data: {
    // 卡片图片配置
    cardImages: {
      brush: '',      // 以笔绘长征卡片背景
      text: '',       // 以字忆长征卡片背景
      heart: ''       // 以心看长征卡片背景
    },
    // 图片加载状态
    imageLoaded: {
      brush: false,
      text: false,
      heart: false
    }
  },

  // 加载图片URL
  async loadImageUrls() {
    try {
      const app = getApp();
      const [brushUrl, textUrl, heartUrl] = await Promise.all([
        app.getImageUrl('以笔绘长征.jpg'),
        app.getImageUrl('以字忆长征.jpg'),
        app.getImageUrl('以心看长征.jpg')
      ]);

      this.setData({
        'cardImages.brush': brushUrl,
        'cardImages.text': textUrl,
        'cardImages.heart': heartUrl
      });

      console.log('图片URL加载完成:', this.data.cardImages);
    } catch (error) {
      console.error('加载图片URL失败:', error);
    }
  },

  async onLoad() {
    console.log('诗词绘长征页面加载完成');

    // 异步获取图片URL
    await this.loadImageUrls();

    console.log('图片路径配置:', this.data.cardImages);
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 图片加载成功
  onImageLoad(e) {
    const type = e.currentTarget.dataset.type;
    console.log(`${type}卡片图片加载成功`);
    this.setData({
      [`imageLoaded.${type}`]: true
    });
  },

  // 图片加载失败
  onImageError(e) {
    const type = e.currentTarget.dataset.type;
    const imagePath = this.data.cardImages[type];
    console.error(`${type}卡片图片加载失败，路径: ${imagePath}`);
    console.error('错误详情:', e.detail);
    
    // 显示具体的错误信息
    wx.showToast({
      title: `${type}图片加载失败`,
      icon: 'none',
      duration: 2000
    });
  },

  // 导航到AI文生图页面
  navigateToAIImage() {
    console.log('点击以"笔"绘长征卡片');
    wx.navigateTo({
      url: '/pages/ai-image/ai-image'
    });
  },

  // 导航到AI文生文页面
  navigateToAIText() {
    console.log('点击以"字"忆长征卡片');
    wx.navigateTo({
      url: '/pages/ai-text/ai-text'
    });
  },

  // 导航到诗词卡片页面
  navigateToPoetryCards() {
    console.log('点击以"心"看长征卡片');
    wx.navigateTo({
      url: '/pages/poetry-cards/poetry-cards'
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '诗词绘长征 - AI创作体验',
      path: '/pages/challenge/challenge'
    };
  },

  onShareTimeline() {
    return {
      title: '诗词绘长征 - AI创作体验'
    };
  }
});