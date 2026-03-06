// pages/user-home/user-home.js
Page({
  data: {
    userInfo: null,
    processedAvatarUrl: '',
    backgroundImageUrl: '', // 将在onLoad中异步获取
    totalSteps: 0,
    totalKm: 0, // 微信步数转换的公里数
    exerciseTotalKm: 0, // 运动轨迹的总公里数
    totalScore: 0, // 长征总里程：步数公里数×20 + 运动公里数×40
    totalScoreDisplay: 0, // 显示用的长征总里程（去掉不必要的.00）
    todaySteps: 0,
    currentLocation: '未开始',
    _forceUpdateTrigger: 0, // 用于强制触发页面重新渲染
    chapterList: [] // 章节列表，包含解锁状态
  },


  // 格式化数字显示，整数时去掉.00后缀
  formatScoreDisplay(score) {
    const num = Number(score);
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  },

  // 强制更新章节状态（用于数据加载完成后重新渲染）
  forceUpdateChapters() {
    // 通过更新一个dummy字段来强制触发页面重新渲染
    // 这样可以确保章节解锁状态基于最新的totalScore重新计算
    this.setData({
      _forceUpdateTrigger: Date.now() // 使用时间戳作为触发器
    });
    console.log('✅ 已触发章节状态重新渲染');
  },

  // 获取所有用户的统计数据（步数和运动数据）
  async loadAllUserStats() {
    console.log('📊 开始获取用户统计数据...');

    // 并行获取微信步数数据和云数据库运动数据
    const [wechatData, cloudData] = await Promise.all([
      this.loadWechatSteps(),
      this.loadCloudUserStats()
    ]);

    // 合并数据，确保所有数值都是数字类型
    const userStats = {
      wechatSteps: Number(wechatData?.yesterdaySteps || 0),
      totalSteps: Number(wechatData?.totalSteps || 0),
      totalKm: wechatData ? this.calculateKmFromSteps(wechatData.totalSteps) : 0,
      exerciseTotalKm: Number(cloudData?.exerciseTotalKm || 0),
      todaySteps: Number(wechatData?.yesterdaySteps || 0),
      // 如果有云数据库的运动数据，优先使用，否则使用微信数据
      finalTotalKm: Number(cloudData?.totalKm || (wechatData ? this.calculateKmFromSteps(wechatData.totalSteps) : 0)),
      finalExerciseTotalKm: Number(cloudData?.exerciseTotalKm || 0)
    };

    console.log('📈 用户统计数据获取完成:', userStats);
    return userStats;
  },

  // 从云数据库获取用户的运动统计数据（只返回原始数据，不计算totalScore）
  async loadCloudUserStats() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserTotalSteps'
      });

      if (result.result.code === 0) {
        const userData = result.result.data;
        return {
          totalKm: parseFloat(userData.totalKm || 0),
          exerciseTotalKm: parseFloat(userData.exerciseTotalKm || 0)
        };
      }
    } catch (error) {
      console.error('获取云数据库运动数据失败:', error);
    }
    return { totalKm: 0, exerciseTotalKm: 0 };
  },

  // 计算长征总里程
  calculateTotalScore(userStats) {
    const { finalTotalKm, finalExerciseTotalKm } = userStats;
    // 长征总里程 = 步数公里数 × 20 + 运动公里数 × 40
    const totalScore = finalTotalKm * 20 + finalExerciseTotalKm * 40;

    console.log(`🧮 计算长征总里程: ${finalTotalKm}×20 + ${finalExerciseTotalKm}×40 = ${totalScore}`);
    return totalScore;
  },

  // 设置用户统计数据到页面
  async setUserStatsToPage(userStats, totalScore) {
    const { totalSteps, finalTotalKm, finalExerciseTotalKm, todaySteps } = userStats;

    // 计算当前位置
    const currentLocation = this.getLastUnlockedChapter(totalScore);

    // 计算章节解锁状态列表
    const chapterList = await this.calculateChapterList();

    this.setData({
      totalSteps: totalSteps,
      totalKm: Number(finalTotalKm || 0).toFixed(2),
      exerciseTotalKm: Number(finalExerciseTotalKm || 0).toFixed(2),
      totalScore: totalScore,
      totalScoreDisplay: this.formatScoreDisplay(totalScore),
      todaySteps: todaySteps,
      currentLocation: currentLocation,
      chapterList: chapterList
    });

    console.log('📊 页面数据设置完成');
  },

  // 计算章节解锁状态列表（基于长征总里程）
  async calculateChapterList() {
    const chapterConfigs = [
      { name: "瑞金出发", requirement: 0, imageName: "瑞金出发_图标.jpg" },
      { name: "湘江战役", requirement: 1300, imageName: "湘江战役_图标.jpg" },
      { name: "遵义会议", requirement: 2800, imageName: "遵义会议_图标.jpg" },
      { name: "四渡赤水", requirement: 4200, imageName: "四渡赤水_图标.jpg" },
      { name: "强渡大渡河", requirement: 6200, imageName: "强渡大渡河_图标.jpg" },
      { name: "飞夺泸定桥", requirement: 6800, imageName: "飞夺泸定桥_图标.jpg" },
      { name: "翻越夹金山", requirement: 7800, imageName: "翻越夹金山_图标.jpg" },
      { name: "腊子口战役", requirement: 13400, imageName: "腊子口战役_图标.jpg" },
      { name: "会宁会师", requirement: 25000, imageName: "会宁会师_图标.jpg" }
    ];

    // 异步获取所有图片URL
    const chapters = await Promise.all(
      chapterConfigs.map(async (config) => ({
        name: config.name,
        requirement: config.requirement,
        image: await getApp().getImageUrl(config.imageName)
      }))
    );

    const userTotalScore = Number(this.data.totalScore) || 0;
    console.log(`🧮 计算章节解锁状态，总里程: ${userTotalScore}`);

    const chapterList = chapters.map(chapter => {
      // 根据长征总里程判断是否解锁（所有章节都使用相同的逻辑）
      const isUnlocked = userTotalScore >= chapter.requirement;

      // 特别关注遵义会议的解锁状态
      if (chapter.name === '遵义会议') {
        console.log(`🎯 遵义会议解锁检查: 总里程=${userTotalScore}, 需求=${chapter.requirement}, 结果=${isUnlocked ? '已解锁' : '未解锁'}`);
      }

      console.log(`📖 章节 "${chapter.name}": 需求=${chapter.requirement}, 结果=${isUnlocked ? '已解锁' : '未解锁'}`);

      return {
        name: chapter.name,
        image: chapter.image,
        isUnlocked: isUnlocked,
        statusText: isUnlocked ? '已解锁' : '未解锁'
      };
    });

    return chapterList;
  },

  async onLoad(options) {
    console.log('用户首页加载');

    // 设置背景图片URL（已在应用启动时预加载）
    const backgroundImageUrl = await getApp().getImageUrl('用户页背景.jpg');
    this.setData({ backgroundImageUrl });

    this.initImageManager();
    this.loadUserData();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadUserData();
  },

  // 初始化图片管理器
  async initImageManager() {
    try {
      const app = getApp();
      if (app.globalData.imageManager) {
        this.imageManager = app.globalData.imageManager;
        // 获取用户页背景图片URL
        const bgImageUrl = await this.imageManager.getImageUrl('用户页背景.jpg');
        this.setData({
          backgroundImageUrl: bgImageUrl
        });
      }
    } catch (error) {
      console.error('初始化图片管理器失败:', error);
    }
  },

  // 加载用户数据
  async loadUserData() {
    const app = getApp();

    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    console.log('🚀 开始加载用户数据');

    try {
      // 从云数据库获取最新用户信息
      await this.loadUserInfoFromCloud();

      // 获取所有步数和运动数据
      const userStats = await this.loadAllUserStats();

      // 基于获取的数据计算长征总里程
      const totalScore = this.calculateTotalScore(userStats);

      // 设置页面数据
      await this.setUserStatsToPage(userStats, totalScore);

      // 触发章节解锁状态更新
      this.forceUpdateChapters();

      console.log('✅ 用户数据加载完成，长征总里程:', totalScore);
    } catch (error) {
      console.error('❌ 用户数据加载失败:', error);
      // 设置默认数据
      this.setData({
        totalSteps: 0,
        totalKm: 0,
        exerciseTotalKm: 0,
        totalScore: 0,
        totalScoreDisplay: 0,
        todaySteps: 0,
        currentLocation: '未开始'
      });
    }
  },

  // 从云数据库加载用户信息
