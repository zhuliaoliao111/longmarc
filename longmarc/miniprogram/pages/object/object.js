// pages/object/object.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    artifacts: [
      {
        id: 'fhy',
        name: '红军防寒衣',
        imageUrl: '',
        page: 'object_fhy'
      },
      {
        id: 'cx',
        name: '红军草鞋',
        imageUrl: '',
        page: 'object_cx'
      },
      {
        id: 'bjm',
        name: '红军八角帽',
        imageUrl: '',
        page: 'object_bjm'
      },
      {
        id: 'yy',
        name: '红军银元',
        imageUrl: '',
        page: 'object_yy'
      },
      {
        id: 'byp',
        name: '红军标语牌',
        imageUrl: '',
        page: 'object_byp'
      },
      {
        id: 'tfw',
        name: '红军藤饭碗',
        imageUrl: '',
        page: 'object_tfw'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.loadArtifactImages();
  },

  /**
   * 加载文物图片
   */
  async loadArtifactImages() {
    try {
      console.log('开始加载文物图片...');

      // 定义图片映射关系
      const imageMapping = {
        'fhy': '防寒衣.jpg',
        'cx': '草鞋.jpg',
        'bjm': '八角帽.jpg',
        'yy': '银元.jpg',
        'byp': '标语牌.jpg',
        'tfw': '藤饭碗.jpg'
      };

      // 并行获取所有文物图片URL
      const imagePromises = Object.entries(imageMapping).map(async ([id, imageName]) => {
        try {
          const imageUrl = await getApp().getImageUrl(imageName);
          return { id, imageUrl };
        } catch (error) {
          console.log(`获取图片失败: ${imageName}`, error.message);
          return { id, imageUrl: '' };
        }
      });

      // 等待所有图片加载完成
      const results = await Promise.allSettled(imagePromises);

      // 更新artifacts数组中的图片URL
      const artifacts = this.data.artifacts.map(artifact => {
        const result = results.find(r =>
          r.status === 'fulfilled' && r.value.id === artifact.id
        );
        if (result && result.value.imageUrl) {
          return { ...artifact, imageUrl: result.value.imageUrl };
        }
        return artifact;
      });

      this.setData({
        artifacts: artifacts
      });

      console.log('文物图片加载完成');
    } catch (error) {
      console.error('加载文物图片失败:', error);
    }
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

  // 导航到具体场景
  navigateToObject(e) {
    console.log('点击文物:', e);
    const page = e.currentTarget.dataset.page;
    console.log('目标页面:', page);

    if (!page) {
      console.error('页面信息为空，无法导航');
      wx.showToast({
        title: '文物信息错误',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/${page}/${page}`,
      success: () => {
        console.log('页面跳转成功');
      },
      fail: (error) => {
        console.error('页面跳转失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  }
})