Page({
  data: {
    currentStep: 0,
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '/images/index/会宁会师.jpg',

    // 背景页文本
    backgroundFullText: `1936年10月，红一、二、四方面军即将在甘肃会宁胜利会师，这是长征的终点，也是中国革命的里程碑。你作为红一方面军宣传干事，随先头部队抵达会宁城外，负责会师筹备，需消除群众疑虑，确保会师顺利。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1：群众宣传
    scene1FullText: "1936年10月，会宁城外。首长交给你任务：当地老乡因国民党宣传对红军陌生，需制定宣传方案，让群众了解会师意义。",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2：会师仪式筹备
    scene2FullText: "群众工作有了进展，会宁城充满期待。首长让你确定会师仪式筹备的优先级，需在物资和场地中选一项优先保障。",
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,

    // 场景3：会师后行动方向
    scene3FullText: "10月10日，三大主力胜利会师，全城欢腾。但国民党军仍在周边部署重兵，首长让你参与讨论下一步行动方向。",
    scene3TypedText: "",
    isScene3Typing: false,
    scene3TypingTimer: null,

    // 结局文本
    resultFullText: "会宁会师标志着长征胜利结束，粉碎了国民党围歼企图，保存了革命基干力量。这场会师开创了中国革命新局面，为民族解放照亮了道路，是中国革命史上的伟大丰碑。",
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