Page({
  data: {
    currentStep: 0,
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '',
    
    // 背景页打字效果相关变量
    backgroundFullText: `1934年10月，中央苏区在国民党军队第五次“围剿”下岌岌可危。因“左”倾错误军事路线，红军作战接连失利，苏区日益缩小，粮弹匮乏。为保存革命力量，党中央决定战略转移，开启长征。\n你是红一方面军某团作战参谋，站在瑞金叶坪村村口，望着即将出征的战士——他们背着简陋步枪，揣着少量干粮，有的在写最后一封家信。你手持尚未最终确定的行军计划，关乎红军命运的抉择，正由你开启。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1打字效果
    scene1FullText: "你走进团部临时指挥部，桌上摊着两份路线方案，团长等你给出建议。时间紧迫，每一秒都可能影响部队安危，你必须快速且慎重地选择。",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2打字效果
    scene2FullText: "确定向西南方向出发后，你需协调当地群众准备渡河物资。后勤班长汇报：目前筹集到的物资有限，只能优先保障一项关键需求，你要做出决定。",
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,

    // 场景3打字效果
    scene3FullText: "渡河前，团长让你向全团战士传达行军纪律。你需要确定纪律传达的重点。",
    scene3TypedText: "",
    isScene3Typing: false,
    scene3TypingTimer: null,

    // 结局页打字效果
    resultFullText: "你成功完成了瑞金出发阶段的关键决策，为红军后续的行军奠定了良好基础。尽管长征的征途漫长且充满艰险，但红军将士们凭借着坚定的革命信念、灵活的战略战术以及人民群众的鼎力支持，必将在这条伟大的道路上奋勇前进，书写人类历史上的奇迹篇章。",
    resultTypedText: "",
    isResultTyping: false,
    resultTypingTimer: null
  },

  async onLoad() {
    try {
      // const backgroundImageUrl = await getApp().getImageUrl('瑞金出发.jpg');
      // this.setData({ backgroundImageUrl });
      this.setData({ 
        backgroundImageUrl: '/images/index/瑞金出发.jpg'
      });
    } catch (error) {
      console.error('背景图片加载失败:', error);
    }

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
      this.setData({
        currentStep: 2,
        showResult: false,
        showBack: false,
        showNext: false
      });
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
      this.setData({
        currentStep: 3,
        showResult: false,
        showBack: false,
        showNext: false
      });
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
      this.setData({
        currentStep: 4,
        showResult: false,
        showBack: false,
        showNext: false
      });
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
        this.setData({
          scene1TypedText: this.data.scene1FullText,
          isScene1Typing: false
        });
      }
      if (lastStep === 2) {
        this.setData({
          scene2TypedText: this.data.scene2FullText,
          isScene2Typing: false
        });
      }
      if (lastStep === 3) {
        this.setData({
          scene3TypedText: this.data.scene3FullText,
          isScene3Typing: false
        });
      }
    }
  },

  // 背景页进入场景1
  goNext() {
    if (this.data.isTyping) return;

    this.setData({
      showResult: false,
      showBack: false,
      showNext: false,
      currentStep: 1
    });
    this.startTyping("scene1");
  },

  // 返回首页
  goHome() {
    wx.redirectTo({ url: '/pages/index/index' });
  },

  // 页面卸载时清除所有计时器
  onUnload() {
    if (this.data.typingTimer) clearInterval(this.data.typingTimer);
    if (this.data.scene1TypingTimer) clearInterval(this.data.scene1TypingTimer);
    if (this.data.scene2TypingTimer) clearInterval(this.data.scene2TypingTimer);
    if (this.data.scene3TypingTimer) clearInterval(this.data.scene3TypingTimer);
    if (this.data.resultTypingTimer) clearInterval(this.data.resultTypingTimer);
  }
});