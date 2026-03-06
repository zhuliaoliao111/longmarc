Page({
  data: {
    currentStep: 0, 
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '/images/index/强渡大渡河.jpg', 

    // 背景页文本
    backgroundFullText: `1935年5月，中央红军冲破金沙江天险后，面临着又一道生死考验——强渡大渡河。大渡河两岸峭壁林立，水流湍急，蒋介石调集10万重兵，扬言要让红军成为“石达开第二”。此时红军仅剩下3万余人，疲惫不堪且弹药匮乏，而安顺场渡口仅有3条木船，对岸还驻守着川军的精锐部队，你作为红一军团的作战参谋，将参与这场决定红军命运的关键战役。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1文本（生死突击）
    scene1FullText: "1935年5月25日拂晓，十七勇士登上木船，赵章成的迫击炮是唯一重火力，却仅4发炮弹。刚出发，敌军机枪就疯狂扫射，即将登岸时，敌军涌出反扑，你向孙继先营长提出建议：",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2文本（巩固渡口）
    scene2FullText: "十七勇士成功登岸并夺取滩头阵地，北岸敌军残部退守山腰。南岸红军主力等待渡河，但渡口危机未消——敌军随时可能反扑，薛岳追兵日益逼近。刘伯承师长询问你下一步部署：",
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,

    // 结局文本
    resultFullText: "强渡大渡河是红军长征中的又一经典战例。十七勇士凭借无畏勇气，在仅有3条木船、4发炮弹的情况下，突破敌军严防死守的渡口；后续部队迅速巩固阵地，保障全军顺利渡河。这场胜利彻底粉碎了蒋介石的围歼企图，彰显了红军“不怕牺牲、敢于胜利”的革命精神，为飞夺泸定桥、继续北上奠定了坚实基础，成为中国革命史上的光辉一页。",
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
    if (this.data.resultTypingTimer) clearInterval(this.data.resultTypingTimer);
  }
});