Page({
  data: {
    currentStep: 0,
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '/images/index/遵义会议.jpg',
    
    // 背景页文本（与湘江模板长度一致）
    backgroundFullText: `1935年1月，中央红军突破乌江天险抵达遵义城。此时红军从长征出发时的8.6万人锐减至3万余人，连续的军事失利让部队士气低落，“左”倾错误军事路线的危害日益凸显。\n这是决定党和红军命运的关键节点——前有敌军堵截，后有追兵紧逼，内部路线分歧亟待解决。你作为红军总部作战参谋，亲历了一路的艰难突围，将在这场生死攸关的会议中参与关键决策。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1文本（与湘江模板长度一致）
    scene1FullText: "会议召开前夜，毛泽东找到你了解前线思想动态，直言：'两条路：一是先解决物资短缺，向群众征集粮弹；二是直击核心，检讨军事路线错误。'你的回答将为会议定调",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2文本（与湘江模板长度一致）
    scene2FullText: "会中，博古坚持第五次反“围剿”失败是客观原因，毛泽东则系统批判错误指挥。当讨论是否撤销博古、李德指挥权时，请你发表意见。",
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,

    // 场景3文本（与湘江模板长度一致）
    scene3FullText: "会议选举毛泽东为中央政治局常委，新领导集体面临首要问题：进军方向。周恩来指着地图：'要么硬攻长江北岸，要么迂回川黔边境。'你的建议将影响红军未来走向。",
    scene3TypedText: "",
    isScene3Typing: false,
    scene3TypingTimer: null,

    // 结局文本（与湘江模板长度一致）
    resultFullText: "遵义会议在极其危急的历史关头，挽救了党，挽救了红军，挽救了中国革命，是中国共产党历史上一个生死攸关的转折点。\n 这场会议标志着党开始独立自主运用马克思主义解决自身问题，确立了毛泽东同志在党中央和红军的领导地位，为四渡赤水、巧渡金沙江等胜利奠定基础，开启了中国革命的新征程。",
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
