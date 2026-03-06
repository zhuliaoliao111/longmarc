Page({
  data: {
    currentStep: 0,
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '/images/index/湘江.jpg',
    
    // 背景页文本（与瑞金长度相近）
    backgroundFullText: `1934年11月，红军突破国民党军三道封锁线后，一路向西抵达湘江沿岸。此时蒋介石调集40万兵力，在湘江两岸布下第四道封锁线，妄图将红军“围歼”于江东。\n这是长征以来最残酷的一战——江面炮火密布，两岸阵地反复拉锯，红军将士以血肉之躯撕开突破口。你作为红三军团作战参谋，伴随部队冲锋在最前线，每一个决策都关乎全军的生死存亡。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1文本（与瑞金长度相近）
    scene1FullText: "11月25日，指挥部内气氛凝重，彭德怀指着地图：'两条路：一是强渡全州段湘江，江面窄但敌防守密；二是迂回灌阳山区，避锋芒但误时间。'你的建议将决定全军走向",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2文本（与瑞金长度相近）
    scene2FullText: "11月27日，渡口激战正酣。红一军团1师阵地告急，林彪急报：'要么调红三军团4师支援，要么收缩阵地保浮桥。'你的决策将直接影响中央纵队能否安全过江。",
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,

    // 场景3文本（与瑞金长度相近）
    scene3FullText: "11月29日，大部分红军已过江，东岸仍有300余人和重要文件滞留。周恩来焦急万分：'必须决定转移方案！'是优先保证人还是物资？你的选择将影响红军最后的'家底'。",
    scene3TypedText: "",
    isScene3Typing: false,
    scene3TypingTimer: null,

    // 结局文本（与瑞金长度相近）
    resultFullText: "湘江战役最终以红军突破封锁线告终，但代价惨烈 ——从8.6万人锐减至3万余人，无数战士长眠湘江两岸。\n 这场血战让党和红军痛悟'左'倾错误的危害，为遵义会议确立毛泽东同志领导地位埋下伏笔。当地民谣唱道'英雄血染湘江渡，江底尽埋英烈骨'，红军用生命铸就的不屈精神，永远照亮革命征程。",
    resultTypedText: "",
    isResultTyping: false,
    resultTypingTimer: null
  },

  onLoad() {
    if (this.data.currentStep === 0) {
      this.startBackgroundTyping();
    }
  },

  // 背景页打字机方法
  startBackgroundTyping() {
    const fullText = this.data.backgroundFullText;
    let index = 0;
    this.setData({
      isTyping: true,
      backgroundTypedText: ''
    });

    const timer = setInterval(() => {
      if (index < fullText.length) {
        this.setData({
          backgroundTypedText: fullText.substring(0, index + 1)
        });
        index++;
      } else {
        clearInterval(timer);
        this.setData({
          isTyping: false,
          typingTimer: null
        });
      }
    }, 80);

    this.setData({ typingTimer: timer });
  },

  // 通用打字机方法
  startTyping(scene) {
    const fullText = this.data[`${scene}FullText`];
    let index = 0;
    
    this.setData({
      [`is${scene.charAt(0).toUpperCase() + scene.slice(1)}Typing`]: true,
      [`${scene}TypedText`]: ""
    });

    if (this.data[`${scene}TypingTimer`]) {
      clearInterval(this.data[`${scene}TypingTimer`]);
    }

    const timer = setInterval(() => {
      if (index < fullText.length) {
        this.setData({
          [`${scene}TypedText`]: fullText.substring(0, index + 1)
        });
        index++;
      } else {
        clearInterval(timer);
        this.setData({
          [`is${scene.charAt(0).toUpperCase() + scene.slice(1)}Typing`]: false,
          [`${scene}TypingTimer`]: null
        });
      }
    }, 80);

    this.setData({
      [`${scene}TypingTimer`]: timer
    });
  },

  // 场景1点击逻辑
  handleScene1Click() {
    if (!this.data.showResult) return;

    if (this.data.showBack) {
      this.setData({ 
        showResult: false, 
        showBack: false, 
        showNext: false,
        scene1TypedText: this.data.scene1FullText,
        isScene1Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 2, showResult: false, showBack: false, showNext: false });
      this.startTyping("scene2");
    }
  },

  // 场景2点击逻辑
  handleScene2Click() {
    if (!this.data.showResult) return;

    if (this.data.showBack) {
      this.setData({ 
        showResult: false, 
        showBack: false, 
        showNext: false,
        scene2TypedText: this.data.scene2FullText,
        isScene2Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 3, showResult: false, showBack: false, showNext: false });
      this.startTyping("scene3");
    }
  },

  // 场景3点击逻辑
  handleScene3Click() {
    if (!this.data.showResult) return;

    if (this.data.showBack) {
      this.setData({ 
        showResult: false, 
        showBack: false, 
        showNext: false,
        scene3TypedText: this.data.scene3FullText,
        isScene3Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 4, showResult: false, showBack: false, showNext: false });
      this.startTyping("result");
    }
  },

  // 处理选项选择
  handleChoice(e) {
    const nextStep = parseInt(e.currentTarget.dataset.nextstep);
    const result = e.currentTarget.dataset.result;

    this.data.history.push(this.data.currentStep);
    this.setData({
      showResult: true,
      resultText: result,
      showBack: nextStep === -1,
      showNext: nextStep > this.data.currentStep
    });
  },

  // 返回上一步
  goBack() {
    const lastStep = this.data.history.pop();
    if (lastStep !== undefined) {
      this.setData({
        currentStep: lastStep,
        showResult: false,
        showBack: false,
        showNext: false
      });
      if (lastStep === 1) {
        this.setData({ scene1TypedText: this.data.scene1FullText, isScene1Typing: false });
      }
      if (lastStep === 2) {
        this.setData({ scene2TypedText: this.data.scene2FullText, isScene2Typing: false });
      }
      if (lastStep === 3) {
        this.setData({ scene3TypedText: this.data.scene3FullText, isScene3Typing: false });
      }
    }
  },

  // 背景页进入场景1
  goNext() {
    if (this.data.isTyping) return;

    this.setData({ currentStep: 1, showResult: false, showBack: false, showNext: false });
    this.startTyping("scene1");
  },

  // 返回首页
  goHome() {
    wx.redirectTo({ url: '/pages/index/index' });
  },

  // 页面卸载时清除计时器
  onUnload() {
    if (this.data.typingTimer) clearInterval(this.data.typingTimer);
    if (this.data.scene1TypingTimer) clearInterval(this.data.scene1TypingTimer);
    if (this.data.scene2TypingTimer) clearInterval(this.data.scene2TypingTimer);
    if (this.data.scene3TypingTimer) clearInterval(this.data.scene3TypingTimer);
    if (this.data.resultTypingTimer) clearInterval(this.data.resultTypingTimer);
  }
});