Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverImageUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // 异步获取封面图片URL
    const coverImageUrl = await getApp().getImageUrl('封面.jpg');
    this.setData({
      coverImageUrl: coverImageUrl
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 点击封面图片跳转到首页
   */
  goToHome() {
    wx.reLaunch({
      url: '/pages/index/index',
      success: function() {
        console.log('跳转到首页成功');
      },
      fail: function() {
        console.log('跳转到首页失败');
      }
    });
  }

});
