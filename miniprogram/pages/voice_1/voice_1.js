// pages/voice_1/voice_1.js
const tencentTTS = require('../../utils/tencentTTS');

Page({
  data: {
    currentPage: 0,
    isPlaying: false,
    isSynthesizing: false,
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
        content: "午前，我们红一军团一师三团政治处开会，一是欢迎林龙发政委伤愈回团工作；二是分析研究部队政治思想状况。五次反\"围剿\"以来，我军数战失利。这次高兴圩战役也没打好。连队思想情况较乱，埋怨情绪较大。这几天我下营、连和干部、战士交谈，大家都反映我们吃了堡垒对堡垒、工事对工事、死打硬拚的亏。最近，师部找团以上干部接连开了几次会，李聚奎师长和赖传珠代政委说，部队可能要向南行动，冲破南线敌人的封锁。一星期来，部队补充了新兵，充实了武器弹药，每人还发了两套单衣、两双鞋子。看来，情况十分紧急，准备随时行动。突然接到命令，午后四时出发。我团为石路前卫，从兴国乱石圩出发，经银圩、社富，半夜到南塘宿营，行程七十里。沿途群众端茶送水，依依不舍。我们的心情都十分激动。"
      },
      {
        title: "十月十七日 晴",
        content: "晨，敌机轰炸于都桥，炸弹落在街上，炸伤八名赤卫队员和许多群众，是一笔血债！于都人民对红军感情很深，部队一住下，妇女就来洗衣服、烧开水。苏维埃政府财政人员忙着送粮食、送物资。红军宣传队积极向群众宣传抗日反蒋、土地革命等政治主张。下午四时出发，经瓜江、庙前、百家坡、大屋岭、石坡，行程七十里，宿营于都城南关。路过瓜江时，瓜江赤卫队长刘同志拉着我的手问，红军要到哪去？他希望红军很快粉碎敌人的\"围剿\"。战士们也一再问我：\"总支书记，部队要到哪里去？\"我只知道向南行动，到便于消灭蒋介石、粉碎敌人\"围剿\"的地方去。"
      },
      {
        title: "十月十八日 晴",
        content: "下午四时出发，经李村、老屋岭、河北、沙坝，行程七十多里，宿营上坪圩。已进入\"红白交界\"地区，白军就在附近。第三营在林木村打开地主土围子，捉了十多人，杀了两个\"土豪\"，没收了四头猪，大大改善了部队和群众的生活。这几天部队行动很快，掉队很多。我负责收容队，经请示批准，送二十四名战士回苏区安置。"
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

  // 使用腾讯云TTS进行语音合成
  async toggleVoice() {
    if (this.data.isSynthesizing) {
      wx.showToast({
        title: '正在合成语音，请稍候...',
        icon: 'none'
      });
      return;
    }

    if (this.data.isPlaying) {
      // 停止播放
      this.stopAudio();
    } else {
      // 开始播放
      await this.startAudio();
    }
  },

  // 开始音频播放
  async startAudio() {
    try {
      // 确保在开始新的音频播放前停止之前可能正在播放的音频
      this.cleanupAudioContext();
      
      this.setData({ isSynthesizing: true });
      
      wx.showLoading({
        title: '正在合成语音...',
        mask: true
      });

      const currentText = this.data.pages[this.data.currentPage].content;
      
      // 使用腾讯云TTS合成语音，设置returnAllBlocks=true以获取所有音频块
      const audioData = await tencentTTS.synthesizeWithTencent(
        currentText,
        tencentTTS.VOICE_TYPES.narrator, // 使用叙述者音色
        0, // 语速
        0, // 音量
        'neutral', // 情感
        true // 返回所有音频块，确保完整播放整页内容
      );

      this.setData({
        isPlaying: true,
        isSynthesizing: false
      });

      wx.hideLoading();
      wx.showToast({
        title: '开始播放语音',
        icon: 'success'
      });

      // 创建一个临时的音频上下文数组来保存所有播放的音频上下文
      this.audioContexts = [];
      
      // 修改playAudioBlocks的调用方式，传入回调函数来保存音频上下文
      try {
        // 自定义播放音频块的方法，确保能管理音频上下文
        await this.playAudioBlocksWithControl(audioData);
        // 所有音频块播放完成
        this.setData({ isPlaying: false });
        console.log('所有音频块播放完成');
      } catch (playError) {
        console.error('音频块播放失败:', playError);
        this.setData({ isPlaying: false });
        wx.showToast({
          title: `音频播放失败: ${playError.message}`,
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('腾讯云TTS合成失败:', error);
      this.setData({ isSynthesizing: false });
      wx.hideLoading();
      wx.showToast({
        title: `语音合成失败: ${error.message}`,
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 自定义的音频块播放方法，支持音频控制
  playAudioBlocksWithControl(audioBlocks) {
    return new Promise((resolve, reject) => {
      // 处理可能的对象类型输入
      let actualAudioBlocks = audioBlocks;
      if (audioBlocks && typeof audioBlocks === 'object' && audioBlocks.audioBlocks) {
        actualAudioBlocks = audioBlocks.audioBlocks;
      }
      
      if (!actualAudioBlocks || !Array.isArray(actualAudioBlocks) || actualAudioBlocks.length === 0) {
        reject(new Error('没有有效的音频块需要播放'));
        return;
      }
      
      let currentBlockIndex = 0;
      const tempFilePaths = [];
      
      // 递归播放每个音频块
      function playNextBlock() {
        // 检查是否已停止播放
        if (!this.data.isPlaying) {
          resolve(tempFilePaths);
          return;
        }
        
        if (currentBlockIndex >= actualAudioBlocks.length) {
          resolve(tempFilePaths);
          return;
        }
        
        console.log(`播放第${currentBlockIndex + 1}/${actualAudioBlocks.length}个音频块`);
        
        const fs = wx.getFileSystemManager();
        const tempFilePath = `${wx.env.USER_DATA_PATH}/tencent_audio_${Date.now()}_${currentBlockIndex}.mp3`;
        const blockData = actualAudioBlocks[currentBlockIndex];
        
        // 确保数据类型正确
        if (typeof blockData !== 'string') {
          console.error(`第${currentBlockIndex + 1}个音频块数据类型错误:`, typeof blockData);
          reject(new Error(`第${currentBlockIndex + 1}个音频块数据类型错误，期望字符串`));
          return;
        }
        
        fs.writeFile({
          filePath: tempFilePath,
          data: blockData,
          encoding: 'base64',
          success: () => {
            tempFilePaths.push(tempFilePath);
            // 创建音频上下文播放当前文件
            const audioContext = wx.createInnerAudioContext();
            audioContext.src = tempFilePath;
            
            // 保存音频上下文到数组
            this.audioContexts.push(audioContext);
            
            audioContext.onEnded(() => {
              // 从数组中移除已播放完成的音频上下文
              const index = this.audioContexts.indexOf(audioContext);
              if (index > -1) {
                this.audioContexts.splice(index, 1);
              }
              
              // 检查是否已停止播放
              if (!this.data.isPlaying) {
                resolve(tempFilePaths);
                return;
              }
              
              currentBlockIndex++;
              playNextBlock.call(this);
            });
            
            audioContext.onError(error => {
              console.error(`第${currentBlockIndex + 1}个音频块播放失败:`, error);
              reject(new Error(`音频播放失败: ${error.errMsg}`));
            });
            
            audioContext.play();
          },
          fail: (error) => {
            console.error(`第${currentBlockIndex + 1}个音频块保存失败:`, error);
            reject(error);
          }
        });
      }
      
      // 开始播放第一个块
      playNextBlock.call(this);
    });
  },

  // 播放音频
  playAudio(audioPath) {
    // 先清理可能存在的音频上下文
    this.cleanupAudioContext();
    
    // 创建新的音频上下文
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = audioPath;
    
    audioContext.onPlay(() => {
      console.log('开始播放音频');
    });

    audioContext.onEnded(() => {
      console.log('音频播放结束');
      this.setData({ isPlaying: false });
      this.cleanupAudioContext();
    });

    audioContext.onError((error) => {
      console.error('音频播放错误:', error);
      this.setData({ isPlaying: false });
      wx.showToast({
        title: `音频播放失败: ${error.errMsg}`,
        icon: 'none'
      });
      this.cleanupAudioContext();
    });

    // 增加播放进度监听，帮助调试
    audioContext.onTimeUpdate(() => {
      // 每5秒记录一次播放进度
      if (Math.floor(audioContext.currentTime) % 5 === 0 && !this.lastProgressLog || 
          Math.floor(audioContext.currentTime) > this.lastProgressLog + 5) {
        console.log(`当前播放进度: ${audioContext.currentTime.toFixed(1)}s / ${audioContext.duration ? audioContext.duration.toFixed(1) : '未知'}s`);
        this.lastProgressLog = Math.floor(audioContext.currentTime);
      }
    });

    audioContext.play();
    this.audioContext = audioContext;
    this.lastProgressLog = 0;
  },

  // 清理音频资源的通用方法
  cleanupAudioContext() {
    // 清理单个音频上下文
    if (this.audioContext) {
      try {
        // 检查audioContext是否已被销毁
        if (this.audioContext.paused !== undefined) {
          this.audioContext.stop();
        }
        this.audioContext.destroy();
      } catch (error) {
        console.warn('清理单个音频上下文时出错:', error);
      } finally {
        this.audioContext = null;
        this.lastProgressLog = null;
      }
    }
    
    // 清理音频上下文数组（用于playAudioBlocksWithControl方法）
    if (this.audioContexts && Array.isArray(this.audioContexts)) {
      this.audioContexts.forEach(audioContext => {
        try {
          if (audioContext && audioContext.paused !== undefined) {
            audioContext.stop();
            audioContext.destroy();
          }
        } catch (error) {
          console.warn('清理音频上下文数组中的项时出错:', error);
        }
      });
      this.audioContexts = null;
    }
  },

  // 停止音频播放
  stopAudio() {
    // 首先设置isPlaying为false，这样播放队列中的下一个音频块就不会继续播放
    this.setData({ isPlaying: false });
    
    // 清理所有音频上下文
    this.cleanupAudioContext();
    
    wx.showToast({
      title: '停止播放',
      icon: 'none'
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

  onUnload() {
    // 页面卸载时安全清理音频资源
    this.cleanupAudioContext();
  }
});