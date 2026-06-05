// pages/login/login.js
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

  // 微信一键登录 - 使用现有的登录逻辑
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
    // 按钮点击时的处理（如果需要的话）
    console.log('登录按钮点击');
  },

  // 执行完整的登录流程（复用app.js中的逻辑）
  async performFullLogin() {
    const app = getApp();
    try {
      await app.performFullLogin();

      // 登录成功后更新页面状态
      this.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo
      });

      // 移除登录成功提示，因为app.js的performFullLogin已经会显示正确的提示信息

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
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私，严格保护您的个人信息。详细内容请查看完整隐私政策。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 显示用户协议
  showUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '使用本应用即表示您同意我们的用户协议。如有疑问，请联系客服。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShareAppMessage() {
    return {
      title: '云上长征 - 重温红色历史',
      path: '/pages/index/index'
    };
  }
});
