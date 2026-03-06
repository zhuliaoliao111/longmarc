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
    wx.setNavigationBarTitle({ title: '用户协议' });
  },

  /**
   * 关闭页面
   */
  close: function() {
    wx.navigateBack();
  }
})