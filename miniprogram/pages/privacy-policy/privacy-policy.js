Page({
  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果需要根据传入的参数显示不同内容
    if (options.type === 'userAgreement') {
      wx.setNavigationBarTitle({ title: '用户协议' });
    }
  },

  /**
   * 关闭页面
   */
  close: function() {
    wx.navigateBack();
  }
})