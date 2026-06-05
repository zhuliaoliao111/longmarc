// pages/image-manager/image-manager.js
const imageManager = require('../../utils/imageManager.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalImages: 37,
    uploadedImages: 0,
    cachedImages: 0,
    imageList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('图片管理页面加载');
    this.initPage();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.updateStats();
  },

  // 初始化页面
  async initPage() {
    await this.loadImageList();
    this.updateStats();
  },

  // 加载图片列表
  async loadImageList() {
    const imageFiles = [
      '三艘小船.jpg', '会宁会师.jpg', '会宁会师_主页.jpg', '八角帽.jpg', '周恩来.jpg',
      '四渡赤水.jpg', '四渡赤水_主页.jpg', '地图.jpg', '夹金山.jpg', '对话.png',
      '强渡大渡河.jpg', '扬声器.png', '文物.png', '日记.png', '暂停.png', '暂停1.png',
      '标语牌.jpg', '毛泽东.jpg', '泸定桥.jpg', '湘江.jpg', '瑞金出发.jpg', '用户.png',
      '用户页背景.jpg', '画板.png', '翻越夹金山_主页.jpg', '背景.png', '胜利会师_主页.jpg',
      '腊子口战役.jpg', '草鞋.jpg', '藤饭碗.jpg', '跑步.png', '轨迹背景.jpg',
      '遵义会议.jpg', '银元.jpg', '防寒衣.jpg', '飞夺泸定桥_主页.jpg', '首页.jpg'
    ];

    const imageList = [];

    for (const fileName of imageFiles) {
      try {
        const url = await imageManager.getImageUrl(fileName);
        const isUploaded = url && !url.includes('../../images/');
        const isCached = imageManager.imageCache[fileName] && imageManager.imageCache[fileName].url;

        imageList.push({
          name: fileName,
          url: url || '../../images/' + fileName,
          status: isUploaded ? 'success' : 'local',
          statusText: isUploaded ? '已上传' : '本地',
          statusClass: isUploaded ? 'success' : (isCached ? 'cached' : 'loading')
        });
      } catch (error) {
        imageList.push({
          name: fileName,
          url: '../../images/' + fileName,
          status: 'error',
          statusText: '加载失败',
          statusClass: 'failed'
        });
      }
    }

    this.setData({
      imageList: imageList
    });
  },

  // 更新统计信息
  updateStats() {
    const cacheStats = imageManager.getCacheStats();
    const uploadedImages = this.data.imageList.filter(item => item.status === 'success').length;

    this.setData({
      uploadedImages: uploadedImages,
      cachedImages: cacheStats.cachedCount
    });
  },

  // 测试云函数连接
  async testCloudFunction() {
    wx.showLoading({
      title: '测试中...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'uploadImages',
        data: {
          action: 'test'
        }
      });

      wx.hideLoading();

      if (result.result.code === 0) {
        wx.showModal({
          title: '测试成功',
          content: `云函数连接正常！\n时间戳: ${result.result.data.timestamp}`,
          showCancel: false,
          confirmText: '确定'
        });
      } else {
        wx.showModal({
          title: '测试失败',
          content: result.result.message,
          showCancel: false,
          confirmText: '确定'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('云函数测试失败:', error);
      wx.showModal({
        title: '测试失败',
        content: `连接云函数失败: ${error.message}`,
        showCancel: false,
        confirmText: '确定'
      });
    }
  },

  // 上传所有图片
  async uploadAllImages() {
    wx.showModal({
      title: '确认上传',
      content: '确定要上传所有图片到云存储吗？这可能需要一些时间。',
      success: async (res) => {
        if (res.confirm) {
          try {
            const results = await imageManager.uploadAllImages();

            // 重新加载图片列表
            await this.loadImageList();
            this.updateStats();

            wx.showToast({
              title: '上传完成',
              icon: 'success',
              duration: 2000
            });

          } catch (error) {
            console.error('批量上传失败:', error);
            wx.showToast({
              title: '上传失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  },

  // 刷新缓存
  async refreshCache() {
    wx.showLoading({
      title: '刷新中...'
    });

    try {
      // 重新初始化图片管理器
      await imageManager.init();

      // 重新加载图片列表
      await this.loadImageList();
      this.updateStats();

      wx.hideLoading();
      wx.showToast({
        title: '缓存刷新完成',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('刷新缓存失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
    }
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除图片缓存吗？清除后将使用本地图片。',
      success: (res) => {
        if (res.confirm) {
          imageManager.clearCache();

          // 重新加载图片列表（将显示本地图片）
          this.loadImageList();
          this.updateStats();

          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 图片加载错误处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    console.error('图片加载失败:', this.data.imageList[index]);

    // 更新状态
    const imageList = this.data.imageList;
    imageList[index].status = 'error';
    imageList[index].statusText = '加载失败';
    imageList[index].statusClass = 'failed';

    this.setData({
      imageList: imageList
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '图片资源管理 - 云上长征',
      path: '/pages/image-manager/image-manager'
    };
  }
});
