Page({
  data: {
    // 步数相关数据
    yesterdaySteps: 0,
    wechatSteps: 0,
    longMarchSteps: 0,
    canExchange: true,
    currentLocation: '未开始',
    nextLocation: '瑞金',
    stepsToNext: 5000,
    // 前端UI相关数据
    currentTab: 0,
    currentSubTab: 0,
    // 用户状态
    isLoggedIn: false,
    processedAvatarUrl: '',
    // 图片URL
    backgroundImageUrl: '',
    userIconUrl: '',
    dialogIconUrl: '',
    relicIconUrl: '',
    diaryIconUrl: '',
    paintIconUrl: '',
    mapIconUrl: '',
    runIconUrl: '',
    // 场景图片
    rujinImageUrl: '',
    xiangjiangImageUrl: '',
    zunyiImageUrl: '',
    siduImageUrl: '',
    qiangduImageUrl: '',
    ludingImageUrl: '',
    jiajinImageUrl: '',
    laziImageUrl: '',
    huiningImageUrl: ''
  },

  async onLoad() {
    // 设置所有图片URL（已在应用启动时预加载）
    await this.setAllImageUrls();

    await this.updateLoginStatus();
    this.getStepData();
  },

  async onShow() {
    await this.updateLoginStatus();
    this.getStepData();
  },

  // 更新登录状态
  async updateLoginStatus() {
    const app = getApp();
    const isLoggedIn = app.globalData.isLoggedIn;

    let processedAvatarUrl = '';
    if (isLoggedIn && app.globalData.userInfo) {
      processedAvatarUrl = await this.processAvatarUrl(app.globalData.userInfo.avatarUrl);
    }

    this.setData({
      isLoggedIn: isLoggedIn,
      processedAvatarUrl: processedAvatarUrl
    });
  },

  async getStepData() {
    const app = getApp();

    // 检查是否已登录
    if (!app.globalData.isLoggedIn) {
      console.log('用户未登录，所有步数显示为0');
      // 未登录时步数显示为0
      this.setData({
        wechatSteps: 0
      });
    } else {
      // 获取微信步数
      wx.getWeRunData({
        success: async (res) => {
          try {
            // 调用云函数处理微信运动数据
            const cloudResult = await wx.cloud.callFunction({
              name: 'getWeRunSteps',
              data: {
                weRunData: wx.cloud.CloudID(res.cloudID)
              }
            });

            wx.hideLoading();

            if (cloudResult.result.code === 0) {
              const stepData = cloudResult.result.data;
              this.setData({
                wechatSteps: stepData.yesterdaySteps || 0
              });

              // 可以保存更多步数统计信息到本地存储
              wx.setStorageSync('stepStatistics', {
                yesterdaySteps: stepData.yesterdaySteps,
                monthlySteps: stepData.monthlySteps,
                totalSteps: stepData.totalSteps,
                timestamp: stepData.timestamp
              });

            } else {
              console.error('获取步数失败：', cloudResult.result.message);
              // 失败时使用模拟数据
              this.setData({
                wechatSteps: 8070
              });
            }
          } catch (error) {
            wx.hideLoading();
            console.error('调用云函数失败：', error);
            // 失败时使用模拟数据
            this.setData({
              wechatSteps: 8070
            });
          }
        },
        fail: (error) => {
          console.log('获取微信运动数据失败：', error);
          // 用户未授权或获取失败，使用模拟数据
          this.setData({
            wechatSteps: 8070
          });
        }
      });
    }

    // 获取已有的长征步数
    const longMarchSteps = wx.getStorageSync('longMarchSteps') || 0;
    const todayExchanged = wx.getStorageSync('todayExchanged') || false;
    const exchangeDate = wx.getStorageSync('exchangeDate') || '';
    const today = new Date().toDateString();

    this.setData({
      longMarchSteps: longMarchSteps,
      canExchange: !todayExchanged || exchangeDate !== today,
      currentLocation: this.getCurrentLocation(longMarchSteps)
    });
  },

  getCurrentLocation(steps) {
    if (steps < 5000) return '未开始';
    if (steps < 15000) return '瑞金';
    if (steps < 25000) return '遵义';
    if (steps < 35000) return '泸定';
    if (steps < 50000) return '会宁';
    return '延安';
  },

  exchangeSteps() {
    if (!this.data.canExchange) {
      wx.showToast({
        title: '今日已兑换',
        icon: 'none'
      });
      return;
    }

    if (this.data.wechatSteps === 0) {
      wx.showToast({
        title: '暂无可兑换步数',
        icon: 'none'
      });
      return;
    }

    const newLongMarchSteps = this.data.longMarchSteps + this.data.wechatSteps;
    const today = new Date().toDateString();

    // 保存数据
    wx.setStorageSync('longMarchSteps', newLongMarchSteps);
    wx.setStorageSync('todayExchanged', true);
    wx.setStorageSync('exchangeDate', today);

    this.setData({
      longMarchSteps: newLongMarchSteps,
      canExchange: false,
      currentLocation: this.getCurrentLocation(newLongMarchSteps)
    });

    wx.showToast({
      title: `成功兑换${this.data.wechatSteps}步`,
      icon: 'success'
    });

    // 检查是否解锁新章节
    this.checkUnlockedChapters(newLongMarchSteps);
  },

  checkUnlockedChapters(steps) {
    const milestones = [
      { steps: 5000, name: '瑞金' },
      { steps: 15000, name: '遵义会议' },
      { steps: 25000, name: '飞夺泸定桥' },
      { steps: 35000, name: '爬雪山过草地' },
      { steps: 50000, name: '三军会师' }
    ];

    const oldSteps = this.data.longMarchSteps;
    for (let milestone of milestones) {
      if (oldSteps < milestone.steps && steps >= milestone.steps) {
        wx.showModal({
          title: '恭喜！',
          content: `您已抵达${milestone.name}，解锁了新的章节内容！`,
          showCancel: false,
          confirmText: '去查看',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/chapters/chapters'
              });
            }
          }
        });
        break;
      }
    }
  },

  // 前端UI相关方法
  // 切换主标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: parseInt(tab),
      currentSubTab: 0 // 重置子标签页
    });
  },

  // 切换子标签页
  switchSubTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentSubTab: parseInt(tab)
    });
  },

  // 导航到登录页面或用户首页
  navigateToLogin() {
    const app = getApp();
    if (app.globalData.isLoggedIn) {
      // 已登录，跳转到用户首页
      wx.navigateTo({
        url: '/pages/user-home/user-home'
      });
    } else {
      // 未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },


  // 导航到对话页面
  navigateToDialog() {
    wx.navigateTo({
      url: '/pages/dialog/dialog'
    });
  },

  // 导航到文物页面
  navigateToObject() {
    wx.navigateTo({
      url: '/pages/object/object'
    });
  },

  // 导航到语音页面
  navigateToVoice() {
    wx.navigateTo({
      url: '/pages/voice_diary/voice_diary'
    });
  },

  // 导航到图像页面
  navigateToChallenge() {
    wx.navigateTo({
      url: '/pages/challenge/challenge'
    });
  },

  // 导航到具体场景
  navigateToScene(e) {
    const scene = e.currentTarget.dataset.scene;
    wx.navigateTo({
      url: `/pages/scene_${scene}/scene_${scene}`
    });
  },


  goCard() {
    wx.navigateTo({
      url: '/pages/map/map'
    });
  },

  // 处理头像URL
  async processAvatarUrl(avatarUrl) {
    if (!avatarUrl) {
      return this.getDefaultAvatar();
    }

    // 检查是否是云存储的文件ID
    if (avatarUrl.startsWith('cloud://')) {
      try {
        console.log('检测到云存储头像，开始获取临时URL');
        const tempUrl = await this.getCloudAvatarUrl(avatarUrl);
        return tempUrl || this.getDefaultAvatar();
      } catch (error) {
        console.error('获取云存储头像URL失败:', error);
        return this.getDefaultAvatar();
      }
    }

    // 检查是否是临时的wxfile://路径
    if (avatarUrl.startsWith('wxfile://')) {
      console.log('检测到临时头像路径，使用默认头像');
      return this.getDefaultAvatar();
    }

    // 检查是否是http/https链接
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    // 其他情况使用默认头像
    return this.getDefaultAvatar();
  },

  // 获取云存储头像的临时URL
  async getCloudAvatarUrl(fileID) {
    return new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: [fileID],
        success: (res) => {
          if (res.fileList && res.fileList.length > 0 && res.fileList[0].tempFileURL) {
            console.log('获取云存储头像临时URL成功');
            resolve(res.fileList[0].tempFileURL);
          } else {
            console.warn('获取云存储头像临时URL失败');
            resolve(null);
          }
        },
        fail: (error) => {
          console.error('获取云存储头像临时URL失败:', error);
          resolve(null);
        }
      });
    });
  },

  // 获取默认头像
  getDefaultAvatar() {
    return ''; // 返回空字符串，CSS会处理默认显示
  },

  // 设置所有图片URL
  async setAllImageUrls() {
    try {
      // 由于图片已在应用启动时预加载，这里直接获取缓存的URL
      const imageData = {
        backgroundImageUrl: await getApp().getImageUrl('背景.png'),
        userIconUrl: await getApp().getImageUrl('用户.png'),
        dialogIconUrl: await getApp().getImageUrl('对话.png'),
        relicIconUrl: await getApp().getImageUrl('文物.png'),
        diaryIconUrl: await getApp().getImageUrl('日记.png'),
        paintIconUrl: await getApp().getImageUrl('画板.png'),
        mapIconUrl: await getApp().getImageUrl('地图.jpg'),
        runIconUrl: await getApp().getImageUrl('跑步.png'),
        rujinImageUrl: await getApp().getImageUrl('瑞金出发.jpg'),
        xiangjiangImageUrl: await getApp().getImageUrl('湘江.jpg'),
        zunyiImageUrl: await getApp().getImageUrl('遵义会议.jpg'),
        siduImageUrl: await getApp().getImageUrl('四渡赤水.jpg'),
        qiangduImageUrl: await getApp().getImageUrl('强渡大渡河.jpg'),
        ludingImageUrl: await getApp().getImageUrl('泸定桥.jpg'),
        jiajinImageUrl: await getApp().getImageUrl('夹金山.jpg'),
        laziImageUrl: await getApp().getImageUrl('腊子口战役.jpg'),
        huiningImageUrl: await getApp().getImageUrl('会宁会师.jpg')
      };

      this.setData(imageData);
      console.log('首页图片URL设置完成');
    } catch (error) {
      console.log('设置首页图片URL异常:', error.message);
    }
  },

  // 头像加载错误处理
  onAvatarLoadError(e) {
    console.log('首页头像加载失败，使用默认头像');
    this.setData({
      processedAvatarUrl: this.getDefaultAvatar()
    });
  },

  onShareAppMessage() {
    return {
      title: '云上长征 - 重温红色历史',
      path: '/pages/index/index'
    };
  }
}); 