// 从云数据库加载用户信息
async loadUserInfoFromCloud() {
  const app = getApp();
  const openid = app.globalData.openid;

  console.log('🔄 开始加载用户信息，openid:', openid);
  console.log('📱 当前全局用户信息:', app.globalData.userInfo);

  if (!openid) {
    console.log('❌ 没有openid，使用本地用户信息');
    const userInfo = app.globalData.userInfo || {};
    console.log('📱 本地用户信息:', userInfo);
    const processedAvatarUrl = await this.processAvatarUrl(userInfo.avatarUrl);
    console.log('🖼️ 处理后的头像URL:', processedAvatarUrl);
    
    this.setData({
      userInfo: userInfo,
      processedAvatarUrl: processedAvatarUrl
    });
    return;
  }

  try {
    const db = wx.cloud.database();
    const collection = db.collection('user_profiles');

    console.log('☁️ 从云数据库获取用户信息，openid:', openid);

    const res = await collection.doc(openid).get();
    console.log('☁️ 云数据库返回:', res);

    if (res.data && res.data.nickName) {
      console.log('✅ 从云数据库获取到用户信息:', res.data);

      // 处理头像URL
      let avatarUrl = res.data.avatarUrl || '';
      console.log('🖼️ 原始头像URL:', avatarUrl);
      
      if (avatarUrl.startsWith('wxfile://')) {
        console.log('⚠️ 检测到临时文件路径，设置为空');
        avatarUrl = ''; // 临时文件路径无效，设置为空
      }

      const cloudUserInfo = {
        nickName: res.data.nickName,
        avatarUrl: avatarUrl,
        ...res.data // 保留其他字段
      };

      // 更新全局数据和本地存储
      app.globalData.userInfo = cloudUserInfo;
      wx.setStorageSync('userInfo', cloudUserInfo);

      // 处理头像URL并设置页面数据
      const processedAvatarUrl = await this.processAvatarUrl(avatarUrl);
      console.log('🖼️ 最终处理后的头像URL:', processedAvatarUrl);
      
      this.setData({
        userInfo: cloudUserInfo,
        processedAvatarUrl: processedAvatarUrl
      });

      console.log('✅ 用户信息更新完成');
    } else {
      console.log('❌ 云数据库中没有用户信息，使用本地数据');
      // 使用本地数据
      const userInfo = app.globalData.userInfo || {};
      const processedAvatarUrl = await this.processAvatarUrl(userInfo.avatarUrl);
      console.log('🖼️ 本地处理后的头像URL:', processedAvatarUrl);
      
      this.setData({
        userInfo: userInfo,
        processedAvatarUrl: processedAvatarUrl
      });
    }
  } catch (error) {
    console.error('❌ 从云数据库获取用户信息失败:', error);

    // 失败时使用本地数据
    const userInfo = app.globalData.userInfo || {};
    const processedAvatarUrl = await this.processAvatarUrl(userInfo.avatarUrl);
    console.log('🖼️ 错误时处理后的头像URL:', processedAvatarUrl);
    
    this.setData({
      userInfo: userInfo,
      processedAvatarUrl: processedAvatarUrl
    });
  }
},

  // 计算步数对应的公里数
  calculateKmFromSteps(steps) {
    // 每步0.7米，转换为公里
    return steps * 0.7 / 1000;
  },

  // 根据长征总里程获取最后解锁的章节
  getLastUnlockedChapter(totalScore) {
    const chapters = [
      { name: "瑞金出发", requirement: 0 },
      { name: "湘江战役", requirement: 1300 },
      { name: "遵义会议", requirement: 2800 },
      { name: "四渡赤水", requirement: 4200 },
      { name: "强渡大渡河", requirement: 6200 },
      { name: "飞夺泸定桥", requirement: 6800 },
      { name: "翻越夹金山", requirement: 7800 },
      { name: "腊子口战役", requirement: 13400 },
      { name: "会宁会师", requirement: 25000 }
    ];

    // 找到用户能解锁的最后一个章节
    let lastUnlocked = "未开始";
    for (const chapter of chapters) {
      if (totalScore >= chapter.requirement) {
        lastUnlocked = chapter.name;
      } else {
        break; // 后面的章节都无法解锁
      }
    }

    return lastUnlocked;
  },


  // 获取微信步数数据
  async loadWechatSteps() {
    return new Promise((resolve, reject) => {
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

              // 保存步数统计信息到本地存储
              wx.setStorageSync('stepStatistics', {
                totalSteps: stepData.totalSteps,
                todaySteps: stepData.yesterdaySteps,
                monthlySteps: stepData.monthlySteps,
                timestamp: stepData.timestamp
              });

              // 将总步数转换为公里数并存储到云数据库
              await this.saveTotalStepsToCloud(stepData.totalSteps);

              resolve(stepData);
            } else {
              console.error('获取步数失败：', cloudResult.result.message);
              // 使用本地缓存的数据
              this.loadCachedSteps();
              resolve(null);
            }
          } catch (error) {
            wx.hideLoading();
            console.error('调用云函数失败：', error);
            // 使用本地缓存的数据
            this.loadCachedSteps();
            resolve(null);
          }
        },
        fail: (error) => {
          console.log('获取微信运动数据失败：', error);
          // 使用本地缓存的数据
          this.loadCachedSteps();
          resolve(null);
        }
      });
    });
  },


  // 将总步数转换为公里数并存储到云数据库（只更新步数相关字段）
  async saveTotalStepsToCloud(totalSteps) {
    try {
      const app = getApp();
      const openid = app.globalData.openid;

      if (!openid) {
        console.error('无法获取用户openid，跳过步数存储');
        return;
      }

      // 计算公里数：每步0.7米，转换为公里
      const totalKm = (totalSteps * 0.7 / 1000).toFixed(2);

      console.log(`保存用户总步数: ${totalSteps}步 → ${totalKm}公里 (步数转换)`);

      const db = wx.cloud.database();

      // 先查询现有记录，保留运动轨迹公里数
      let existingData = {};
      try {
        const result = await db.collection('user_total_steps')
          .where({ userId: openid })
          .get();
        if (result.data && result.data.length > 0) {
          existingData = result.data[0];
        }
      } catch (e) {
        console.log('查询现有记录失败，将创建新记录');
      }

      // 使用upsert操作：如果记录存在则更新，不存在则新增
      // 只更新步数相关的字段，保留运动轨迹公里数
      await db.collection('user_total_steps').doc(openid).set({
        data: {
          userId: openid,
          totalSteps: totalSteps,
          totalKm: Number(totalKm), // 步数转换的公里数
          exerciseTotalKm: existingData.exerciseTotalKm || 0, // 保留运动轨迹公里数
          lastUpdated: new Date()
        }
      });

      console.log('✅ 用户总步数和步数公里数已成功存储到云数据库');

    } catch (error) {
      console.error('❌ 存储用户总步数失败:', error);
    }
  },

  // 加载缓存的步数数据
  async loadCachedSteps() {
    try {
      const cachedData = wx.getStorageSync('stepStatistics');
      if (cachedData && cachedData.totalSteps) {
        const totalSteps = cachedData.totalSteps || 0;
        const todaySteps = cachedData.todaySteps || 0;
        const totalStepsWithToday = totalSteps + todaySteps; // 累计步数 + 今日步数
        const totalKm = this.calculateKmFromSteps(totalStepsWithToday);
        const calculatedScore = totalKm * 20; // 只有步数公里数，计算长征总里程（返回数字）
        const currentLocation = this.getLastUnlockedChapter(calculatedScore);

        this.setData({
          totalSteps: totalStepsWithToday,
          totalKm: Number(totalKm).toFixed(2),
          exerciseTotalKm: '0.00', // 缓存数据中没有运动轨迹公里数，设为0
          totalScore: calculatedScore,
          totalScoreDisplay: this.formatScoreDisplay(calculatedScore),
          todaySteps: todaySteps,
          currentLocation: currentLocation
        });
        console.log('使用缓存的步数数据:', cachedData);

        // 即使使用缓存数据，也尝试更新云数据库
        await this.saveTotalStepsToCloud(cachedData.totalSteps);
      } else {
        this.setData({
          totalSteps: 0,
          totalKm: 0,
          todaySteps: 0
        });
      }
    } catch (error) {
      console.error('加载缓存步数失败:', error);
      this.setData({
        totalSteps: 0,
        totalKm: 0,
        todaySteps: 0
      });
    }
  },

  // 处理头像URL
