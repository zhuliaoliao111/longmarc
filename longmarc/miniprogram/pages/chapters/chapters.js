Page({
  data: {
    loading: true,
    chapters: {
      start: [],
      turn: [],
      difficult: [],
      end: []
    }
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    try {
      const res = await wx.cloud.callFunction({ name: "getCheckpoints" });
      const { code, data } = res.result || {};
      if (code === 0 && Array.isArray(data)) {
        const byName = (name) => data.find(d => d.name.indexOf(name) >= 0);
        const start = [
          byName("瑞金出发"),
          byName("湘江")
        ].filter(Boolean);
        const turn = [
          byName("遵义会议"),
          byName("四渡赤水")
        ].filter(Boolean);
        const difficult = [
          byName("强渡大渡河"),
          byName("飞夺泸定桥"),
          byName("翻越夹金山")
        ].filter(Boolean);
        const end = [
          byName("腊子口"),
          byName("会宁会师")
        ].filter(Boolean);
        this.setData({ chapters: { start, turn, difficult, end } });
      } else {
        wx.showToast({ title: "数据错误", icon: "none" });
      }
    } catch (e) {
      console.error(e);
      wx.showToast({ title: "加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  openOnMap(e) {
    const { latitude, longitude, name } = e.currentTarget.dataset;
    const app = getApp();
    app.globalData = app.globalData || {};
    app.globalData.focusPoint = { latitude, longitude, name, scale: 13 };
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.reLaunch({ url: "/pages/map/map" });
    }
  },

  goScene(e) {
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
          wx.switchTab({
            url: '/pages/profile/profile'
          });
        }
      });
      return;
    }

    const { name } = e.currentTarget.dataset;
    if(name=="瑞金出发")
      wx.navigateTo({
        url: "/pages/scene_rj/scene_rj", 
      })
    else if(name=="湘江战役")
      wx.navigateTo({
        url: "/pages/scene_xj/scene_xj", 
      })
      else if(name=="四渡赤水")
      wx.navigateTo({
        url: "/pages/scene_sdcs/scene_sdcs", 
      })
      else if(name=="腊子口战役")
      wx.navigateTo({
        url: "/pages/scene_lzk/scene_lzk", 
      })
      else if(name=="会宁会师")
      wx.navigateTo({
        url: "/pages/scene_hn/scene_hn", 
      })
      else if(name=="翻越夹金山") {
      wx.navigateTo({
        url: "/pages/scene_jjs/scene_jjs",
      });
    }
      else if(name=="飞夺泸定桥") {
      wx.navigateTo({
        url: "/pages/scene_ldq/scene_ldq",
      });
    }
    else if(name=="遵义会议")
    wx.navigateTo({
      url: '/pages/scene_zy/scene_zy', 
    })
    else if(name=="强渡大渡河")
    wx.navigateTo({
      url: '/pages/scene_ddh/scene_ddh', 
    })
    else
    wx.navigateTo({ url: `/pages/scene/scene?name=${encodeURIComponent(name)}` });
  },

  goTimeline() {
    wx.navigateTo({ url: "/pages/timeline/timeline" });
  }
});
