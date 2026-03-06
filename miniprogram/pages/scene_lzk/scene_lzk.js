Page({
  data: {
    currentStep: 0,
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '/images/index/腊子口战役.jpg',

    // 背景页文本
    backgroundFullText: `1935年9月，中央红军面临生死考验：腊子口天险横亘眼前，两侧悬崖峭壁，中间仅数米隘口，敌军一个营凭险据守，山顶还有一个旅援军赶来。身后是紧追的敌军，你作为红四团作战参谋，必须在天亮前突破防线，决定红军北上通道的存亡。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1：天险腊子口
    scene1FullText: "1935年9月16日，腊子口外。团长指着地图：“隘口正面宽30米，桥面只剩一根木梁，敌军一个营死守，山顶援军快到了！必须天亮前突破！”你需提出攻坚方案。",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2：悬崖攀登的准备
    scene2FullText: "确定“正面佯攻+侧翼迂回”战术，后勤汇报攀登器材有限，只能优先准备一种关键装备。你需决定优先保障的需求。",
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,

    // 场景3：总攻时机的选择
    scene3FullText: "凌晨3点，迂回部队已登悬崖但需调整，正面部队弹药将尽，东方泛白，敌军援军只剩20公里。你需建议总攻时机。",
    scene3TypedText: "",
    isScene3Typing: false,
    scene3TypingTimer: null,

    // 结局文本
    resultFullText: "腊子口战役是红军长征关键一战。在你的决策下，红四团突破天险，粉碎国民党围歼企图，为北上开辟通道。正如毛泽东所说：“腊子口一战，打出了红军威风，打开了北上通道。”",
    resultTypedText: "",
    isResultTyping: false,
    resultTypingTimer: null
  },

  onLoad() {
    if (this.data.currentStep === 0) {
      this.startBackgroundTyping();
    }
  },

  // 背景页打字机
  startBackgroundTyping() {
    const fullText = this.data.backgroundFullText;
    let index = 0;
    this.setData({ isTyping: true, backgroundTypedText: '' });

    const timer = setInterval(() => {
      if (index < fullText.length) {
        this.setData({ backgroundTypedText: fullText.substring(0, index + 1) });
        index++;
      } else {
        clearInterval(timer);
        this.setData({ isTyping: false, typingTimer: null });
      }
    }, 80);
    this.setData({ typingTimer: timer });
  },

  // 通用打字机
  startTyping(scene) {
    const fullText = this.data[`${scene}FullText`];
    let index = 0;
    this.setData({
      [`is${scene.charAt(0).toUpperCase() + scene.slice(1)}Typing`]: true,
      [`${scene}TypedText`]: ""
    });

    if (this.data[`${scene}TypingTimer`]) clearInterval(this.data[`${scene}TypingTimer`]);
    const timer = setInterval(() => {
      if (index < fullText.length) {
        this.setData({ [`${scene}TypedText`]: fullText.substring(0, index + 1) });
        index++;
      } else {
        clearInterval(timer);
        this.setData({
          [`is${scene.charAt(0).toUpperCase() + scene.slice(1)}Typing`]: false,
          [`${scene}TypingTimer`]: null
        });
      }
    }, 80);
    this.setData({ [`${scene}TypingTimer`]: timer });
  },

  // 场景1点击逻辑
  handleScene1Click() {
    if (!this.data.showResult) return;
    if (this.data.showBack) {
      this.setData({ 
        showResult: false, showBack: false, showNext: false,
        scene1TypedText: this.data.scene1FullText, isScene1Typing: false
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
        showResult: false, showBack: false, showNext: false,
        scene2TypedText: this.data.scene2FullText, isScene2Typing: false
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
        showResult: false, showBack: false, showNext: false,
        scene3TypedText: this.data.scene3FullText, isScene3Typing: false
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
      if (lastStep === 1) this.setData({ scene1TypedText: this.data.scene1FullText, isScene1Typing: false });
      if (lastStep === 2) this.setData({ scene2TypedText: this.data.scene2FullText, isScene2Typing: false });
      if (lastStep === 3) this.setData({ scene3TypedText: this.data.scene3FullText, isScene3Typing: false });
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

  // 页面卸载清除计时器
  onUnload() {
    Object.keys(this.data).forEach(key => {
      if (key.includes('TypingTimer') && this.data[key]) clearInterval(this.data[key]);
    });
  }
});