// 处理头像URL
async processAvatarUrl(avatarUrl) {
  console.log('🖼️ 开始处理头像URL:', avatarUrl);
  
  // 检查头像URL是否有效
  if (!avatarUrl || avatarUrl.trim() === '' || avatarUrl === 'null' || avatarUrl === 'undefined') {
    console.log('❌ 头像URL无效，使用默认头像');
    // 尝试从全局数据获取
    const app = getApp();
    if (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) {
      console.log('🔄 尝试从全局数据获取头像');
      const globalAvatarUrl = app.globalData.userInfo.avatarUrl;
      if (globalAvatarUrl && !globalAvatarUrl.startsWith('wxfile://')) {
        return globalAvatarUrl;
      }
    }
    return this.getDefaultAvatar();
  }

  // 检查是否是云存储的文件ID
  if (avatarUrl.startsWith('cloud://')) {
    try {
      console.log('☁️ 检测到云存储头像，开始获取临时URL');
      const tempUrl = await this.getCloudAvatarUrl(avatarUrl);
      console.log('☁️ 云存储头像临时URL:', tempUrl);
      return tempUrl || this.getDefaultAvatar();
    } catch (error) {
      console.error('❌ 获取云存储头像URL失败:', error);
      return this.getDefaultAvatar();
    }
  }

  // 检查是否是临时的wxfile://路径
  if (avatarUrl.startsWith('wxfile://')) {
    console.log('⚠️ 检测到临时头像路径，使用默认头像');
    return this.getDefaultAvatar();
  }

  // 检查是否是http/https链接
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    console.log('🌐 检测到网络头像URL，直接使用');
    return avatarUrl;
  }

  // 其他情况使用默认头像
  console.log('❓ 未知的头像URL格式，使用默认头像');
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
    // 返回一个占位符，让CSS处理默认显示
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTAwIiB5Mj0iMTAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNlODI0MWQiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZWY3MDRkIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2Zz4K'; // 返回一个小的SVG占位符
  },

  // 头像加载错误处理
  onAvatarLoadError(e) {
    console.log('头像加载失败，使用默认头像');
    this.setData({
      processedAvatarUrl: this.getDefaultAvatar()
    });
  },

  // 加载章节数据

  // 跳转到设置页面
  goToSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
    // 这里可以跳转到设置页面
    // wx.navigateTo({
    //   url: '/pages/settings/settings'
    // });
  },

  // 跳转到运动记录页面
  goToExerciseRecord() {
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '查看运动记录需要先登录',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          wx.switchTab({
            url: '/pages/profile/profile'
          });
        }
      });
      return;
    }

    // 跳转到轨迹记录页面的历史记录模式
    wx.navigateTo({
      url: '/pages/track/track?mode=history'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();

          // 清除全局登录状态
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;
          app.globalData.openid = null;

          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('stepStatistics');

          // 清除其他相关数据
          wx.removeStorageSync('longMarchSteps');

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500
          });

          // 延迟跳转到登录页面
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
        }
      }
    });
  },

  // 跳转到地图页面

  onShareAppMessage() {
    return {
      title: '云上长征 - 重温红色历史',
      path: '/pages/index/index'
    };
  }
});
