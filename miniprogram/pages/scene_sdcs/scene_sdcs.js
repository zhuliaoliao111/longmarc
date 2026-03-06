Page({
  data: {
    currentStep: 0,
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '/images/index/四渡赤水.jpg',

    // 背景页文本（扩充至瑞金模板长度）
    backgroundFullText: `1935年1月，遵义会议结束后，中国工农红军面临着前所未有的严峻局面。蒋介石调集40万重兵，从四面八方向红军合围而来，企图将这支刚刚经历战略转移、兵力锐减至3万余人的革命力量彻底消灭。土城战斗中，红军原本计划歼灭川军郭勋祺部，却不料遭遇敌军增援部队突袭，战斗陷入胶着，伤亡逐渐增多，弹药和物资也日益匮乏。赤水河畔雾气弥漫，东岸的枪炮声越来越近，敌军的包围圈不断缩小，你作为红军总部的作战参谋，站在仅有的几艘木船旁，深刻明白此刻每一个决策都将直接关系到红军的生死存亡和中国革命的未来走向。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1文本（扩充至瑞金模板长度）
    scene1FullText: "1935年遵义会议后，红军遭40万敌军围堵。土城战斗失利，弹药告急，赤水河畔杀机四伏，你作为作战参谋，决策关乎全军生死。",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2文本（扩充至瑞金模板长度）
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,
    scene2FullText: "1935年1月29日，毛泽东分析：“川军封锁北上路，硬拼必败。要么强攻突破，要么西渡赤水向川南转移，避开锋芒寻战机。”",

    // 场景3文本（扩充至瑞金模板长度）
    scene3FullText: "1935年3月，红军重占遵义后遭合围。蒋介石预判我军东渡乌江，毛泽东笑道：“偏要西进，是东渡乌江还是三渡赤水引敌西追？”",
    scene3TypedText: "",
    isScene3Typing: false,
    scene3TypingTimer: null,

    // 场景4文本（扩充至瑞金模板长度）
    scene4FullText: "1935年3月下旬，红军三渡赤水引敌西调。彭德怀急报：“敌军主力西去，是西进决战，还是四渡赤水南突乌江？”",
    scene4TypedText: "",
    isScene4Typing: false,
    scene4TypingTimer: null,

    // 结局文本（扩充至瑞金模板长度）
    resultFullText: "四渡赤水是红军战争史上以少胜多、灵活机动的经典战例。1935 年 1 月至 3 月，在毛泽东等同志指挥下，红军历时三月四次渡赤水，穿插于 40 万敌军之间。秉持 “声东击西、避实击虚” 方针，多次跳出包围圈，粉碎蒋介石围歼企图，保存了有生力量，为长征胜利奠基，彰显了高超军事指挥艺术，让红军摆脱被动、开启战略转移新篇章。",
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

  // 通用打字机
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
      this.startTyping("scene4");
    }
  },

  // 场景4点击逻辑
  handleScene4Click() {
    if (!this.data.showResult) return;

    if (this.data.showBack) {
      this.setData({ 
        showResult: false, 
        showBack: false, 
        showNext: false,
        scene4TypedText: this.data.scene4FullText,
        isScene4Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 5, showResult: false, showBack: false, showNext: false });
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
      if (lastStep === 4) {
        this.setData({ scene4TypedText: this.data.scene4FullText, isScene4Typing: false });
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
    if (this.data.scene4TypingTimer) clearInterval(this.data.scene4TypingTimer);
    if (this.data.resultTypingTimer) clearInterval(this.data.resultTypingTimer);
  }
});