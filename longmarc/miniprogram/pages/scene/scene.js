Page({
  data: {
    scene: {}
  },

  onLoad(query) {
    const { name } = query || {};
    if (name) {
      this.name = decodeURIComponent(name);
    }
  },

  onShow() {
    this.loadScene();
  },

  async loadScene() {
    try {
      const res = await wx.cloud.callFunction({ name: 'getCheckpoints' });
      const { code, data } = res.result || {};
      if (code === 0 && Array.isArray(data)) {
        const item = data.find(d => d.name === this.name) || {};
        this.setData({ scene: item });
      } else {
        wx.showToast({ title: '数据错误', icon: 'none' });
      }
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
}); 