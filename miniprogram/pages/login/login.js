Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    backgroundImageUrl: ''
  },

  async onLoad(options) {
    console.log('登录页面加载');

    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('登录.jpg');

    // 检查是否已登录
    const app = getApp();
    if (app.globalData.isLoggedIn) {
      this.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo,
        backgroundImageUrl
      });
    } else {
      this.setData({
        backgroundImageUrl
      });
    }
  },

  // 微信一键登录
  onGetUserInfo(e) {
    console.log('获取用户信息:', e.detail);

    if (e.detail.errMsg === 'getUserInfo:ok') {
      // 保存用户信息到全局
      const app = getApp();
      app.globalData.userInfo = e.detail.userInfo;

      // 执行完整的登录流程（包括跳转到用户设置页面）
      this.performFullLogin();
    } else {
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      });
    }
  },

  onLoginTap() {
    // 按钮点击时的处理
    console.log('登录按钮点击');
  },

  // 执行完整的登录流程
  async performFullLogin() {
    const app = getApp();
    try {
      await app.performFullLogin();

      // 登录成功后更新页面状态
      this.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo
      });

     

    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  },

  // 游客登录
  guestLogin() {
    wx.showModal({
      title: '游客登录',
      content: '游客模式下部分功能可能受限，是否继续？',
      confirmText: '继续',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;

          wx.showToast({
            title: '进入游客模式',
            icon: 'success',
            duration: 2000
          });

          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 1500);
        }
      }
    });
  },

  // 显示隐私政策
  showPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy-policy/privacy-policy?type=privacyPolicy'
    });
  },

  // 显示用户协议 
  showUserAgreement() {
    wx.navigateTo({
      url: '/pages/user-agreement/user-agreement?type=userAgreement'
    });
  },

  onShareAppMessage() {
    return {
      title: '云上长征 - 重温红色历史',
      path: '/pages/index/index'
  }
}
});
