const DEFAULT_CENTER = { latitude: 27.8, longitude: 106.9 };

Page({
  data: {
    latitude: DEFAULT_CENTER.latitude,
    longitude: DEFAULT_CENTER.longitude,
    scale: 5,
    satellite: true,
    markers: [],
    polyline: [],
    // 新增步数相关数据
    todaySteps: 0,
    todayDistance: 0,
    totalSteps: 0,
    currentLocation: "瑞金",
    nextDestination: "血战湘江",
    progressPercent: 0,
    // 长征总里程相关数据
    totalScore: 0, // 用户的长征总里程
    todayProgress: 0, // 今日前进（公里）
    totalProgress: 0 // 累计前进（公里）
  },

  onShow() {
    this.loadCheckpoints();
    this.loadStepData();
    this.loadUserTotalScore(); // 获取用户的长征总里程
    const app = getApp();
    if (app && app.globalData && app.globalData.focusPoint) {
      const { latitude, longitude, name, scale } = app.globalData.focusPoint;
      this.setData({ latitude, longitude, scale: scale || 12 }, () => {
        const marker = (this.data.markers || []).find(m => m.name === name);
        if (marker) {
          const markers = this.data.markers.map(m => m.id === marker.id ? { ...m, callout: { content: `${m.name}`, display: "ALWAYS" } } : m);
          this.setData({ markers });
          setTimeout(() => {
            const revert = this.data.markers.map(m => m.id === marker.id ? { ...m, callout: { content: `${m.name}`, display: "BYCLICK" } } : m);
            this.setData({ markers: revert });
          }, 1600);
        }
      });
      app.globalData.focusPoint = null;
    }
  },

  // 获取微信运动步数数据
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
              const yesterdaySteps = stepData.yesterdaySteps || 0;

              // 计算今日前进：yesterdaySteps * 0.7 / 100
              const todayProgress = (yesterdaySteps * 0.7 / 100).toFixed(2);

              resolve({
                yesterdaySteps: yesterdaySteps,
                todayProgress: todayProgress,
                stepData: stepData
              });
            } else {
              console.error('获取步数失败：', cloudResult.result.message);
              resolve({
                yesterdaySteps: 0,
                todayProgress: 0,
                stepData: null
              });
            }
          } catch (error) {
            wx.hideLoading();
            console.error('调用云函数失败：', error);
            resolve({
              yesterdaySteps: 0,
              todayProgress: 0,
              stepData: null
            });
          }
        },
        fail: (error) => {
          console.log('获取微信运动数据失败：', error);
          resolve({
            yesterdaySteps: 0,
            todayProgress: 0,
            stepData: null
          });
        }
      });
    });
  },

  loadStepData() {
  // 获取长征步数和计算距离
  const longMarchSteps = wx.getStorageSync("longMarchSteps") || 0;

  // 获取微信运动数据（yesterdaySteps）
  this.loadWechatSteps().then(async (stepResult) => {
    const yesterdaySteps = stepResult.yesterdaySteps;

    const todayDistance = (yesterdaySteps * 0.6 / 1000).toFixed(2); // 假设每步0.6米

    // 获取今日运动距离
    let todayExerciseKm = 0;
    try {
      const app = getApp();
      if (app.globalData.openid) {
        const db = wx.cloud.database();
        const userResult = await db.collection('user_total_steps')
          .where({
            userId: app.globalData.openid
          })
          .get();

        if (userResult.data && userResult.data.length > 0) {
          todayExerciseKm = Number(userResult.data[0].todayExerciseKm || 0);
        }
      }
    } catch (error) {
      console.error('获取今日运动距离失败:', error);
    }

    // 计算今日前进：今日步数*0.7*2/100 + 今日运动距离*2*20
    const todayProgress = (yesterdaySteps * 0.7 * 2 / 100 + todayExerciseKm * 2 * 20).toFixed(2);


    const totalSteps = wx.getStorageSync("totalSteps") || 0; // 获取总步数
    const totalDistance = (totalSteps * 0.6 / 1000).toFixed(2); // 用总步数计算累计距离

    // 计算当前段落的进度百分比
    const { currentLocation, nextDestination, progressPercent } = this.calculateProgress(longMarchSteps);

    this.setData({
      todaySteps: yesterdaySteps,
      todayDistance: todayDistance,
      todayProgress: todayProgress,
      totalSteps: longMarchSteps, 
      totalDistance: totalDistance, 
      currentLocation: currentLocation,
      nextDestination: nextDestination,
      progressPercent: progressPercent
    });
  }).catch((error) => {
    console.error('加载步数数据失败:', error);
    // 设置默认值
    this.setData({
      todaySteps: 0,
      todayDistance: 0,
      todayProgress: 0,
      totalSteps: 0,
      totalDistance: 0,
      currentLocation: '未开始',
      progressPercent: 0
    });
  });
},

  // 获取用户的长征总里程
  async loadUserTotalScore() {
    try {
      // 调用云函数获取用户的总公里数
      const result = await wx.cloud.callFunction({
        name: 'getUserTotalSteps'
      });

      if (result.result.code === 0) {
        const userData = result.result.data;
        const totalScore = Number(userData.totalScore || 0);

        console.log(`✅ 获取用户长征总里程成功: ${totalScore}`);

        // 更新页面数据，累计前进直接使用长征总里程
        this.setData({
          totalScore: totalScore,
          totalProgress: totalScore.toFixed(2) // 累计前进 = 长征总里程
        });

        // 重新设置markers以反映解锁状态
        await this.setMarkersAfterDataLoaded();
      } else {
        console.warn('获取用户长征总里程失败:', result.result.message);
        this.setData({
          totalScore: 0
        });
      }
    } catch (error) {
      console.error('❌ 获取用户长征总里程失败:', error);
      this.setData({
        totalScore: 0
      });
    }
  },
  calculateProgress(steps) {
    // 定义长征路线节点
    const destinations = [
      { name: "瑞金", minSteps: 0, maxSteps: 5000 },
      { name: "血战湘江", minSteps: 5000, maxSteps: 15000 },
      { name: "遵义会议", minSteps: 15000, maxSteps: 25000 },
      { name: "飞夺泸定桥", minSteps: 25000, maxSteps: 35000 },
      { name: "爬雪山过草地", minSteps: 35000, maxSteps: 50000 },
      { name: "三军会师", minSteps: 50000, maxSteps: 60000 }
    ];

    // 找到当前所在段落
    let currentIndex = 0;
    for (let i = 0; i < destinations.length - 1; i++) {
      if (steps >= destinations[i].minSteps && steps < destinations[i + 1].minSteps) {
        currentIndex = i;
        break;
      }
    }

    // 如果超过最后一个节点，显示最后一段
    if (steps >= destinations[destinations.length - 1].minSteps) {
      currentIndex = destinations.length - 2;
    }

    const currentLocation = destinations[currentIndex].name;
    const nextDestination = destinations[currentIndex + 1] ? destinations[currentIndex + 1].name : "胜利会师";
    
    // 计算当前段落的进度百分比
    const segmentStart = destinations[currentIndex].minSteps;
    const segmentEnd = destinations[currentIndex + 1] ? destinations[currentIndex + 1].minSteps : destinations[currentIndex].maxSteps;
    const segmentProgress = Math.max(0, Math.min(100, ((steps - segmentStart) / (segmentEnd - segmentStart)) * 100));

    return {
      currentLocation,
      nextDestination,
      progressPercent: segmentProgress
    };
  },

  // 设置markers，根据totalScore判断解锁状态
  async setMarkersAfterDataLoaded() {
    if (!this.checkpointData) return;

    const points = this.checkpointData.map(d => ({ latitude: d.latitude, longitude: d.longitude }));
    const polyline = points.length > 1 ? [{ points, color: "#8B0000", width: 3, dottedLine: false }] : [];

    // 获取红旗图标URL
    const app = getApp();
    const redFlagUrl = await app.getImageUrl('红旗.png');
    console.log('redFlagUrl:', redFlagUrl);

    // 只为主要节点创建markers，中间节点不显示红旗和标签
    const majorNodes = this.checkpointData.filter(pt => pt.isMajorNode === true);
    const markers = majorNodes.map((pt, idx) => {
      // 检查该节点是否已解锁
      const requiredScore = this.getRequiredScore(pt.name);
      const isUnlocked = this.data.totalScore >= requiredScore;

      // 直接使用本地图片路径
      const flagPath = '/images/index/红旗.png';
      console.log('使用的图片路径:', flagPath);

      return {
        id: idx + 1,
        latitude: pt.latitude,
        longitude: pt.longitude,
        title: pt.name,
        width: isUnlocked ? 34 : 26,
        height: isUnlocked ? 34 : 26,
        callout: { content: `${pt.name}`, display: "BYCLICK" },
        name: pt.name,
        iconPath: flagPath, // 使用本地红旗图片
        label: {
          content: pt.name,
          color: "#ffffff",
          fontSize: 12,
          bgColor: isUnlocked ? "#d4af37" : "#999999",
          borderRadius: 8,
          padding: 4,
          display: "ALWAYS"
        }
      };
    });

    this.setData({ markers, polyline });
  },

  onMarkerTap(e) {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '查看章节内容需要先登录并授权',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          // 跳转到个人资料页面进行登录
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      });
      return;
    }

    const markerId = e.detail && e.detail.markerId;
    const marker = (this.data.markers || []).find(m => m.id === markerId);
    
    if (marker && marker.name) {
      // 检查是否已解锁该章节
      const requiredScore = this.getRequiredScore(marker.name);

      if (this.data.totalScore < requiredScore) {
        wx.showModal({
          title: "章节未解锁",
          content: `需要达到${requiredScore}里才能解锁${marker.name}章节`,
          showCancel: false
        });
        return;
      }
      
      if (marker.name === "瑞金出发") {
        wx.navigateTo({ url: "/pages/scene_rj/scene_rj" });
      }else if (marker.name === "湘江战役") {
        wx.navigateTo({ url: "/pages/scene_xj/scene_xj" });
      }else if(marker.name === "四渡赤水") {
          wx.navigateTo({ url: "/pages/scene_sdcs/scene_sdcs" });
      }else if(marker.name === "腊子口战役") {
          wx.navigateTo({ url: "/pages/scene_lzk/scene_lzk" });
        }
        else if(marker.name === "会宁会师") {
          wx.navigateTo({ url: "/pages/scene_hn/scene_hn" });
        }else if(marker.name === "翻越夹金山") {
          wx.navigateTo({ url: "/pages/scene_jjs/scene_jjs" });
        }else if(marker.name === "飞夺泸定桥") {
          wx.navigateTo({ url: "/pages/scene_ldq/scene_ldq" });
        }else if(marker.name === "遵义会议"){
          wx.navigateTo({ url: '/pages/scene_zy/scene_zy' });
        }
        else if(marker.name === "强渡大渡河"){
          wx.navigateTo({ url: '/pages/scene_ddh/scene_ddh' });
        }
        else{
        wx.navigateTo({ url: `/pages/scene/scene?name=${encodeURIComponent(marker.name)}` });
      }
    }
  },

  getRequiredScore(locationName) {
    const requirements = {
      "瑞金出发": 0,
      "湘江战役": 1300,
      "遵义会议": 2800,
      "四渡赤水": 4200,
      "强渡大渡河": 6200,
      "飞夺泸定桥": 6800,
      "翻越夹金山": 7800,
      "胜利会师": 8600,
      "腊子口战役": 13400,
      "会宁会师": 25000
    };
    return requirements[locationName] || 0;
  },
  
  async loadCheckpoints() {
    try {
      wx.showLoading({ title: "加载中" });
      const res = await wx.cloud.callFunction({ name: "getCheckpoints" });
      const { code, data } = res.result || {};
      if (code === 0 && Array.isArray(data)) {
        const longMarchSteps = wx.getStorageSync("longMarchSteps") || 0;
        const points = data.map(d => ({ latitude: d.latitude, longitude: d.longitude }));
        const polyline = points.length > 1 ? [{ points, color: "#ff2d55", width: 3, dottedLine: false }] : [];
        const reachedCount = this.estimateReachedCount(points, longMarchSteps);
        // 存储检查点数据，等待totalScore加载完成后设置markers
        this.checkpointData = data;
        await this.setMarkersAfterDataLoaded();
        if (points[0]) {
          this.setData({ latitude: points[0].latitude, longitude: points[0].longitude });
        }
      } else {
        wx.showToast({ title: "数据格式错误", icon: "none" });
      }
    } catch (e) {
      console.error(e);
      wx.showToast({ title: "加载失败", icon: "none" });
    } finally {
      wx.hideLoading();
    }
  },

  estimateReachedCount(points, totalSteps) {
    // 根据步数估算到达的点位数量
    if (totalSteps < 0) return 1;
    if (totalSteps < 0) return 2;
    if (totalSteps < 0) return 3;
    if (totalSteps < 0) return 4;
    if (totalSteps < 0) return 5;
    return points.length;
  },

  distanceKm(a, b) {
    const toRad = (d) => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const la1 = toRad(a.latitude);
    const la2 = toRad(b.latitude);
    const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  },

  toggleSatellite() {
    this.setData({ satellite: !this.data.satellite });
  },

  startExercise() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '使用运动记录功能需要先登录',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      });
      return;
    }

    // 跳转到运动记录页面
    wx.navigateTo({
      url: '/pages/track/track'
    });
  },

  startTrack() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '使用轨迹记录功能需要先登录',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      });
      return;
    }

    // 跳转到轨迹记录页面（与运动记录使用同一个页面）
    wx.navigateTo({
      url: '/pages/track/track'
    });
  }
});
