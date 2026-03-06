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
        title: "一九三六年十一月二十日 阴、大风",
        content: "在张家沟及曹家瓦一线待机打仗。胡宗南匪军尾追不放，真是送死来了。送来，就不客气，我们一一收下。"
      },
      {
        title: "十一月二十一日 阴雪",
        content: "部队在熊家嘴集结待机，天空飞机不断，胡宗南七十八师先头进击的旅已钻进山城堡。这股敌人，从四川追到陕北，十分骄傲，以为红军是叫化子部队，不堪一击。他们妄图乘我立脚未隐之际，将我们撵出陕北，牛皮吹得不小。正午十二时，红一军团按照毛主席、周副主席、朱总司令的战役部署，由东向北打。红四师在山城堡箝制敌人，红二师由北向东攻击，红一师一部堵尾，一部由北向山城堡攻击。到下午四时，红军已完成了对山城堡的包围。顿时，响起了激烈的枪炮声。下午五时，我团从山城堡北山协同红二师五团沿山夺敌碉堡，打下第三层碉堡时，五团政委陈雄同志英勇牺牲，我率一连沿陈政委未攻下的碉堡开展白刃格斗，将守敌一个连全歼。晚八时，敌二三六旅的大炮还未架好，就被我军缴获。"
      },
      {
        title: "十一月二十二日 雪",
        content: "数万红军战士向山城堡发起冲锋，打得敌人落花流水，俘敌一万五千多人，缴获武器无数。凌晨三时，据报，我连攻击敌六八四团指挥所，打乱了敌人指挥系统，俘敌团长。五连俘敌一百七十七名，一连俘敌二百五十八名。各排向敌机枪阵地、指挥所、炮兵营发起攻击，又俘敌一批。晨七时三十分，我团在大雪纷飞、零星枪声中清理战场。上午十时左右，各师撤出山城堡。这次战斗，我团俘敌五百二十四名，缴获步枪四百五十四支，轻、重机枪二十四挺，迫击炮五门，骡马七十八匹，山炮零件一大堆。我团伤亡七十五名，牺牲二十五名。"
      },
      {
        title: "十一月二十三日 雪",
        content: "部队进行战后解释工作，清理战果，总结山城堡战斗经验，在熊花山准备粮食。师政通知，下午二时在山城堡召开团以上干部会议。会议在破庙里举行，横幅写着“庆祝山城堡决战伟大胜利！”用木板、石头当座位。下午二时左右，朱总司令、彭德怀、刘伯承、聂荣臻、左权、贺龙、任弼时、关向应、萧克、王震、徐海东、程子华等三路红军领导人进入会场，掌声雷动。杨尚昆主持会议，朱总司令讲话。朱总司令指出，三路红军在西北大会师，以山城堡战斗的胜利，结束了长征，给追击红军的胡宗南以沉重打击。毛主席说，三路红军战略转移是史无前例的。长征是宣言书，是宣传队，是播种机，以红军的胜利、敌人的失败而告结束。我们要在陕甘宁边区巩固下来，迎接全国抗日救国运动的新高潮。"
      },
      {
        title: "彭德怀副总司令讲话",
        content: "彭德怀副总司令在会上讲话，强调要发扬山城堡战斗中猛攻、猛冲、猛追的顽强战斗精神，给胡宗南以更致命的打击，大力发展陕甘宁边区苏维埃运动。山城堡战斗后，全军集中在“三边”地区整训，加强组织纪律性，搞好军民团结，密切军队与地方关系，团结在党中央、毛主席周围，坚决纠正机会主义路线。"
      },
      {
        title: "其他领导人讲话",
        content: "任弼时、贺龙、关向应、萧克、徐海东等领导同志也讲了话。最后，左权军团长总结山城堡战斗的伟大意义，指出两点：一、在毛主席、周副主席、朱总司令统一指挥下，在苏区人民全力支援下，红军在山城堡英勇战斗，打垮了胡宗南两个先头师，消灭了一个师，俘敌一万五千多人，吓跑了其他围追的白军。这是中国苏维埃运动史上决定性的胜利。二、长征途中，我们几次遇到胡宗南，本来可以打，但由于战场条件不利，只好忍痛撤出。胡宗南误以为红军怕他，更加骄横，不知天高地厚。在西兰公路上，我们让他过去，到了山城堡，苏区边沿，我们不能再让他了。"
      },
      {
        title: "会议总结",
        content: "毛主席、周副主席、朱总司令计划的拦头、堵尾、冲腰等方法，集中优势兵力，包围分割敌人先头师、旅，发挥我军近战、夜战特长，打败了敌人。三路红军会师后，逐步诱敌东进，选择苏区边沿作战，利用冬季敌人不能修工事，敌人立足未稳之机，发起攻击。红军英勇顽强的战斗作风，不怕疲劳，连续作战，英勇追击，取得了辉煌胜利。会后照相留念，聚餐，吃红烧肉。然后我们赶回部队，准备迎接新的战斗，迎接抗日高潮的到来！"
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