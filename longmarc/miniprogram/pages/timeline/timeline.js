Page({
  data: { loading: true, items: [] },
  onShow() {
    this.load();
  },
  async load() {
    try {
      wx.showNavigationBarLoading();
      const res = await wx.cloud.callFunction({ name: 'getCheckpoints' });
      const { code, data } = res.result || {};
      if (code === 0 && Array.isArray(data)) {
        const items = data
          .slice()
          .sort((a, b) => (a.date > b.date ? 1 : -1));
        this.setData({ items });
      } else {
        wx.showToast({ title: '数据格式错误', icon: 'none' });
      }
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
      wx.hideNavigationBarLoading();
    }
  }
}); 