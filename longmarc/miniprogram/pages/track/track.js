const app = getApp();

// 移除未使用的默认位置常量

Page({
  data: {
    currentMode: 'record', // 当前模式：'record' 或 'history'
    longitude: '',   // 地图定位点经度
    latitude: '',    // 地图定位点纬度
    markers: [],     // 记录轨迹起、终点坐标
    polyline: [],    // 轨迹路线
    positionArr: [], // 收集的定位点数组
    isTracking: false,
    isPaused: false, // 暂停状态
    distance: 0.0,
    time: '00:00:00',
    speed: 0.0,
    currentAddress: '',
    count: 0, // 用于计数，每3次提取一次位置信息
    scale: 16,
    trajectoryList: [], // 历史轨迹列表
    refresherTriggered: false, // 下拉刷新状态
    totalExerciseDistance: 0, // 运动总距离
    trajectoryBgUrl: '', // 轨迹背景图片URL
    // 效率计算相关
    currentEfficiency: 0, // 当前运动的长征里程转换
    stepEfficiency: 0, // 如果用步数计算的效率对比
    showEfficiencyTip: true // 控制运动效率提示的显示与隐藏
  },

  async onLoad(options) {
    // 设置轨迹背景图片URL（已在应用启动时预加载）
    const trajectoryBgUrl = await getApp().getImageUrl('轨迹背景.jpg');
    this.setData({ trajectoryBgUrl });

    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '需要登录才能使用轨迹记录功能',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      });
      return;
    }

    // 处理URL参数，设置初始模式
    if (options && options.mode) {
        this.setData({
        currentMode: options.mode
      });
    }

    // 初始化页面实例变量，用于性能优化
    this._positionArr = []; // 缓存轨迹点数组
    this._lastUpdateTime = 0; // 最后更新UI的时间

    // 直接获取当前位置
    this.getCurrentLocation();
  },

  onReady() {
    // 页面准备就绪时预热canvas，使用与实际绘制相同的尺寸
    console.log('页面准备就绪，预热canvas...');
  },

  onShow() {
    // 如果是历史模式，加载轨迹数据
    if (this.data.currentMode === 'history') {
      this.loadTrajectoryList();
    }
  },

  onHide() {
    // 页面隐藏时停止所有位置监听
    this.stopTracking();
  },

  onUnload() {
    // 页面卸载时清理资源
    this.stopTracking();
  },

  // 直接获取当前位置，不使用默认位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      altitude: false, // 不获取高度
      success: (res) => {
        console.log('当前位置获取成功:', res.latitude, res.longitude, '精度:', res.accuracy || '未知');
        console.log('原始GPS数据:', res);

    this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          currentAddress: `${res.latitude.toFixed(6)}, ${res.longitude.toFixed(6)}`
        });
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        wx.showModal({
          title: '位置获取失败',
          content: '无法获取您的当前位置，请检查位置权限设置或GPS是否开启。',
          showCancel: false,
          confirmText: '我知道了'
        });
        // 不设置默认位置，让用户知道位置获取失败
        this.setData({
          currentAddress: '位置获取失败'
        });
      }
    });
  },

  // 开始轨迹记录
  async startTracking() {
    try {
      // 检查是否是从暂停状态恢复
      if (this.data.isPaused) {
        console.log('从暂停状态恢复轨迹记录');
        
        // 计算暂停时长，调整开始时间
        const pauseDuration = Date.now() - this.pauseTime;
        this.data.startTime += pauseDuration;
        
        // 恢复状态
        this.setData({ 
          isPaused: false,
          isTracking: true 
        });

        // 重新启动位置更新
        await new Promise((resolve, reject) => {
          wx.startLocationUpdate({
            type: 'gcj02',
            success: resolve,
            fail: reject
          });
        });

        console.log('位置更新服务恢复成功');
        wx.onLocationChange(this.onLocationChange);
        wx.showToast({ title: '运动已恢复' });

        this.startTimer();
        return;
      }

      // 全新的轨迹记录开始
      // 先异步获取起始点标记图标
      const startMarkerIcon = await getApp().getImageUrl('start-marker.png');

      // 获取起始坐标
      const res = await new Promise((resolve, reject) => {
        wx.getLocation({
          type: 'gcj02',
          altitude: false,
          success: resolve,
          fail: reject
        });
      });

      const { latitude, longitude } = res;
      console.log('轨迹记录起始位置:', latitude, longitude, '精度:', res.accuracy || '未知');

      // 更新地图定位点
      this.setData({
        latitude: latitude,
        longitude: longitude,
        scale: 16
      });

      // 初始化位置记录，用于过滤异常位置
      this.lastLocation = {
        latitude: latitude,
        longitude: longitude,
        timestamp: Date.now()
      };

      // 初始化缓存数组
      this._positionArr = [[longitude, latitude]]; // 起始点

      // 设置起始点标记
      this.setData({
        markers: [{
          id: 0,
          latitude: latitude,
          longitude: longitude,
          iconPath: startMarkerIcon,
          width: 20,
          height: 20
        }],
        isTracking: true,
        isPaused: false,
        positionArr: this._positionArr, // 使用缓存数组
        distance: 0.0,
        time: '00:00:00',
        speed: 0.0,
        startTime: Date.now()
      });

      // 启动位置更新
      await new Promise((resolve, reject) => {
        wx.startLocationUpdate({
          type: 'gcj02',
          success: resolve,
          fail: reject
        });
      });

      console.log('位置更新服务启动成功');
      wx.onLocationChange(this.onLocationChange);
      wx.showToast({ title: '轨迹记录已启动' });

      this.startTimer();

    } catch (err) {
      console.error('启动轨迹记录失败:', err);
      wx.showModal({
        title: '无法开始运动',
        content: '获取您的当前位置失败，无法开始轨迹记录。请检查位置权限设置或GPS是否开启。',
        showCancel: false,
        confirmText: '我知道了'
      });
      // 不启动轨迹记录，保持页面初始状态
    }
  },

  // 停止轨迹记录
  stopTracking() {
    this.setData({ 
      isTracking: false,
      isPaused: false 
    });

    // 停止位置监听
    wx.offLocationChange(this.onLocationChange);
    wx.stopLocationUpdate({
      success: () => {
        console.log('Location update stopped');
      },
      fail: (err) => {
        console.error('Failed to stop location update:', err);
      }
    });

    // 停止计时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // 检查是否有有效的轨迹数据
    const hasValidTrajectory = this.data.positionArr && this.data.positionArr.length >= 2 && this.data.distance >= 0.1;

    if (hasValidTrajectory) {
      // 有有效的轨迹数据，提示用户是否保存
      wx.showModal({
        title: '运动结束',
        content: `本次运动距离：${this.data.distance.toFixed(2)} km\n用时：${this.data.time}\n是否保存此轨迹记录？`,
        confirmText: '保存',
        cancelText: '不保存',
        success: (res) => {
          if (res.confirm) {
            // 用户选择保存轨迹
            this.saveTrajectory();
          } else {
            // 用户选择不保存，重置页面状态
            this.setData({
              positionArr: [],
              polyline: [],
              markers: [],
              distance: 0.0,
              time: '00:00:00',
              speed: 0.0,
              isPaused: false
            });
            wx.showToast({ title: '轨迹已放弃' });
          }
        }
      });
    } else {
      // 没有有效的轨迹数据，直接提示
      wx.showToast({
        title: '轨迹记录已停止',
        icon: 'none',
        duration: 2000
      });
      // 重置页面状态
      this.setData({
        positionArr: [],
        polyline: [],
        markers: [],
        distance: 0.0,
        time: '00:00:00',
        speed: 0.0,
        isPaused: false
      });
    }
  },

  // 暂停轨迹记录
  pauseTracking() {
    console.log('暂停轨迹记录');
    
    // 设置暂停状态
    this.setData({ isPaused: true });
    
    // 停止位置监听
    wx.offLocationChange(this.onLocationChange);
    wx.stopLocationUpdate({
      success: () => {
        console.log('位置更新已暂停');
      },
      fail: (err) => {
        console.error('暂停位置更新失败:', err);
      }
    });

    // 停止计时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // 记录暂停时间，用于恢复时计算总时长
    this.pauseTime = Date.now();
    
    wx.showToast({ 
      title: '运动已暂停',
      icon: 'none',
      duration: 1500
    });
  },

  // 位置变化回调
  onLocationChange(res) {
    const { latitude, longitude, accuracy } = res;

    console.log('收到位置更新:', latitude, longitude, '精度:', accuracy || '未知');

    // 地理位置过滤 - 限制在中国境内
    if (latitude < 3.86 || latitude > 53.55 || longitude < 73.66 || longitude > 135.05) {
      console.log('位置超出中国境内，跳过:', latitude, longitude);
      return;
    }

    // 更新最后位置记录
    this.lastLocation = {
      latitude: latitude,
      longitude: longitude,
      timestamp: Date.now()
    };

    // 更新地图显示位置
    this.setData({
      latitude: latitude,
      longitude: longitude
    });

    // 按照规则收集定位点信息（每3次提取一次，提高收集频率）
    let count = this.data.count + 1;
    if (count >= 3) {
      count = 0;

      // 获取当前positionArr（使用缓存数组）
      const positionArr = [...this._positionArr];

      // 有效数据检测 - 与最后一个点比较距离和精度
      if (positionArr.length > 0) {
        const lastPoint = positionArr[positionArr.length - 1];
        const distance = this.getDistance(lastPoint[1], lastPoint[0], latitude, longitude);

        // 检查定位精度，如果精度太差（>100米）则丢弃
        const isAccurate = !accuracy || accuracy <= 100; // 100米以内认为精度可接受

        // 如果距离大于5米且定位精度良好，才认为是有效的新位置
        if (distance > 0.005 && isAccurate) { // 5米 + 精度过滤
          positionArr.push([longitude, latitude]);
          console.log('添加新轨迹点:', [longitude, latitude], `距离${distance.toFixed(3)}km, 精度${accuracy || '未知'}米`);
        } else if (!isAccurate) {
          console.log('跳过低精度位置:', [longitude, latitude], `精度${accuracy}米`);
        } else {
          console.log('跳过距离过近的位置:', [longitude, latitude], `距离${distance.toFixed(3)}km`);
        }
      } else {
        // 第一个点直接添加
        positionArr.push([longitude, latitude]);
        console.log('添加起始轨迹点:', [longitude, latitude]);
      }

      // 更新轨迹路线
      const polyline = this.getPolyline(positionArr);

      // 计算总距离
      let totalDistance = 0;
      for (let i = 1; i < positionArr.length; i++) {
        const prev = positionArr[i - 1];
        const curr = positionArr[i];
        totalDistance += this.getDistance(prev[1], prev[0], curr[1], curr[0]);
      }

      // 计算速度（加入时间阈值保护）
      const elapsed = (Date.now() - this.data.startTime) / 1000 / 3600; // 小时
      // 确保至少有5秒的记录时间才计算速度，防止除零或异常值
      const speed = (elapsed >= 5 / 3600) ? Number((totalDistance / elapsed).toFixed(2)) : 0;

      // 更新缓存数组
      this._positionArr = positionArr;

      // 定期同步数据到UI（每5秒或轨迹点数变化时）
      const currentTime = Date.now();
      const shouldUpdateUI = (currentTime - this._lastUpdateTime) > 5000 || positionArr.length !== this.data.positionArr.length;

      if (shouldUpdateUI) {
      this.setData({
        positionArr,
        polyline,
        count: 0,
        distance: Number(totalDistance.toFixed(2)),
        speed: speed
      });
        this._lastUpdateTime = currentTime;

      console.log('轨迹更新:', positionArr.length, '个点，总距离:', totalDistance.toFixed(2), 'km');

        // 诊断信息：显示最近的轨迹点
        if (positionArr.length > 0) {
          const lastPoint = positionArr[positionArr.length - 1];
          console.log('最新轨迹点:', lastPoint[1].toFixed(6), lastPoint[0].toFixed(6));
        }
      }
    } else {
      this.setData({ count });
    }
  },

  // 开始计时器
  startTimer() {
    this.timer = setInterval(() => {
      const elapsed = Date.now() - this.data.startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.setData({
        time: timeStr
      });
    }, 1000);
  },

  /**
   * 计算两个GPS坐标点之间的距离（Haversine公式）
   * 用于筛选有效轨迹点（避免重复/过近的点影响渲染精度）
   * @param {number} lat1 - 第一个点纬度
   * @param {number} lng1 - 第一个点经度
   * @param {number} lat2 - 第二个点纬度
   * @param {number} lng2 - 第二个点经度
   * @returns {number} 两点距离（单位：km）
   */
  getDistance(lat1, lng1, lat2, lng2) {
    const radLat1 = lat1 * Math.PI / 180; // 纬度转弧度
    const radLat2 = lat2 * Math.PI / 180;
    const a = radLat1 - radLat2;          // 纬度差
    const b = (lng1 * Math.PI / 180) - (lng2 * Math.PI / 180); // 经度差

    // Haversine公式：计算地球表面两点间最短距离（地球半径取6371km）
    let s = 2 * Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
    s = s * 6371; // 转换为公里
    return s;
  },

  // 生成轨迹线数据
  /**
   * 构建地图实时轨迹路线（Polyline格式）
   * 将轨迹点数组转换为微信地图组件支持的Polyline配置，用于在地图上显示实时轨迹
   * @param {Array} positionArr - 实时轨迹点数组，每个点格式为[longitude, latitude]
   * @returns {Array} 地图Polyline配置数组
   */
  getPolyline(positionArr) {
    // 至少2个点才显示轨迹线，避免单点时绘制无效线条
    if (positionArr.length < 2) return [];

    return [{
      points: positionArr.map(item => ({
        longitude: item[0], // 经度
        latitude: item[1]   // 纬度
      })),
      color: '#CD5C5C',    // 轨迹线颜色（与历史轨迹一致）
      width: 4,           // 轨迹线宽度
      dottedLine: false   // 实线（非虚线）
    }];
  },

  // 保存轨迹到云数据库
  async saveTrajectory() {
    // 确保数据同步到UI
    if (this._positionArr && this._positionArr.length > 0) {
      // 同步缓存数据到UI
      const positionArr = [...this._positionArr];
      const polyline = this.getPolyline(positionArr);

      // 计算最终统计数据
      let totalDistance = 0;
      for (let i = 1; i < positionArr.length; i++) {
        const prev = positionArr[i - 1];
        const curr = positionArr[i];
        totalDistance += this.getDistance(prev[1], prev[0], curr[1], curr[0]);
      }

      const elapsed = (Date.now() - this.data.startTime) / 1000 / 3600;
      const speed = (elapsed >= 5 / 3600) ? Number((totalDistance / elapsed).toFixed(2)) : 0;

        this.setData({
        positionArr,
        polyline,
        distance: Number(totalDistance.toFixed(2)),
        speed: speed
      });
    }

    // 检查轨迹点数量
    if (this.data.positionArr.length < 2) {
      wx.showToast({
        title: '轨迹点过少',
        icon: 'error'
      });
      return;
    }

    // 检查总距离是否足够（大于0.1公里）
    if (this.data.distance < 0.1) {
      wx.showToast({
        title: '轨迹距离过短',
        icon: 'error'
      });
      return;
    }

    try {
      const app = getApp();
      const openid = app.globalData.openid;

      const trajectoryData = {
        userId: openid,
        points: this.data.positionArr,
        distance: this.data.distance,
        time: this.data.time,
        speed: this.data.speed,
        createdAt: new Date()
      };

      const db = wx.cloud.database();
      await db.collection('trajectories').add({
        data: trajectoryData
      });

      wx.showToast({
        title: '轨迹保存成功',
        icon: 'success'
      });

      // 更新用户运动总公里数
      await this.updateUserExerciseTotalKm(this.data.distance);

      // 切换到历史模式并加载轨迹列表，让用户能立即看到新保存的轨迹
      this.setData({
        currentMode: 'history'
      });
      this.loadTrajectoryList();

      // 重置页面状态
        this.setData({
        positionArr: [],
        polyline: [],
        markers: [],
        distance: 0.0,
        time: '00:00:00',
        speed: 0.0,
        isPaused: false
      });

    } catch (error) {
      console.error('保存轨迹失败:', error);
            wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 加载轨迹历史列表
  async loadTrajectoryList() {
    try {
      const app = getApp();
      const openid = app.globalData.openid;

      const db = wx.cloud.database();

      // 同时获取轨迹数据和运动总距离
      const [trajectoryResult, totalStepsResult] = await Promise.all([
        db.collection('trajectories')
          .where({
            userId: openid
          })
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get(),
        db.collection('user_total_steps')
          .where({
            userId: openid
          })
          .get()
      ]);

      // 获取运动总距离
      let totalExerciseDistance = 0;
      if (totalStepsResult.data && totalStepsResult.data.length > 0) {
        totalExerciseDistance = totalStepsResult.data[0].exerciseTotalKm || 0;
        console.log('🏃 获取运动总距离:', totalExerciseDistance, 'km');
      }

        this.setData({
        trajectoryList: trajectoryResult.data,
        totalExerciseDistance: totalExerciseDistance
      });

      // 数据加载完成后，自动绘制所有Canvas
      console.log('🎨 轨迹数据加载完成，开始自动绘制Canvas');
      this.drawAllCanvases();

    } catch (error) {
      console.error('加载轨迹列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 删除轨迹
  async deleteTrajectory(e) {
    const { id } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条轨迹记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const db = wx.cloud.database();
            await db.collection('trajectories').doc(id).remove();

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });

            // 重新加载列表
            this.loadTrajectoryList();

        } catch (error) {
            console.error('删除轨迹失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  /**
   * Canvas绘制错误处理
   * 捕获Canvas渲染过程中的异常并打印日志
   */
  onCanvasError(e) {
    console.log('Canvas错误:', e);
    console.log('错误详情:', e.detail);
  },

  /**
   * 手动绘制所有历史轨迹Canvas（备用方案）
   * 遍历轨迹列表，对有数据的轨迹触发Canvas绘制
   */
  drawAllCanvases() {
    console.log('🎨 === 开始自动绘制所有Canvas ===');

    if (!this.data.trajectoryList || this.data.trajectoryList.length === 0) {
      console.log('ℹ️ trajectoryList为空，跳过绘制');
      return;
    }

    console.log('📊 待处理轨迹记录数量:', this.data.trajectoryList.length);

    // 添加延迟确保Canvas组件完全准备好
    setTimeout(() => {
    this.data.trajectoryList.forEach((item, index) => {
      if (item.points && item.points.length > 0) {
        const canvasId = `canvas_${index}`;
        console.log(`🔄 处理轨迹 ${index + 1}: ${canvasId} (点数: ${item.points.length})`);

        try {
          this.drawTrajectoryOnHistoryCanvas(canvasId, item.points);
          console.log(`   ✅ Canvas绘制成功`);
        } catch (error) {
          console.error(`   ❌ Canvas绘制失败:`, error);
        }
          } else {
        console.log(`⏭️ 跳过轨迹 ${index + 1}: 无轨迹数据`);
      }
    });

      console.log('✅ 自动绘制所有Canvas完成');
    }, 500); // 延迟500ms确保Canvas组件完全渲染
  },


  /**
   * Canvas组件就绪触发（历史轨迹）
   * 当历史轨迹列表中的Canvas初始化完成后，触发对应轨迹的绘制
   */
  onCanvasReady(e) {
    const { itemId, index, hasData } = e.currentTarget.dataset;
    const canvasId = `canvas_${index}`;

    console.log(`🎨 Canvas ${index} 准备就绪，itemId: ${itemId}, hasData: ${hasData}`);
    console.log('📊 当前trajectoryList长度:', this.data.trajectoryList?.length);

    // 无轨迹数据时直接返回
    if (hasData !== "true") {
      console.log(`⏭️ Canvas ${index} 没有轨迹数据，跳过绘制`);
      return;
    }

    // 根据轨迹ID查找对应的轨迹数据
    const trajectoryItem = this.data.trajectoryList?.find(item => item._id === itemId);
    if (!trajectoryItem) {
      console.error('❌ 未找到对应的轨迹项:', itemId);
      return;
    }

    const points = trajectoryItem.points || [];
    if (points && points.length > 0) {
      console.log(`📊 开始绘制轨迹: ${canvasId}, 点数: ${points.length}`);
      try {
        this.drawTrajectoryOnHistoryCanvas(canvasId, points);
        console.log(`✅ Canvas ${index} 绘制完成`);
      } catch (error) {
        console.error('❌ Canvas绘制失败:', error);
      }
    } else {
      console.warn('⚠️ 轨迹点数据为空');
    }
  },

  /**
   * 在历史记录Canvas上绘制轨迹曲线（核心方法）
   * 支持多点曲线绘制、单点圆点绘制，适配Canvas尺寸并优化数据采样
   * @param {string} canvasId - Canvas组件的ID
   * @param {Array} points - 轨迹点数组，每个点格式为[longitude, latitude]
   */
  drawTrajectoryOnHistoryCanvas(canvasId, points) {
    console.log('🎨 开始绘制Canvas轨迹曲线（修复版）');
    console.log('📍 CanvasID:', canvasId);
    console.log('📊 原始轨迹点数量:', points.length);

    // 输入验证：无轨迹点时直接返回
    if (!points || points.length === 0) {
      console.warn('⚠️ 轨迹点数据为空，无法绘制轨迹');
      return;
    }

    // 获取Canvas实际渲染尺寸，确保完整显示轨迹
    wx.createSelectorQuery()
      .select(`#${canvasId}`)
      .fields({ size: true })
      .exec(res => {
        // 在回调中重新创建Canvas上下文（因为异步作用域问题）
        const ctx = wx.createCanvasContext(canvasId);
        if (!ctx) {
          console.error('❌ 无法获取Canvas上下文:', canvasId);
          return;
        }

        let componentWidth, componentHeight;
        if (!res[0]) {
          console.error('❌ 无法获取Canvas尺寸，使用默认尺寸');
          // 使用默认尺寸作为fallback
          componentWidth = 180;
          componentHeight = 100;
        } else {
          const { width: actualWidth, height: actualHeight } = res[0];
          console.log('📐 Canvas实际渲染尺寸:', actualWidth, 'x', actualHeight);
          componentWidth = actualWidth;
          componentHeight = actualHeight;
        }

        // 在回调中直接进行绘制
        this.drawTrajectoryWithSize(ctx, points, componentWidth, componentHeight, canvasId);
      });
  },

  /**
   * 实际的轨迹绘制函数（指定尺寸）
   */
  drawTrajectoryWithSize(ctx, points, componentWidth, componentHeight, canvasId) {
    console.log('🎨 开始绘制Canvas轨迹（指定尺寸）');
    console.log('✅ 使用传入的Canvas上下文');

    // 数据预处理：轨迹点采样优化
        let processedPoints = points;
        if (points.length > 50) {
          console.log('⚡ 轨迹点过多，进行数据采样优化');
          processedPoints = [];
          for (let i = 0; i < points.length; i += 3) {
            processedPoints.push(points[i]);
          }
          console.log('📊 采样后点数量:', processedPoints.length);
        }

    // 绘制Canvas背景
    ctx.setFillStyle('#f0f0f0');
        ctx.fillRect(0, 0, componentWidth, componentHeight);

    // 轨迹绘制逻辑
        if (processedPoints.length >= 2) {
          console.log('📈 绘制多点轨迹曲线');

      // 设置线条样式
      ctx.setStrokeStyle('#CD5C5C');
      ctx.setLineWidth(2);
      ctx.setLineCap('round');
      ctx.setLineJoin('round');

      // 提取经纬度数据，计算完整范围
      const longitudes = processedPoints.map(p => p[0]);
      const latitudes = processedPoints.map(p => p[1]);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
      const lngRange = maxLng - minLng;
          const latRange = maxLat - minLat;

      console.log('🌍 轨迹范围分析:');
      console.log('   经度:', minLng.toFixed(6), '~', maxLng.toFixed(6), '范围:', lngRange.toFixed(6));
      console.log('   纬度:', minLat.toFixed(6), '~', maxLat.toFixed(6), '范围:', latRange.toFixed(6));

      // 设置绘制边距（留出空间显示完整轨迹）
      const marginX = componentWidth * 0.05;  // 减小边距，确保轨迹完整显示
      const marginY = componentWidth * 0.05;  // 上下边距相同
          const drawWidth = componentWidth - 2 * marginX;
          const drawHeight = componentHeight - 2 * marginY;

      // 开始绘制路径
          ctx.beginPath();
          processedPoints.forEach((point, index) => {
            const [longitude, latitude] = point;

        // 计算在Canvas中的坐标（基于经纬度范围归一化）
        let x, y;

        if (lngRange === 0 && latRange === 0) {
          // 所有点在同一位置
          x = componentWidth / 2;
              y = componentHeight / 2;
        } else if (lngRange === 0) {
          // 只有纬度变化，经度相同
          x = componentWidth / 2;
          const normalizedLat = latRange > 0 ? (latitude - minLat) / latRange : 0;
          y = marginY + (normalizedLat * drawHeight);
        } else if (latRange === 0) {
          // 只有经度变化，纬度相同
          const normalizedLng = lngRange > 0 ? (longitude - minLng) / lngRange : 0;
          x = marginX + (normalizedLng * drawWidth);
          y = componentHeight / 2;
            } else {
          // 经纬度都有变化，进行二维归一化
          const normalizedLng = (longitude - minLng) / lngRange;
          const normalizedLat = (latitude - minLat) / latRange;
          x = marginX + (normalizedLng * drawWidth);
          y = marginY + (normalizedLat * drawHeight);
        }

            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
        console.log(`📍 点${index}: GPS(${longitude.toFixed(6)}, ${latitude.toFixed(6)}) → Canvas(${x.toFixed(1)}, ${y.toFixed(1)})`);
          });

          ctx.stroke();
          console.log('✅ 多点轨迹曲线绘制完成');

        } else if (processedPoints.length === 1) {
          console.log('🔵 绘制单点轨迹圆点');

      ctx.setFillStyle('#CD5C5C');
          const radius = Math.min(componentWidth, componentHeight) * 0.05;
          const centerX = componentWidth / 2;
          const centerY = componentHeight / 2;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fill();

          console.log('✅ 单点轨迹圆点绘制完成');
        }

    // 执行Canvas渲染
        ctx.draw();
        console.log('🎨 Canvas轨迹绘制成功完成');
  },

  // 更新用户运动轨迹总公里数（单独存储，与步数转换公里数分开）
  async updateUserExerciseTotalKm(currentKm) {
    try {
      const app = getApp();
      const openid = app.globalData.openid;

      if (!openid) {
        console.error('无法获取用户openid，跳过运动总公里数更新');
        return;
      }

      console.log(`🏃 更新用户运动轨迹总公里数: 累加 ${currentKm} km`);

      const db = wx.cloud.database();
      const currentKmNum = Number(currentKm);

      // 先查询用户当前的运动轨迹总公里数
      const result = await db.collection('user_total_steps')
        .where({
          userId: openid
        })
        .get();

      let newExerciseTotalKm = currentKmNum; // 如果是第一次记录

      if (result.data && result.data.length > 0) {
        // 用户已有记录，累加运动轨迹公里数
        const existingRecord = result.data[0];
        newExerciseTotalKm = (existingRecord.exerciseTotalKm || 0) + currentKmNum;

        // 更新现有记录
        await db.collection('user_total_steps').doc(existingRecord._id).update({
          data: {
            exerciseTotalKm: newExerciseTotalKm,
            lastUpdate: new Date()
          }
        });
      } else {
        // 创建新记录
        await db.collection('user_total_steps').add({
          data: {
            userId: openid,
            exerciseTotalKm: newExerciseTotalKm,
            totalSteps: 0, // 步数暂时为0
            lastUpdate: new Date()
          }
        });
      }

      console.log(`✅ 运动总公里数更新成功: ${newExerciseTotalKm} km`);

    } catch (error) {
      console.error('更新运动总公里数失败:', error);
    }
  },

  // 模式切换
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      currentMode: mode
    });

    if (mode === 'history') {
      this.loadTrajectoryList();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.currentMode === 'history') {
      this.loadTrajectoryList().then(() => {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  // 隐藏运动效率提示
  hideEfficiencyTip() {
    this.setData({
      showEfficiencyTip: false
    });
  },

  // 地图区域变化回调
  onRegionChange(e) {
    console.log('Map region changed:', e);
  }
});