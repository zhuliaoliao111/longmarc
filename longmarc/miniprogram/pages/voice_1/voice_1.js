// pages/voice_1/voice_1.js
const { synthesizeWithXunfei, playAudio, segmentText } = require('../../utils/xunfei');

Page({
  data: {
    currentPage: 0,
    isPlaying: false,
    audioContext: null,
    showSettings: false,
    showNav: false,
    showCatalog: false,
    isDarkMode: false,
    sunIconUrl: '',
    moonIconUrl: '',
    voicePlayIconUrl: '',
    settingsIconUrl: '',
    catalogIconUrl: '',
    isFlipping: false,
    flipPageIndex: 0,
    nextPageIndex: 0,
    statusBarHeight: 0,
    
    // 触摸相关
    touchStartX: 0,
    touchStartY: 0,
    
    // 阅读设置
    fontSize: 30,
    lineHeightValue: 18,
    lineHeight: 1.8,
    marginSize: 40,
    brightness: 100,
    flipMode: 'slide',
    flipAnimation: '',
    fontFamily: 'STKaiti',
    contentStyle: '',
    
    fontList: [
      { name: '宋体', value: '宋体' },
      { name: '汇文明朝', value: '汇文明朝' },
      { name: '正楷体', value: '正楷体' },
      { name: '华文楷体', value: 'STKaiti' },
      { name: '老宋体', value: '老宋体' },
      { name: '霞鹜文楷', value: 'LXGW WenKai' },
      { name: '方正楷体', value: '方正楷体' },
      { name: '默认', value: 'sans-serif' }
    ],
    
    pages: [
      {
        title: "一九三四年十月十六日 晴",
        content: "午前，我们红一军团一师三团政治处开会，一是欢迎林龙发政委伤愈回团工作；二是分析研究部队政治思想状况。五次反“围剿”以来，我军数战失利。这次高兴圩战役也没打好。连队思想情况较乱，埋怨情绪较大。这几天我下营、连和干部、战士交谈，大家都反映我们吃了堡垒对堡垒、工事对工事、死打硬拚的亏。最近，师部找团以上干部接连开了几次会，李聚奎师长和赖传珠代政委说，部队可能要向南行动，冲破南线敌人的封锁。一星期来，部队补充了新兵，充实了武器弹药，每人还发了两套单衣、两双鞋子。看来，情况十分紧急，准备随时行动。突然接到命令，午后四时出发。我团为石路前卫，从兴国乱石圩出发，经银圩、社富，半夜到南塘宿营，行程七十里。沿途群众端茶送水，依依不舍。我们的心情都十分激动。"
      },
      {
        title: "十月十七日 晴",
        content: "晨，敌机轰炸于都桥，炸弹落在街上，炸伤八名赤卫队员和许多群众，又是一笔血债！于都人民对红军感情很深，部队一住下，妇女就来洗衣服、烧开水。苏维埃政府财政人员忙着送粮食、送物资。红军宣传队积极向群众宣传抗日反蒋、土地革命等政治主张。下午四时出发，经瓜江、庙前、百家坡、大屋岭、石坡，行程七十里，宿营于都城南关。路过瓜江时，瓜江赤卫队长刘同志拉着我的手问，红军要到哪去？他希望红军很快粉碎敌人的“围剿”。战士们也一再问我：“总支书记，部队要到哪里去？”我只知道向南行动，到便于消灭蒋介石、粉碎敌人“围剿”的地方去。"
      },
      {
        title: "十月十八日 晴",
        content: "下午四时出发，经李村、老屋岭、河北、沙坝，行程七十多里，宿营上坪圩。已进入“红白交界”地区，白军就在附近。第三营在林木村打开地主土围子，捉了十多人，杀了两个“土豪”，没收了四头猪，大大改善了部队和群众的生活。这几天部队行动很快，掉队很多。我负责收容队，经请示批准，送二十四名战士回苏区安置。"
      }
    ]
  },

  async onLoad() {
    console.log("离开苏区上征途页面加载");

    // 异步获取图片URL
    const [sunIconUrl, moonIconUrl, voicePlayIconUrl, settingsIconUrl, catalogIconUrl] = await Promise.all([
      getApp().getImageUrl('太阳.png'),
      getApp().getImageUrl('月亮.png'),
      getApp().getImageUrl('语音播放-.png'),
      getApp().getImageUrl('设置.png'),
      getApp().getImageUrl('目录.png')
    ]);

    // 获取系统信息，设置状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;

    this.initAudioContext();
    this.updateContentStyle();

    // 从缓存读取主题模式
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({
      isDarkMode,
      statusBarHeight,
      sunIconUrl,
      moonIconUrl,
      voicePlayIconUrl,
      settingsIconUrl,
      catalogIconUrl
    });
  },

  initAudioContext() {
    this.audioContext = wx.createInnerAudioContext();
    
    this.audioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });
    
    this.audioContext.onError((res) => {
      console.error('音频播放成功:', res);
      this.setData({ isPlaying: false });
      wx.showToast({ title: '开始播放', icon: 'error' });
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 触摸开始
  onTouchStart(e) {
    if (this.data.showSettings) return;
    this.setData({
      touchStartX: e.touches[0].pageX,
      touchStartY: e.touches[0].pageY
    });
  },

  // 触摸结束
  onTouchEnd(e) {
    if (this.data.showSettings) return;
    
    const touchEndX = e.changedTouches[0].pageX;
    const touchEndY = e.changedTouches[0].pageY;
    const deltaX = touchEndX - this.data.touchStartX;
    const deltaY = Math.abs(touchEndY - this.data.touchStartY);
    
    // 判断是否为水平滑动
    if (Math.abs(deltaX) > 50 && deltaY < 50) {
      if (deltaX > 0) {
        // 向右滑动 - 上一页
        this.prevPage();
      } else {
        // 向左滑动 - 下一页
        this.nextPage();
      }
    } else if (Math.abs(deltaX) < 30 && deltaY < 30) {
      // 点击屏幕中间区域显示/隐藏导航栏
      const windowWidth = wx.getSystemInfoSync().windowWidth;
      const tapX = e.changedTouches[0].pageX;
      
      if (tapX > windowWidth * 0.3 && tapX < windowWidth * 0.7) {
        this.toggleNav();
      }
    }
  },

  // 切换导航栏显示
  toggleNav() {
    this.setData({
      showNav: !this.data.showNav
    });
  },

  // 更新内容样式
  updateContentStyle() {
    const { brightness } = this.data;
    const filter = `brightness(${brightness}%)`;
    this.setData({
      contentStyle: `filter: ${filter};`
    });
  },

  // 翻页动画
  performPageFlip(direction, targetPage) {
    if (this.data.flipMode === 'none') {
      this.setData({ currentPage: targetPage });
      return;
    }

    const flipPageIndex = this.data.currentPage;
    const nextPageIndex = targetPage;
    
    this.setData({
      isFlipping: true,
      flipPageIndex: flipPageIndex,
      nextPageIndex: nextPageIndex,
      flipAnimation: direction === 'next' ? 'flip-right' : 'flip-left'
    });

    setTimeout(() => {
      this.setData({
        currentPage: targetPage,
        isFlipping: false,
        flipAnimation: ''
      });
    }, 600);
  },

  // 下一页
  nextPage() {
    if (this.data.currentPage < this.data.pages.length - 1) {
      const targetPage = this.data.currentPage + 1;
      
      if (this.data.flipMode === 'simulation') {
        this.performPageFlip('next', targetPage);
      } else if (this.data.flipMode === 'slide') {
        this.setData({ flipAnimation: 'page-slide-left' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 300);
      } else if (this.data.flipMode === 'cover') {
        this.setData({ flipAnimation: 'page-fade' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 200);
      } else {
        this.setData({ currentPage: targetPage });
      }
    }
  },

  // 上一页
  prevPage() {
    if (this.data.currentPage > 0) {
      const targetPage = this.data.currentPage - 1;
      
      if (this.data.flipMode === 'simulation') {
        this.performPageFlip('prev', targetPage);
      } else if (this.data.flipMode === 'slide') {
        this.setData({ flipAnimation: 'page-slide-right' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 300);
      } else if (this.data.flipMode === 'cover') {
        this.setData({ flipAnimation: 'page-fade' });
        setTimeout(() => {
          this.setData({ 
            currentPage: targetPage,
            flipAnimation: '' 
          });
        }, 200);
      } else {
        this.setData({ currentPage: targetPage });
      }
    }
  },

  // 进度条改变
  onProgressChange(e) {
    const percent = e.detail.value;
    const targetPage = Math.round((percent / 100) * (this.data.pages.length - 1));
    this.setData({ currentPage: targetPage });
  },

  // 设置相关方法
  toggleSettings() {
    this.setData({
      showSettings: !this.data.showSettings
    });
  },

  // 目录相关方法
  toggleCatalog() {
    this.setData({
      showCatalog: !this.data.showCatalog
    });
  },

  jumpToPage(e) {
    const targetPage = e.currentTarget.dataset.index;
    if (targetPage !== this.data.currentPage) {
      this.setData({
        currentPage: targetPage,
        showCatalog: false
      });
    } else {
      this.setData({
        showCatalog: false
      });
    }
  },

  // 主题切换方法
  toggleTheme() {
    const newMode = !this.data.isDarkMode;
    this.setData({
      isDarkMode: newMode
    });
    
    // 保存到缓存
    wx.setStorageSync('isDarkMode', newMode);
    
    // 切换页面根元素的 class
    if (newMode) {
      // 夜间模式
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
    }
    
    wx.showToast({
      title: newMode ? '已切换到夜间模式' : '已切换到日间模式',
      icon: 'none',
      duration: 1000
    });
  },

  onBrightnessChange(e) {
    this.setData({ brightness: e.detail.value });
    this.updateContentStyle();
  },

  onFontSizeChange(e) {
    this.setData({ fontSize: e.detail.value });
  },

  onMarginChange(e) {
    this.setData({ marginSize: e.detail.value });
  },

  onLineHeightChange(e) {
    const value = e.detail.value;
    this.setData({
      lineHeightValue: value,
      lineHeight: value / 10
    });
  },

  changeFlipMode(e) {
    this.setData({
      flipMode: e.currentTarget.dataset.mode
    });
  },

  changeFontFamily(e) {
    this.setData({
      fontFamily: e.currentTarget.dataset.font
    });
  },

  // 语音播放
  async toggleVoice() {
    if (this.data.isPlaying) {
      if (this.audioContext) {
        this.audioContext.pause();
      }
      this.setData({ isPlaying: false });
      wx.showToast({ title: "暂停播放", icon: "none" });
    } else {
      try {
        const currentText = this.data.pages[this.data.currentPage].content;
        wx.showLoading({ title: '正在生成语音...' });
        
        const segments = segmentText(currentText);
        
        if (segments.length === 1) {
          const audioData = await synthesizeWithXunfei(segments[0].text, segments[0].voice);
          const tempFilePath = await playAudio(audioData);
          
          this.audioContext.stop();
          this.audioContext.src = tempFilePath;
          this.audioContext.play();
          
          this.setData({ isPlaying: true });
          wx.hideLoading();
        } else {
          const firstSegment = segments[0];
          const audioData = await synthesizeWithXunfei(firstSegment.text, firstSegment.voice);
          const tempFilePath = await playAudio(audioData);
          this.audioContext.src = tempFilePath;
          this.audioContext.play();
          this.setData({ isPlaying: true });
          wx.hideLoading();
          
          this.audioContext.onEnded(() => {
            this.playNextSegment(segments, 1);
          });
        }
      } catch (error) {
        console.error('语音合成失败:', error);
        wx.hideLoading();
      }
    }
  },

  async playNextSegment(segments, index) {
    if (index >= segments.length) {
      this.setData({ isPlaying: false });
      return;
    }
    
    try {
      const segment = segments[index];
      const audioData = await synthesizeWithXunfei(segment.text, segment.voice);
      const tempFilePath = await playAudio(audioData);
      
      this.audioContext.src = tempFilePath;
      this.audioContext.play();
      
      this.audioContext.onEnded(() => {
        this.playNextSegment(segments, index + 1);
      });
    } catch (error) {
      console.error('播放下一段失败:', error);
      this.setData({ isPlaying: false });
    }
  },

  onUnload() {
    if (this.audioContext) {
      this.audioContext.destroy();
    }
  }
});