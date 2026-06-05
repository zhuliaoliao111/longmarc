Page({
  data: {
    backgroundImageUrl: ''
  },

  async onLoad(options) {
    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('跨时空对话.jpg');
    this.setData({
      backgroundImageUrl: backgroundImageUrl
    });
  },

  goToHeroDetail: function(e) {
    const hero = e.currentTarget.dataset.hero;
    if (hero === 'li') {
      wx.navigateTo({
        url: '/pages/dialog_chat/dialog_chat?hero=li'
      });
    }
  }
});