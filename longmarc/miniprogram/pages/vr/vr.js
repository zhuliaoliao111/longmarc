Page({
  data: {
    vrUrl: '',
    title: ''
  },

  onLoad: function(options) {
    const { url, title } = options;
    this.setData({
      vrUrl: decodeURIComponent(url || ''),
      title: decodeURIComponent(title || 'VR体验')
    });

    wx.setNavigationBarTitle({
      title: this.data.title
    });
  },

  onWebViewLoad: function(e) {
    console.log('VR页面加载完成');
  },

  onWebViewError: function(e) {
    console.error('VR页面加载失败', e);
    wx.showModal({
      title: '加载失败',
      content: 'VR内容加载失败，请检查网络连接',
      showCancel: false,
      success: () => {
        this.goBack();
      }
    });
  },

  goBack: function() {
    wx.navigateBack();
  }
});